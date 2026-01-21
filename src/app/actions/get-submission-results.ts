'use server'

import { db } from "@/db";
import { submissions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function getSubmissionResults(submissionId: string) {
    const rows = await db
        .select({
            submission: submissions,
            userName: users.name,
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.userId, users.id))
        .where(eq(submissions.id, submissionId))
        .limit(1);

    const row = rows[0];
    if (!row) {
        throw new Error("Submission not found");
    }

    return {
        ...row.submission,
        user: {
            name: row.userName,
        },
    };
}
