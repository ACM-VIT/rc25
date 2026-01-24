"use server";

import { db } from "@/db";
import {
  problems,
  rounds,
  submissions,
  submissionTestcases,
  testcases,
  teams,
  users,
} from "@/db/schema";
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
import { eq } from "drizzle-orm";

// Map language to template function
const languageTemplates = {
  python: pythonFunction,
  c: cFunction,
  cpp: cppFunction,
  java: javaFunction,
  javascript: jsFunction,
  go: goFunction,
  rust: rustFunction,
} as const;

// Add this helper to remove duplicated imports from final code
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
  try {
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
      const currentTime = new Date();
      if (currentTime < round.start) {
        throw new Error("Round has not started yet");
      }
      if (currentTime > round.end) {
        throw new Error("Round has ended");
      }
    }

    // Get all testcases
    const allTestcases = await db
      .select()
      .from(testcases)
      .where(eq(testcases.problemId, data.problemId));

    // Split into normal and edge cases
    const normalCases = allTestcases.filter((tc) => !tc.isEdge);
    const edgeCases = allTestcases.filter((tc) => tc.isEdge);

    // Function to randomly select n items from array
    const getRandomElements = <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    // console.log(problem.normal_cases, problem.edge_cases);

    // Access scalar fields directly because they are always returned
    const selectedNormalCases = getRandomElements(
      normalCases,
      problem.normal_cases,
    );
    const selectedEdgeCases = getRandomElements(edgeCases, problem.edge_cases);

    // Combine all selected testcases
    const selectedTestcases = [...selectedNormalCases, ...selectedEdgeCases];

    // Stabilize ordering for evaluation by ordering selected cases
    const orderedTestcases = [...selectedTestcases].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );

    // console.log(selectedTestcases);

    // Create submission record
    const [submission] = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(submissions)
        .values({
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

      if (orderedTestcases.length) {
        await tx.insert(submissionTestcases).values(
          orderedTestcases.map((tc) => ({
            testcaseId: tc.id,
            submissionId: created.id,
            passed: false,
          })),
        );
      }

      return [created];
    });

    const combinedInput = orderedTestcases.map((tc) => tc.input);

    // console.log("combinedInput: ", combinedInput);

    // Get number of testcases
    const numTestcases = orderedTestcases.length;

    // Transform code using appropriate template
    const templateFunction = languageTemplates[data.language];
    let transformedCode = templateFunction(data.code);

    // Remove duplicated imports from the final code
    transformedCode = removeDuplicateImports(transformedCode, data.language);

    // console.log("code: \n", transformedCode);

    // Submit to Judge0
    const judgeResult = await judgeSolution(
      transformedCode,
      data.language,
      combinedInput,
      submission.id,
    );

    // console.log("judge submit", judgeResult);

    if (!judgeResult.success) {
      return {
        success: false,
        error: judgeResult.error,
      };
    }

    const [primaryToken] = judgeResult.tokens || [];
    if (!primaryToken) {
      return {
        success: false,
        error: "No submission tokens received",
      };
    }

    await db
      .update(submissions)
      .set({ token: primaryToken })
      .where(eq(submissions.id, submission.id));

    return {
      success: true,
      submission: {
        ...submission,
        totalTestcases: numTestcases,
        user: { name: user?.name ?? null },
      },
      token: primaryToken,
      tokens: judgeResult.tokens,
    };
  } catch (error: unknown) {
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
