"use server";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

export async function updateSolution(formData: FormData) {
  const problemId = formData.get("problemId") as string;
  const code = formData.get("code") as string;
  const explanation = formData.get("explanation") as string;

  const updatedSolution = await prisma.solution.upsert({
    where: { problemId },
    update: { code, explanation },
    create: { problemId, code, explanation },
  });

  revalidatePath(`/problems/${problemId}`);

  return updatedSolution;
}
