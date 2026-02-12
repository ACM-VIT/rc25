// @ts-nocheck
import { describe, expect, it } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { start } from "workflow/api";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { problems } from "@/db/schema";
import {
  submissionWorkflow,
  type SubmissionInput,
} from "@/workflows/submission";
import type { SupportedLanguage } from "@/utils/judge0-langs";

const USER_ID = "ac823b30-5965-4bcf-9edc-2da4e709dbfe";
const DATA_DIR = path.resolve(process.cwd(), "data");

const FILE_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  "main.py": "python",
  "main.java": "java",
  "index.js": "javascript",
};

async function findProblemIdByFolderName(folderName: string): Promise<string> {
  const rows = await db
    .select({ id: problems.id })
    .from(problems)
    .where(
      and(
        eq(problems.isHidden, false),
        or(eq(problems.nickname, folderName), eq(problems.title, folderName)),
      ),
    )
    .limit(1);

  const problemId = rows[0]?.id;
  if (!problemId) {
    throw new Error(`Problem not found for folder: ${folderName}`);
  }

  return problemId;
}

describe("bulk workflow trigger from data folder", () => {
  it("triggers submission workflow for each problem folder", async () => {
    const entries = await readdir(DATA_DIR, { withFileTypes: true });
    const problemFolders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    let dispatchCount = 0;

    for (const folder of problemFolders) {
      const folderPath = path.join(DATA_DIR, folder);
      const problemId = await findProblemIdByFolderName(folder);

      for (const [fileName, language] of Object.entries(FILE_TO_LANGUAGE)) {
        const sourcePath = path.join(folderPath, fileName);
        let code: string;

        try {
          code = await readFile(sourcePath, "utf8");
        } catch {
          continue;
        }

        const input: SubmissionInput = {
          submissionId: crypto.randomUUID(),
          code,
          problemId,
          userId: USER_ID,
          language,
        };

        await start(submissionWorkflow, [input]);
        dispatchCount += 1;

        console.log(
          `[submission-test] dispatched problem=${folder} language=${language} submissionId=${input.submissionId}`,
        );
      }
    }

    expect(dispatchCount).toBeGreaterThan(0);
  }, 300_000);
});
