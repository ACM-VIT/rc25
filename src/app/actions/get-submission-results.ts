'use server'

import { db } from "@/db";
import { problems, submissions, users } from "@/db/schema";
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

    return {
        ...row.submission,
        totalTestcases: (row.normalCases ?? 0) + (row.edgeCases ?? 0),
        user: {
            name: row.userName,
        },
    };
}
