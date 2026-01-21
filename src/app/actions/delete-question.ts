"use server";

import { db } from "@/db";
import { problems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    await db.delete(problems).where(eq(problems.id, questionId));
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}
