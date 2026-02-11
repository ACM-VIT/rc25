'use server'

import { db } from "@/db";
import { flags } from "@/db/schema";
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm";

export async function updateFlag(name: string, value: boolean) {
  try {
    await db.update(flags).set({ value }).where(eq(flags.name, name));
    revalidatePath('/flags')
    return { success: true }
  } catch (error) {
    console.error('Error updating flag:', error)
    return { success: false }
  }
}
