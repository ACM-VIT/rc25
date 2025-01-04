"use server";

import { prisma } from "@/utils/prisma";

export default async function deleteTestCase(
  testcaseId: string
): Promise<void> {
  await prisma.testcase.delete({
    where: {
      id: testcaseId,
    },
  });
}
