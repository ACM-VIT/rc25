"use server"

import { prisma } from "@/utils/prisma";

export default async function deleteAllTestCases(problemId: string) {


  try {
    await prisma.testcase.deleteMany({
      where: {
        problemId: problemId,
      },
    });
  } catch (error) {
    console.error("Error deleting all test cases:", error);
    throw error;
  }
}