"use server"

import { db } from "@/db";
import { testcases } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function deleteAllTestCases(problemId: string) {


  try {
    await db.delete(testcases).where(eq(testcases.problemId, problemId));
  } catch (error) {
    console.error("Error deleting all test cases:", error);
    throw error;
  }
}
