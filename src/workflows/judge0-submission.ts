import { defineHook } from "workflow";
import { db } from "@/db";
import {
  problems,
  submissions,
  submissionTestcases,
  testcases,
  teams,
  solve,
} from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { Redis } from "@upstash/redis";
import {
  Judge0StatusEnumValue,
  judge0StatusToEval,
} from "@/utils/judge0-status";
import type {
  SupportedLanguageId,
  SupportedLanguageName,
} from "@/utils/judge0-langs";
import {
  calculateCurrentPoints,
  calculateSolveContribution,
} from "@/db/scoring";
import type { LeaderboardEvent, QuestionEvent } from "@/lib/realtime";
import { firestoreService } from "@/lib/firebase-admin-service";

export interface Judge0Response {
  stdout: string | null;
  time: number | null;
  memory: number | null;
  stderr: string | null;
  token: string | null;
  compile_output: string | null;
  message: string | null;
  status: Judge0Status;
  language_id?: SupportedLanguageId;
  language?: Judge0Language;
}

interface Judge0Status {
  id: number;
  description: Judge0StatusEnumValue;
}

interface Judge0Language {
  id: SupportedLanguageId;
  name: SupportedLanguageName;
}

export interface Judge0HookPayload {
  response: Judge0Response;
  submissionId?: string;
  testcaseId?: string;
  testcaseIndex?: string;
}

const normalizeOutput = (value: string | null | undefined) =>
  (value ?? "").replace(/\r\n/g, "\n").trimEnd();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

type SolveLeaderboardRow = {
  problemId: string;
  teamId: string;
  testcasesPassed: number;
};

const buildEffectiveSolvesMap = (solveRows: SolveLeaderboardRow[]) => {
  const effectiveSolvesByProblem = new Map<string, number>();

  for (const row of solveRows) {
    const contribution = calculateSolveContribution(row.testcasesPassed);
    effectiveSolvesByProblem.set(
      row.problemId,
      (effectiveSolvesByProblem.get(row.problemId) ?? 0) + contribution,
    );
  }

  return effectiveSolvesByProblem;
};

const getEffectiveSolves = async (problemId: string): Promise<number> => {
  const redisValue =
    redis !== null ? Number((await redis.get(problemId)) ?? NaN) : NaN;
  return Number.isFinite(redisValue) ? redisValue : 0;
};

const buildLeaderboard = async (
  solveRows: SolveLeaderboardRow[],
): Promise<LeaderboardEvent> => {
  const effectiveSolvesFromRows = buildEffectiveSolvesMap(solveRows);
  const problemIds = Array.from(effectiveSolvesFromRows.keys());

  if (!problemIds.length) {
    return [];
  }

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
    if (currentPoints === undefined) {
      continue;
    }

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
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.name.localeCompare(b.name);
    });
};

const buildQuestionEvent = async (
  problemId: string,
): Promise<QuestionEvent | null> => {
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
  if (!problem) {
    return null;
  }

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
};

export const judge0CallbackHook = defineHook<Judge0HookPayload>();

export const buildJudge0HookToken = (submissionId: string, testcaseId: string) =>
  `judge0:submission:${submissionId}:testcase:${testcaseId}`;

export async function finalizeJudge0SubmissionWorkflow(
  submissionId: string,
  hookTokens: string[],
) {
  "use workflow";

  const hooks = hookTokens.map((hookToken) =>
    judge0CallbackHook.create({ token: hookToken }),
  );
  const callbackPayloads = await Promise.all(hooks.map((hook) => hook));

  await finalizeSubmissionAfterCallbacks(submissionId, callbackPayloads);
}

