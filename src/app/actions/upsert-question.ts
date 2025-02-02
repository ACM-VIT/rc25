"use server";

import { Storage } from "@google-cloud/storage";
import { prisma } from "@/utils/prisma";

const uploadToGCS = async (
  file: File | null,
  filename: string
): Promise<string> => {
  if (!file) return "";

  try {
    const credentialsEnv = process.env.GCP_CREDENTIALS;
    if (!credentialsEnv) {
      throw new Error("GCP_CREDENTIALS environment variable is not set");
    }
    const credentials = JSON.parse(credentialsEnv);

    const storage = new Storage({
      credentials,
      projectId: credentials.project_id,
    });

    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName) {
      throw new Error("GCS_BUCKET environment variable is not set");
    }
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await blob.save(buffer, {
      contentType: file.type,
    });

    return `https://storage.googleapis.com/${bucketName}/${filename}`;
  } catch (error) {
    console.error("GCS Upload Error:", error);
    throw error;
  }
};

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
    const maxScore = Number.parseInt(formData.get("maxScore") as string);
    const webCode = formData.get("web_code") as string;
    const normalCases = Number.parseInt(formData.get("normal_cases") as string) || 0;
    const edgeCases = Number.parseInt(formData.get("edge_cases") as string) || 0;

    const winFile = formData.get("windows") as File;
    const macFile = formData.get("mac") as File;
    const linFile = formData.get("linux") as File;

    const winUrl = await uploadToGCS(winFile, `Question_${title}.exe`);
    const macUrl = await uploadToGCS(macFile, `Question_${title}.mac`);
    const linUrl = await uploadToGCS(linFile, `Question_${title}.lin`);

    const data = {
      title,
      nickname,
      description,
      difficulty,
      maxScore,
      web_code: webCode,
      roundId,
      lin_dl: linUrl || "",
      mac_dl: macUrl || "",
      win_dl: winUrl || "",
      normal_cases: normalCases,
      edge_cases: edgeCases,
    };

    if (questionId) {
      await prisma.problem.update({
        where: { id: questionId },
        data
      });
    } else {
      await prisma.problem.create({ data });
    }
  } catch (error) {
    console.error("Error handling question:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
