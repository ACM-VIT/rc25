"use server";

import { createHash } from "node:crypto";
import { db } from "@/db";
import {
  problems,
  rounds,
  submissions,
  submissionTestcases,
  teams,
  testcases,
  users,
} from "@/db/schema";
import { getRedis } from "@/lib/redis";
import { and, desc, eq, gt } from "drizzle-orm";
import type { SupportedLanguage } from "@/utils/judge0-langs";
import { judgeSolution } from "./submit-code";
import {
  pythonFunction,
  cFunction,
  cppFunction,
  javaFunction,
  jsFunction,
  goFunction,
  rustFunction,
} from "@/utils/funcconvert";

const SUBMISSION_DEDUPE_WINDOW_SECONDS = 15;
const SUBMISSION_DEDUPE_WINDOW_MS = SUBMISSION_DEDUPE_WINDOW_SECONDS * 1000;

const languageTemplates: Record<SupportedLanguage, (code: string) => string> = {
  python: pythonFunction,
  c: cFunction,
  cpp: cppFunction,
  java: javaFunction,
  javascript: jsFunction,
  go: goFunction,
  rust: rustFunction,
};

type OptimisticSubmission = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  evaluated: boolean;
  testcasesPassed: number;
  totalTestcases: number;
  user: { name: string | null };
};

const buildOptimisticSubmission = ({
  id,
  totalTestcases,
  userName,
  createdAt = new Date(),
  updatedAt = new Date(),
  evaluated = false,
  testcasesPassed = 0,
}: {
  id: string;
  totalTestcases: number;
  userName: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  evaluated?: boolean;
  testcasesPassed?: number;
}): OptimisticSubmission => ({
  id,
  createdAt,
  updatedAt,
  evaluated,
  testcasesPassed,
  totalTestcases,
  user: { name: userName },
});

const buildSubmissionDedupeKey = ({
  userId,
  problemId,
  language,
  code,
}: {
  userId: string;
  problemId: string;
  language: SupportedLanguage;
  code: string;
}) => {
  const hash = createHash("sha256")
    .update(`${userId}:${problemId}:${language}:${code}`)
    .digest("hex");

  return `submission:dedupe:${hash}`;
};

function removeDuplicateImports(
  code: string,
  language: SupportedLanguage,
): string {
  const importPatterns: Partial<Record<SupportedLanguage, RegExp[]>> = {
    cpp: [/#include\s*<[^>]+>/g],
    java: [/import\s+[^;]+;/g],
    python: [/^from\s+[\w.]+\s+import\s+.*$/gm, /^import\s+.*$/gm],
    go: [/^import\s*\([^)]*\)/gm, /^import\s+".*?"$/gm],
    rust: [
      /^use\s+[^;]+;/gm,
      /^use\s+[^{]+\{[^}]+\};/gm,
      /^use\s+[^:]+::[^;]+;/gm,
    ],
  };

  if (!importPatterns[language]) return code;

  const patterns = importPatterns[language] || [];
  const allImports = new Set<string>();

  let cleanCode = code;
  for (const pattern of patterns) {
    const matches = cleanCode.match(pattern) || [];
    for (const match of matches) {
      allImports.add(match.trim());
    }
    cleanCode = cleanCode.replace(pattern, "");
  }

  let importSection = "";
  if (language === "go" && allImports.size > 0) {
    importSection = `import (\n  ${Array.from(allImports).join("\n  ")}\n)\n`;
  } else if (allImports.size > 0) {
    importSection = `${Array.from(allImports).join("\n")}\n`;
  }

  return importSection + cleanCode.trim();
}

