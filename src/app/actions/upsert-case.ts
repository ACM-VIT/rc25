"use server";

import { db } from "@/db";
import { testcases } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function addTestCase(
  problemId: string,
  weight: number,
  input: string,
  output: string,
  isEdge: boolean,
  testcaseId?: string
): Promise<void> {
  if (testcaseId) {
    await db
      .update(testcases)
      .set({
        weight,
        input,
        output,
        isEdge,
        problemId,
      })
      .where(eq(testcases.id, testcaseId));
    return;
  }

  await db.insert(testcases).values({
    weight,
    input,
    output,
    isEdge,
    problemId,
  });
}
