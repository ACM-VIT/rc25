'use server'

import { prisma } from "@/utils/prisma"
import { revalidatePath } from "next/cache"

export async function updateFlag(name: string, value: boolean) {
  try {
    await prisma.flags.update({
      where: { name },
      data: { value }
    })
    revalidatePath('/flags')
    return { success: true }
  } catch (error) {
    console.error('Error updating flag:', error)
    return { success: false }
  }
}