export default async function createSubmission(data: {
  code: string;
  problemId: string;
  userId: string;
  language: SupportedLanguage;
}) {
  const redis = getRedis();
  let dedupeKey: string | null = null;
  let dedupeLockHeld = false;

  try {
    // Quick validation for immediate UI feedback – the workflow's step 1
    // performs the same checks, but doing them here lets us return errors
    // synchronously to the client without starting a workflow run.
    const problemRows = await db
      .select({ problem: problems, round: rounds })
      .from(problems)
      .leftJoin(rounds, eq(problems.roundId, rounds.id))
      .where(eq(problems.id, data.problemId))
      .limit(1);

    const problem = problemRows[0]?.problem ?? null;
    const round = problemRows[0]?.round ?? null;

    if (!problem || !round) {
      throw new Error("Problem not found");
    }

    const userRows = await db
      .select({ user: users, team: teams })
      .from(users)
      .leftJoin(teams, eq(users.teamId, teams.id))
      .where(eq(users.id, data.userId))
      .limit(1);

    const user = userRows[0]?.user ?? null;
    const userTeam = userRows[0]?.team ?? null;

    if (!userTeam) {
      throw new Error("User is not part of any team");
    }

    if (userTeam.disqualify) {
      throw new Error("User's team has been disqualified");
    }

    if (userTeam.id !== process.env.ADMIN_TEAM_ID) {
      const now = new Date();
      if (now < round.start) {
        throw new Error("Round has not started yet");
      }
      if (now > round.end) {
        throw new Error("Round has ended");
      }
    }

    const totalTestcases = problem.normal_cases + problem.edge_cases;
    const duplicateCutoff = new Date(Date.now() - SUBMISSION_DEDUPE_WINDOW_MS);

    const findRecentDuplicate = async () => {
      const recentDuplicateRows = await db
        .select({
          id: submissions.id,
          createdAt: submissions.createdAt,
          updatedAt: submissions.updatedAt,
          evaluated: submissions.evaluated,
          testcasesPassed: submissions.testcasesPassed,
        })
        .from(submissions)
        .where(
          and(
            eq(submissions.userId, data.userId),
            eq(submissions.problemId, data.problemId),
            eq(submissions.teamId, userTeam.id),
            eq(submissions.language, data.language),
            eq(submissions.code, data.code),
            eq(submissions.evaluated, false),
            gt(submissions.createdAt, duplicateCutoff),
          ),
        )
        .orderBy(desc(submissions.createdAt))
        .limit(1);

      return recentDuplicateRows[0] ?? null;
    };

    const recentDuplicate = await findRecentDuplicate();
    if (recentDuplicate) {
      return {
        success: true,
        submission: buildOptimisticSubmission({
          id: recentDuplicate.id,
          createdAt: recentDuplicate.createdAt,
          updatedAt: recentDuplicate.updatedAt,
          evaluated: recentDuplicate.evaluated,
          testcasesPassed: recentDuplicate.testcasesPassed,
          totalTestcases,
          userName: user?.name ?? null,
        }),
      };
    }

    dedupeKey = buildSubmissionDedupeKey({
      userId: data.userId,
      problemId: data.problemId,
      language: data.language,
      code: data.code,
    });

    if (redis) {
      try {
        const lockResult = await redis.set(dedupeKey, "1", {
          nx: true,
          ex: SUBMISSION_DEDUPE_WINDOW_SECONDS,
        });

        if (lockResult !== "OK") {
          const lockedDuplicate = await findRecentDuplicate();
          if (lockedDuplicate) {
            return {
              success: true,
              submission: buildOptimisticSubmission({
                id: lockedDuplicate.id,
                createdAt: lockedDuplicate.createdAt,
                updatedAt: lockedDuplicate.updatedAt,
                evaluated: lockedDuplicate.evaluated,
                testcasesPassed: lockedDuplicate.testcasesPassed,
                totalTestcases,
                userName: user?.name ?? null,
              }),
            };
          }

          return {
            success: false,
            error:
              "A matching submission is already being processed. Please wait a few seconds and retry.",
          };
        }

        dedupeLockHeld = true;
      } catch (redisError) {
        console.error("Submission dedupe lock unavailable, continuing", redisError);
      }
    }

    const allTestcases = await db
      .select()
      .from(testcases)
      .where(eq(testcases.problemId, data.problemId));

    const normalCases = allTestcases.filter((tc) => !tc.isEdge);
    const edgeCases = allTestcases.filter((tc) => tc.isEdge);

    const getRandomElements = <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const selectedNormalCases = getRandomElements(
      normalCases,
      problem.normal_cases,
    );
    const selectedEdgeCases = getRandomElements(edgeCases, problem.edge_cases);
    const orderedTestcases = [...selectedNormalCases, ...selectedEdgeCases].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );

    const combinedInput = orderedTestcases.map((tc) => tc.input);
    if (!combinedInput.length) {
      throw new Error("No testcases available for this problem");
    }

    const submissionId = crypto.randomUUID();
    const templateFunction = languageTemplates[data.language];
    let transformedCode = templateFunction(data.code);
    transformedCode = removeDuplicateImports(transformedCode, data.language);

    const judgeResult = await judgeSolution(
      transformedCode,
      data.language,
      combinedInput,
      submissionId,
    );

    if (!judgeResult.success) {
      throw new Error(judgeResult.error || "Submission failed");
    }

    const tokens = judgeResult.tokens || [];
    if (tokens.length === 0) {
      throw new Error("No submission tokens received");
    }
    if (tokens.length !== orderedTestcases.length) {
      throw new Error("Token count does not match number of testcases");
    }

    const [createdSubmission] = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(submissions)
        .values({
          id: submissionId,
          code: data.code,
          language: data.language,
          problemId: data.problemId,
          userId: data.userId,
          teamId: userTeam.id,
          testcasesPassed: 0,
          evaluated: false,
        })
        .returning();

      const created = inserted[0];
      if (!created) {
        throw new Error("Failed to create submission");
      }

      await tx.insert(submissionTestcases).values(
        orderedTestcases.map((tc, index) => ({
          testcaseId: tc.id,
          submissionId: created.id,
          passed: false,
          token: tokens[index]!,
        })),
      );

      return [created];
    });

    return {
      success: true,
      submission: buildOptimisticSubmission({
        id: createdSubmission.id,
        createdAt: createdSubmission.createdAt,
        updatedAt: createdSubmission.updatedAt,
        evaluated: createdSubmission.evaluated,
        testcasesPassed: createdSubmission.testcasesPassed,
        totalTestcases,
        userName: user?.name ?? null,
      }),
    };
  } catch (error: unknown) {
    if (dedupeLockHeld && dedupeKey && redis) {
      try {
        await redis.del(dedupeKey);
      } catch (redisError) {
        console.error("Failed to release submission dedupe lock", redisError);
      }
    }

    console.error(
      "Error creating submission:",
      error instanceof Error ? error : String(error),
    );

    return {
      success: false,
      error: `Submission creation failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}
