"use server";

import { db } from "@/db";
import { problems } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function hideQuestion(
    problemId: string,
    hide: boolean
): Promise<void> {
    await db
        .update(problems)
        .set({ isHidden: hide })
        .where(eq(problems.id, problemId));
}
