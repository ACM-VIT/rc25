"use server";

import {executeCode} from "@/utils/server-executor";
import {prisma} from "@/utils/prisma";

export async function runCode(problemId: string,input: string) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });
    
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