async function finalizeSubmissionAfterCallbacks(
  submissionId: string,
  callbackPayloads: Judge0HookPayload[],
) {
  "use step";

  const submissionRows = await db
    .select({
      id: submissions.id,
      problemId: submissions.problemId,
      teamId: submissions.teamId,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  const submission = submissionRows[0];
  if (!submission) {
    return;
  }

  const submissionTestcaseRows = await db
    .select({
      submissionTestcase: submissionTestcases,
      testcase: testcases,
    })
    .from(submissionTestcases)
    .leftJoin(testcases, eq(submissionTestcases.testcaseId, testcases.id))
    .where(eq(submissionTestcases.submissionId, submissionId));

  const testcaseByJudgeToken = new Map(
    submissionTestcaseRows
      .filter((row) => Boolean(row.submissionTestcase.token))
      .map((row) => [row.submissionTestcase.token as string, row] as const),
  );
  const testcaseById = new Map(
    submissionTestcaseRows.map((row) => [row.submissionTestcase.testcaseId, row]),
  );

  for (const payload of callbackPayloads) {
    const response = payload.response;
    const judgeToken = response.token;
    const row =
      (judgeToken ? testcaseByJudgeToken.get(judgeToken) : undefined) ??
      (payload.testcaseId ? testcaseById.get(payload.testcaseId) : undefined);
    if (!row) {
      continue;
    }

    const evaluationStatus = judge0StatusToEval(response.status.description);
    const { compile_output, stderr, stdout, time, memory } = response;

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
        .where(eq(submissionTestcases.id, row.submissionTestcase.id));
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
        .where(eq(submissionTestcases.id, row.submissionTestcase.id));
      continue;
    }

    const decodedStdout = stdout
      ? Buffer.from(stdout, "base64").toString("utf-8")
      : "";

    const expectedOutput = normalizeOutput(row.testcase?.output);
    const actualOutput = normalizeOutput(decodedStdout);
    const passed = actualOutput === expectedOutput;

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
      .where(eq(submissionTestcases.id, row.submissionTestcase.id));
  }

  const finalizedTestcaseRows = await db
    .select({
      evaluated: submissionTestcases.evaluated,
      passed: submissionTestcases.passed,
    })
    .from(submissionTestcases)
    .where(eq(submissionTestcases.submissionId, submissionId));

  const allEvaluated = finalizedTestcaseRows.every((row) => row.evaluated);
  if (!allEvaluated) {
    return;
  }

  const passedCount = finalizedTestcaseRows.filter((row) => row.passed).length;

  await db
    .update(submissions)
    .set({
      testcasesPassed: passedCount,
      evaluated: true,
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId));

  await firestoreService.submissions.processed(submissionId);

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
    (row) =>
      row.problemId === submission.problemId && row.teamId === submission.teamId,
  );
  const solveLogContext = {
    submissionId,
    teamId: submission.teamId,
    problemId: submission.problemId,
    passedCount,
  };
  let solveChanged = false;

  if (!teamSolve) {
    if (passedCount <= 0) {
      return;
    }

    const insertedSolveRows = await db
      .insert(solve)
      .values({
        problemId: submission.problemId,
        teamId: submission.teamId,
        bestSubmissionId: submissionId,
        testcasesPassed: passedCount,
      })
      .onConflictDoNothing()
      .returning({ id: solve.id });

    if (insertedSolveRows[0]) {
      if (redis) {
        const contribution = calculateSolveContribution(passedCount);
        const currentValue = Number((await redis.get(submission.problemId)) ?? 0);
        await redis.set(submission.problemId, currentValue + contribution);
      }
      solveChanged = true;
    } else {
      const latestSolveRows = await db
        .select({
          id: solve.id,
          testcasesPassed: solve.testcasesPassed,
        })
        .from(solve)
        .where(
          and(
            eq(solve.problemId, submission.problemId),
            eq(solve.teamId, submission.teamId),
          ),
        )
        .limit(1);

      const latestSolve = latestSolveRows[0];
      if (!latestSolve) {
        console.error("Solve row missing after conflict", solveLogContext);
        return;
      }

      if (passedCount <= latestSolve.testcasesPassed) {
        return;
      }

      const updatedSolveRows = await db
        .update(solve)
        .set({
          testcasesPassed: passedCount,
          bestSubmissionId: submissionId,
        })
        .where(
          and(
            eq(solve.id, latestSolve.id),
            eq(solve.testcasesPassed, latestSolve.testcasesPassed),
            lt(solve.testcasesPassed, passedCount),
          ),
        )
        .returning({ id: solve.id });

      if (!updatedSolveRows[0]) {
        console.warn("Solve update skipped due to concurrent improvement", {
          ...solveLogContext,
          previousBest: latestSolve.testcasesPassed,
        });
        return;
      }

      if (redis) {
        const gainedTestcases = passedCount - latestSolve.testcasesPassed;
        const contribution = calculateSolveContribution(gainedTestcases);
        const currentValue = Number((await redis.get(submission.problemId)) ?? 0);
        await redis.set(submission.problemId, currentValue + contribution);
      }
      solveChanged = true;
    }
  } else {
    if (passedCount <= teamSolve.testcasesPassed) {
      return;
    }

    const improvedSolveRows = await db
      .update(solve)
      .set({
        testcasesPassed: passedCount,
        bestSubmissionId: submissionId,
      })
      .where(
        and(
          eq(solve.id, teamSolve.id),
          eq(solve.testcasesPassed, teamSolve.testcasesPassed),
          lt(solve.testcasesPassed, passedCount),
        ),
      )
      .returning({ id: solve.id });

    if (!improvedSolveRows[0]) {
      console.warn("Solve update skipped due to concurrent callback", {
        ...solveLogContext,
        previousBest: teamSolve.testcasesPassed,
      });
      return;
    }

    if (redis) {
      const gainedTestcases = passedCount - teamSolve.testcasesPassed;
      const contribution = calculateSolveContribution(gainedTestcases);
      const currentValue = Number((await redis.get(submission.problemId)) ?? 0);
      await redis.set(submission.problemId, currentValue + contribution);
    }
    solveChanged = true;
  }

  if (!solveChanged) {
    return;
  }

  const refreshedSolveRows = await db
    .select({
      problemId: solve.problemId,
      teamId: solve.teamId,
      testcasesPassed: solve.testcasesPassed,
    })
    .from(solve);

  const leaderboard = await buildLeaderboard(refreshedSolveRows);
  const question = await buildQuestionEvent(submission.problemId);

  if (redis) {
    await redis.set("leaderboard", leaderboard);
    if (question) {
      await redis.set(`question:${question.id}`, question);
    }
    try {
      const { realtime } = await import("@/lib/realtime");
      const channel = realtime.channel("leaderboard");
      await channel.emit("leaderboard", leaderboard);
      if (question) {
        await channel.emit("question", question);
      }
    } catch (error: unknown) {
      console.error("Failed to emit realtime leaderboard", error);
    }
  }
}
