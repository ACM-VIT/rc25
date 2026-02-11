import { createWebhook } from "workflow";
import { db } from "@/db";
import {
  problems,
  rounds,
  submissions,
  submissionTestcases,
  testcases,
  teams,
  users,
  solve,
} from "@/db/schema";
import type { SupportedLanguage } from "@/utils/judge0-langs";
import { SUPPORTED_LANGUAGES } from "@/utils/judge0-langs";
import {
  pythonFunction,
  cFunction,
  cppFunction,
  javaFunction,
  jsFunction,
  goFunction,
  rustFunction,
} from "@/utils/funcconvert";
import { and, eq, lt } from "drizzle-orm";
import { Redis } from "@upstash/redis";
import {
  type Judge0StatusEnumValue,
  judge0StatusToEval,
} from "@/utils/judge0-status";
import {
  calculateCurrentPoints,
  calculateSolveContribution,
} from "@/db/scoring";
import type { LeaderboardEvent, QuestionEvent } from "@/lib/realtime";
import { firestoreService } from "@/lib/firebase-admin-service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubmissionInput {
  code: string;
  problemId: string;
  userId: string;
  language: SupportedLanguage;
}

interface SelectedTestcase {
  id: string;
  input: string;
  output: string;
  isEdge: boolean | null;
  isHidden: boolean | null;
  orderIndex: number | null;
  weight: number;
  problemId: string;
}

interface PreparedData {
  submissionId: string;
  problemId: string;
  teamId: string;
  userId: string;
  language: SupportedLanguage;
  encodedCode: string;
  languageId: number;
  orderedTestcases: SelectedTestcase[];
  problemConfig: {
    initial: number;
    minimum: number;
    decay: number;
  };
}

interface Judge0WebhookBody {
  stdout: string | null;
  time: number | null;
  memory: number | null;
  stderr: string | null;
  token: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: Judge0StatusEnumValue };
}

interface TestcaseResult {
  testcaseId: string;
  webhookBody: Judge0WebhookBody;
}

