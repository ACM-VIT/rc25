'use server'

import { db } from "@/db";
import { problems, submissions, submissionTestcases, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function getSubmissionResults(submissionId: string) {
    const rows = await db
        .select({
            submission: submissions,
            userName: users.name,
            normalCases: problems.normal_cases,
            edgeCases: problems.edge_cases,
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.userId, users.id))
        .innerJoin(problems, eq(submissions.problemId, problems.id))
        .where(eq(submissions.id, submissionId))
        .limit(1);

    const row = rows[0];
    if (!row) {
        throw new Error("Submission not found");
    }

    // Derive overall evaluationStatus from individual testcase statuses
    let evaluationStatus: string | null = null;
    if (row.submission.evaluated) {
        const testcaseRows = await db
            .select({ evaluationStatus: submissionTestcases.evaluationStatus })
            .from(submissionTestcases)
            .where(eq(submissionTestcases.submissionId, submissionId));

        const statuses = testcaseRows.map((r) => r.evaluationStatus).filter(Boolean);
        if (statuses.some((s) => s === "COMPILATION_ERROR")) {
            evaluationStatus = "COMPILATION_ERROR";
        } else if (statuses.some((s) => s?.startsWith("RUNTIME_ERROR"))) {
            evaluationStatus = statuses.find((s) => s?.startsWith("RUNTIME_ERROR")) ?? "RUNTIME_ERROR";
        } else if (row.submission.testcasesPassed === (row.normalCases ?? 0) + (row.edgeCases ?? 0)) {
            evaluationStatus = "ACCEPTED";
        } else {
            evaluationStatus = "WRONG_ANSWER";
        }
    }

    return {
        ...row.submission,
        evaluationStatus,
        totalTestcases: (row.normalCases ?? 0) + (row.edgeCases ?? 0),
        user: {
            name: row.userName,
        },
    };
}
