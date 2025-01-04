"use server";

import { prisma } from "@/utils/prisma";

export default async function addTestCase(
  problemId: string,
  weight: number,
  input: string,
  output: string,
  isEdge: boolean,
  testcaseId?: string
): Promise<void> {
  await prisma.testcase.upsert({
    where: {
      id: testcaseId || '', // Use an empty string if testcaseId is not provided
    },
    create: {
      weight,
      input,
      output,
      isEdge,
      problem: {
        connect: {
          id: problemId,
        },
      },
    },
    update: {
      weight,
      input,
      output,
      isEdge,
      problem: {
        connect: {
          id: problemId,
        },
      },
    },
  });
}