interface CallbackUrlEntry {
  testcaseId: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Language templates
// ---------------------------------------------------------------------------

const languageTemplates: Record<SupportedLanguage, (code: string) => string> = {
  python: pythonFunction,
  c: cFunction,
  cpp: cppFunction,
  java: javaFunction,
  javascript: jsFunction,
  go: goFunction,
  rust: rustFunction,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

const normalizeOutput = (value: string | null | undefined) =>
  (value ?? "").replace(/\r\n/g, "\n").trimEnd();

const getRedis = () => {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return Redis.fromEnv();
  }
  return null;
};

// ---------------------------------------------------------------------------
// Leaderboard helpers
// ---------------------------------------------------------------------------

type SolveLeaderboardRow = {
  problemId: string;
  teamId: string;
  testcasesPassed: number;
};

async function getEffectiveSolves(problemId: string): Promise<number> {
  const redis = getRedis();
  const redisValue =
    redis !== null ? Number((await redis.get(problemId)) ?? NaN) : NaN;
  return Number.isFinite(redisValue) ? redisValue : 0;
}

async function buildLeaderboard(
  solveRows: SolveLeaderboardRow[],
): Promise<LeaderboardEvent> {
  const effectiveSolvesByProblem = new Map<string, number>();
  for (const row of solveRows) {
    const contribution = calculateSolveContribution(row.testcasesPassed);
    effectiveSolvesByProblem.set(
      row.problemId,
      (effectiveSolvesByProblem.get(row.problemId) ?? 0) + contribution,
    );
  }

  const problemIds = Array.from(effectiveSolvesByProblem.keys());
  if (!problemIds.length) return [];

  const problemRows = await db
    .select({
      id: problems.id,
      initial: problems.initial,
      minimum: problems.minimum,
      decay: problems.decay,
    })
    .from(problems);

  const effectiveSolveEntries = await Promise.all(
    problemRows.map(async (problem) => {
      const effectiveSolves = await getEffectiveSolves(problem.id);
      const currentPoints = calculateCurrentPoints({
        initial: problem.initial,
        minimum: problem.minimum,
        decay: problem.decay,
        effectiveSolves,
      });
      return [problem.id, currentPoints] as const;
    }),
  );

  const currentPointsByProblem = new Map(effectiveSolveEntries);
  const teamScores = new Map<string, number>();

  for (const row of solveRows) {
    const currentPoints = currentPointsByProblem.get(row.problemId);
    if (currentPoints === undefined) continue;
    const contribution = calculateSolveContribution(row.testcasesPassed);
    const score = Math.round(currentPoints * contribution);
    teamScores.set(row.teamId, (teamScores.get(row.teamId) ?? 0) + score);
  }

  const adminTeamId = process.env.ADMIN_TEAM_ID ?? "";
  const teamRows = await db
    .select({
      id: teams.id,
      name: teams.name,
      hidden: teams.hidden,
      disqualify: teams.disqualify,
    })
    .from(teams);

  return teamRows
    .filter(
      (team) => !team.hidden && !team.disqualify && team.id !== adminTeamId,
    )
    .map((team) => ({
      id: team.id,
      name: team.name,
      score: teamScores.get(team.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });
}

async function buildQuestionEvent(
  problemId: string,
): Promise<QuestionEvent | null> {
  const problemRows = await db
    .select({
      id: problems.id,
      title: problems.title,
      initial: problems.initial,
      minimum: problems.minimum,
      decay: problems.decay,
    })
    .from(problems)
    .where(eq(problems.id, problemId))
    .limit(1);

  const problem = problemRows[0];
  if (!problem) return null;

  const effectiveSolves = await getEffectiveSolves(problem.id);

  return {
    id: problem.id,
    problem: problem.title,
    points: calculateCurrentPoints({
      initial: problem.initial,
      minimum: problem.minimum,
      decay: problem.decay,
      effectiveSolves,
    }),
  };
}

// ---------------------------------------------------------------------------
// Judge0 HTTP helpers
// ---------------------------------------------------------------------------

const DEFAULT_JUDGE0_BASE_URLS = [
  "https://ce.judge0.com",
  "https://extra-ce.judge0.com",
];

const JUDGE0_BASE_URLS = Array.from(
  new Set(
    [
      process.env.JUDGE0_BASE_URL?.replace(/\/$/, ""),
      ...DEFAULT_JUDGE0_BASE_URLS,
    ]
      .filter(Boolean)
      .map(String),
  ),
);

function createJudge0Headers(
  includeContentType = false,
): Record<string, string> {
  const clientId = process.env.JUDGE0_CLIENT_ID;
  const clientSecret = process.env.JUDGE0_CLIENT_SECRET;

  if (!clientId) {
    throw new Error(
      "JUDGE0_CLIENT_ID is not defined in environment variables.",
    );
  }
  if (!clientSecret) {
    throw new Error(
      "JUDGE0_CLIENT_SECRET is not defined in environment variables.",
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Judge0-Client-ID": clientId,
    "X-Judge0-Client-Secret": clientSecret,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function requestWithFallback(
  path: string,
  init: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (const baseUrl of JUDGE0_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, init);
      if (response.ok || response.status < 500) return response;
      lastError = new Error(
        `Judge0 request failed with status ${response.status} (${response.statusText})`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to reach Judge0 endpoints");
}

// =========================================================================
// WORKFLOW
// =========================================================================
//
// submissionWorkflow orchestrates the full lifecycle of a code submission:
//
//   Step 1 (fetchAndPrepare)
//     Validates user/team/round, selects testcases, transforms code,
//     creates submission + submissionTestcase DB records.
//     Returns all serialised data needed by later steps.
//
//   Webhook creation + Step 2 (sendToJudge0)
//     Creates one webhook per testcase (workflow-level suspension
//     primitives), then sends the Judge0 batch request with per-testcase
//     callback URLs pointing to those webhooks.
//
//   Webhook await (Promise.all)
//     The workflow suspends here – zero compute consumed – until every
//     Judge0 callback has arrived.
//
//   Step 3 (evaluateAndStore)
//     Processes every Judge0 result using the serialised data from Step 1
//     (no repeated DB reads for question/testcase data). Updates
//     submissionTestcase rows, aggregates passed count, upserts solve
//     records, recalculates leaderboard, and emits realtime events.
//

export async function submissionWorkflow(input: SubmissionInput) {
  "use workflow";

  // ----- Step 1: Fetch & Prepare ------------------------------------------
  const prepared = await fetchAndPrepare(input);

  // ----- Create one webhook per testcase (workflow-level primitives) -------
  const webhooks = prepared.orderedTestcases.map((tc) => ({
    testcaseId: tc.id,
    webhook: createWebhook({
      token: `judge0_${prepared.submissionId}_${tc.id}`,
    }),
  }));

  // Collect callback URLs to pass into the Judge0 submission step
  const callbackUrls: CallbackUrlEntry[] = webhooks.map((w) => ({
    testcaseId: w.testcaseId,
    url: w.webhook.url,
  }));

  // ----- Step 2: Send batch to Judge0 with per-testcase callback URLs -----
  await sendToJudge0(prepared, callbackUrls);

  // ----- Await all Judge0 callbacks (workflow suspension) ------------------
  const results: TestcaseResult[] = await Promise.all(
    webhooks.map(async ({ testcaseId, webhook }) => {
      const request = await webhook;
      const body: Judge0WebhookBody = await request.json();
      return { testcaseId, webhookBody: body };
    }),
  );

  // ----- Step 3: Evaluate all results & store -----------------------------
  await evaluateAndStore(prepared, results);
}

// =========================================================================
// STEP 1 – Fetch & Prepare
// =========================================================================

async function fetchAndPrepare(input: SubmissionInput): Promise<PreparedData> {
  "use step";

  const { code, problemId, userId, language } = input;

  // Fetch problem + round
  const problemRows = await db
    .select({ problem: problems, round: rounds })
    .from(problems)
    .leftJoin(rounds, eq(problems.roundId, rounds.id))
    .where(eq(problems.id, problemId))
    .limit(1);

  const problem = problemRows[0]?.problem ?? null;
  const round = problemRows[0]?.round ?? null;

  if (!problem || !round) {
    throw new Error("Problem not found");
  }

  // Fetch user + team
  const userRows = await db
    .select({ user: users, team: teams })
    .from(users)
    .leftJoin(teams, eq(users.teamId, teams.id))
    .where(eq(users.id, userId))
    .limit(1);

  const userTeam = userRows[0]?.team ?? null;

  if (!userTeam) {
    throw new Error("User is not part of any team");
  }
  if (userTeam.disqualify) {
    throw new Error("User's team has been disqualified");
  }

  // Round timing check (skip for admin team)
  if (userTeam.id !== process.env.ADMIN_TEAM_ID) {
    const currentTime = new Date();
    if (currentTime < round.start) {
      throw new Error("Round has not started yet");
    }
    if (currentTime > round.end) {
      throw new Error("Round has ended");
    }
  }

  // Select testcases
  const allTestcases = await db
    .select()
    .from(testcases)
    .where(eq(testcases.problemId, problemId));

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

  // Transform code
  const templateFunction = languageTemplates[language];
  let transformedCode = templateFunction(code);
  transformedCode = removeDuplicateImports(transformedCode, language);
  const encodedCode = Buffer.from(transformedCode, "utf-8").toString("base64");
  const languageId = SUPPORTED_LANGUAGES[language].id;

  // Create submission + submissionTestcase records
  const submissionId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(submissions)
      .values({
        id: submissionId,
        code,
        language,
        problemId,
        userId,
        teamId: userTeam.id,
        testcasesPassed: 0,
        evaluated: false,
      })
      .returning();

    const created = inserted[0];
    if (!created) throw new Error("Failed to create submission");

    if (orderedTestcases.length) {
      await tx.insert(submissionTestcases).values(
        orderedTestcases.map((tc) => ({
          testcaseId: tc.id,
          submissionId: created.id,
          passed: false,
          // Placeholder token – updated with real Judge0 token in step 2
          token: `pending_${created.id}_${tc.id}`,
        })),
      );
    }
  });

  await firestoreService.submissions.created(submissionId);

  return {
    submissionId,
    problemId,
    teamId: userTeam.id,
    userId,
    language,
    encodedCode,
    languageId,
    orderedTestcases,
    problemConfig: {
      initial: problem.initial,
      minimum: problem.minimum,
      decay: problem.decay,
    },
  };
}

// =========================================================================
// STEP 2 – Send to Judge0
// =========================================================================

async function sendToJudge0(
  prepared: PreparedData,
  callbackUrls: CallbackUrlEntry[],
): Promise<void> {
  "use step";

  const { submissionId, encodedCode, languageId, orderedTestcases } = prepared;

  // Build per-testcase Judge0 submissions with unique callback URLs
  const judge0Submissions = orderedTestcases.map((tc) => {
    const entry = callbackUrls.find((e) => e.testcaseId === tc.id);
    if (!entry) throw new Error(`No callback URL for testcase ${tc.id}`);

    return {
      language_id: languageId,
      source_code: encodedCode,
      stdin: Buffer.from(tc.input ?? "", "utf-8").toString("base64"),
      callback_url: entry.url,
    };
  });

  // Send batch to Judge0
  const postResponse = await requestWithFallback(
    "/submissions/batch?base64_encoded=true",
    {
      method: "POST",
      headers: createJudge0Headers(true),
      body: JSON.stringify({ submissions: judge0Submissions }),
    },
  );

  if (!postResponse.ok) {
    const errorPayload = await postResponse.text();
    throw new Error(
      `Judge0 submission failed with status ${postResponse.status}: ${errorPayload}`,
    );
  }

  const postResult = await postResponse.json();
  if (!Array.isArray(postResult) || postResult.length === 0) {
    throw new Error("No submission tokens received from Judge0");
  }

  const tokens: string[] = postResult
    .map((item: { token?: string }) => item?.token)
    .filter((t): t is string => Boolean(t));

  if (tokens.length !== orderedTestcases.length) {
    throw new Error("Token count does not match number of testcases");
  }

  // Update submissionTestcase rows with real Judge0 tokens
  await Promise.all(
    orderedTestcases.map((tc, index) =>
      db
        .update(submissionTestcases)
        .set({ token: tokens[index] })
        .where(
          and(
            eq(submissionTestcases.submissionId, submissionId),
            eq(submissionTestcases.testcaseId, tc.id),
          ),
        ),
    ),
  );
}

// =========================================================================
// STEP 3 – Evaluate & Store
// =========================================================================

async function evaluateAndStore(
  prepared: PreparedData,
  results: TestcaseResult[],
): Promise<void> {
  "use step";

  const { submissionId, problemId, teamId, orderedTestcases } = prepared;
  const redis = getRedis();

  let passedCount = 0;

  // Process each testcase result and update submissionTestcases rows
  for (const result of results) {
    const { testcaseId, webhookBody } = result;
    const { stdout, stderr, compile_output, status, time, memory } =
      webhookBody;

    const evaluationStatus = judge0StatusToEval(status.description);
    const expectedTestcase = orderedTestcases.find(
      (tc) => tc.id === testcaseId,
    );

    if (compile_output) {
      await db
        .update(submissionTestcases)
        .set({
          evaluated: true,
          evaluationStatus,
          passed: false,
          errorMessage: compile_output,
          actualOutput: null,
          executionTimeMs: time,
          memoryUsedKb: memory,
        })
        .where(
          and(
            eq(submissionTestcases.submissionId, submissionId),
            eq(submissionTestcases.testcaseId, testcaseId),
          ),
        );
      continue;
    }

    if (stderr) {
      await db
        .update(submissionTestcases)
        .set({
          evaluated: true,
          evaluationStatus,
          passed: false,
          errorMessage: stderr,
          actualOutput: null,
          executionTimeMs: time,
          memoryUsedKb: memory,
        })
        .where(
          and(
            eq(submissionTestcases.submissionId, submissionId),
            eq(submissionTestcases.testcaseId, testcaseId),
          ),
        );
      continue;
    }

    // Successful execution – compare output
    const decodedStdout = stdout
      ? Buffer.from(stdout, "base64").toString("utf-8")
      : "";
    const expectedOutput = normalizeOutput(expectedTestcase?.output);
    const actualOutput = normalizeOutput(decodedStdout);
    const passed = actualOutput === expectedOutput;

    if (passed) passedCount++;

    await db
      .update(submissionTestcases)
      .set({
        evaluated: true,
        evaluationStatus,
        executionTimeMs: time,
        memoryUsedKb: memory,
        actualOutput,
        passed,
        errorMessage: null,
      })
      .where(
        and(
          eq(submissionTestcases.submissionId, submissionId),
          eq(submissionTestcases.testcaseId, testcaseId),
        ),
      );
  }

  // Update the submission aggregate
  await db
    .update(submissions)
    .set({
      testcasesPassed: passedCount,
      evaluated: true,
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId));

  await firestoreService.submissions.processed(submissionId);

  // -----------------------------------------------------------------------
  // Solve record upsert (concurrency-safe)
  // -----------------------------------------------------------------------
  if (passedCount <= 0) return;

  const solveRows = await db
    .select({
      id: solve.id,
      problemId: solve.problemId,
      teamId: solve.teamId,
      bestSubmissionId: solve.bestSubmissionId,
      testcasesPassed: solve.testcasesPassed,
    })
    .from(solve);

  const teamSolve = solveRows.find(
    (row) => row.problemId === problemId && row.teamId === teamId,
  );

  let solveChanged = false;

  if (!teamSolve) {
    // First solve for this team / problem
    const insertedSolveRows = await db
      .insert(solve)
      .values({
        problemId,
        teamId,
        bestSubmissionId: submissionId,
        testcasesPassed: passedCount,
      })
      .onConflictDoNothing()
      .returning({ id: solve.id });

    if (insertedSolveRows[0]) {
      if (redis) {
        const contribution = calculateSolveContribution(passedCount);
        const currentValue = Number((await redis.get(problemId)) ?? 0);
        await redis.set(problemId, currentValue + contribution);
      }
      solveChanged = true;
    } else {
      // Concurrent insert – fall through to conditional update
      const latestSolveRows = await db
        .select({ id: solve.id, testcasesPassed: solve.testcasesPassed })
        .from(solve)
        .where(and(eq(solve.problemId, problemId), eq(solve.teamId, teamId)))
        .limit(1);

      const latestSolve = latestSolveRows[0];
      if (!latestSolve || passedCount <= latestSolve.testcasesPassed) return;

      const updatedSolveRows = await db
        .update(solve)
        .set({ testcasesPassed: passedCount, bestSubmissionId: submissionId })
        .where(
          and(
            eq(solve.id, latestSolve.id),
            eq(solve.testcasesPassed, latestSolve.testcasesPassed),
            lt(solve.testcasesPassed, passedCount),
          ),
        )
        .returning({ id: solve.id });

      if (!updatedSolveRows[0]) return;

      if (redis) {
        const gainedTestcases = passedCount - latestSolve.testcasesPassed;
        const contribution = calculateSolveContribution(gainedTestcases);
        const currentValue = Number((await redis.get(problemId)) ?? 0);
        await redis.set(problemId, currentValue + contribution);
      }
      solveChanged = true;
    }
  } else {
    // Existing solve – only update if this submission is an improvement
    if (passedCount <= teamSolve.testcasesPassed) return;

    const improvedSolveRows = await db
      .update(solve)
      .set({ testcasesPassed: passedCount, bestSubmissionId: submissionId })
      .where(
        and(
          eq(solve.id, teamSolve.id),
          eq(solve.testcasesPassed, teamSolve.testcasesPassed),
          lt(solve.testcasesPassed, passedCount),
        ),
      )
      .returning({ id: solve.id });

    if (!improvedSolveRows[0]) return;

    if (redis) {
      const gainedTestcases = passedCount - teamSolve.testcasesPassed;
      const contribution = calculateSolveContribution(gainedTestcases);
      const currentValue = Number((await redis.get(problemId)) ?? 0);
      await redis.set(problemId, currentValue + contribution);
    }
    solveChanged = true;
  }

  // -----------------------------------------------------------------------
  // Leaderboard recalculation
  // -----------------------------------------------------------------------
  if (!solveChanged) return;

  const refreshedSolveRows = await db
    .select({
      problemId: solve.problemId,
      teamId: solve.teamId,
      testcasesPassed: solve.testcasesPassed,
    })
    .from(solve);

  const leaderboard = await buildLeaderboard(refreshedSolveRows);
  const question = await buildQuestionEvent(problemId);

  if (!redis) return;

  const emitRealtime = async () => {
    const { realtime } = await import("@/lib/realtime");
    const channel = realtime.channel("leaderboard");
    // The array is pre-sorted by rank; index order is ranking order.
    await channel.emit("leaderboard", leaderboard);
    if (question) {
      await channel.emit("question", question);
    }
  };

  try {
    await emitRealtime();
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("WRONGTYPE")) {
      try {
        await emitRealtime();
        return;
      } catch (retryError: unknown) {
        console.error("Failed to emit realtime leaderboard", retryError);
        return;
      }
    }
    console.error("Failed to emit realtime leaderboard", error);
  }
}
