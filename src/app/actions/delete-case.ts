"use server";

import { db } from "@/db";
import { testcases } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function deleteTestCase(
  testcaseId: string
): Promise<void> {
  await db.delete(testcases).where(eq(testcases.id, testcaseId));
}
