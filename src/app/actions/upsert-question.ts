"use server";

import { db } from "@/db";
import { problems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function handleQuestionSubmit(
  formData: FormData,
  questionId?: string
): Promise<void> {
  try {
    const title = formData.get("title") as string;
    const nickname = formData.get("nickname") as string;
    const description = formData.get("description") as string;
    const difficulty = formData.get("difficulty") as "EASY" | "MEDIUM" | "HARD";
    const roundId = formData.get("roundId") as string;
    const initial = Number.parseInt(formData.get("initial") as string);
    const minimum = Number.parseInt(formData.get("minimum") as string);
    const decay = Number.parseInt(formData.get("decay") as string);
    const webCode = formData.get("web_code") as string;
    const normalCases = Number.parseInt(formData.get("normal_cases") as string) || 0;
    const edgeCases = Number.parseInt(formData.get("edge_cases") as string) || 0;

    const data = {
      title,
      nickname,
      description,
      difficulty,
      initial: Number.isFinite(initial) ? initial : 0,
      minimum: Number.isFinite(minimum) ? minimum : 0,
      decay: Number.isFinite(decay) && decay > 0 ? decay : 1,
      web_code: webCode,
      roundId,
      normal_cases: normalCases,
      edge_cases: edgeCases,
    };

    if (questionId) {
      await db.update(problems).set(data).where(eq(problems.id, questionId));
    } else {
      await db.insert(problems).values(data);
    }
  } catch (error) {
    console.error("Error handling question:", error);
    throw error;
  }
}
