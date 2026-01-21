"use server";

import {executeCode} from "@/utils/server-executor";
import { db } from "@/db";
import { problems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function runCode(problemId: string,input: string) {
  try {
    const problemRows = await db
      .select({ web_code: problems.web_code })
      .from(problems)
      .where(eq(problems.id, problemId))
      .limit(1);
    const problem = problemRows[0];
    
    if (!problem?.web_code) {
      throw new Error("Problem code is undefined");
    }
    return executeCode(problem.web_code, input);
  } catch (error) {
    return {
      success: false,
      output: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
