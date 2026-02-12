import { type NextRequest, NextResponse } from "next/server";
import { and, asc, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  problems,
  solve,
  submissions,
  submissionTestcases,
  teams,
  testcases,
} from "@/db/schema";
import {
  calculateCurrentPoints,
  calculateSolveContribution,
} from "@/db/scoring";
import { firestoreService } from "@/lib/firebase-admin-service";
import { getRedis } from "@/lib/redis";
import type { LeaderboardEvent, QuestionEvent } from "@/lib/realtime";
import { REALTIME_LEADERBOARD_CHANNEL } from "@/lib/realtime-channels";
import type {
  SupportedLanguageId,
  SupportedLanguageName,
} from "@/utils/judge0-langs";
import {
  type Judge0StatusEnumValue,
  judge0StatusToEval,
} from "@/utils/judge0-status";

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

const redis = getRedis();
const STREAM_KEY_TYPE = "stream";

const normalizeOutput = (value: string | null | undefined) =>
  (value ?? "").replace(/\r\n/g, "\n").trimEnd();

const isWrongTypeError = (error: unknown): boolean =>
  String(error).toUpperCase().includes("WRONGTYPE");

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
  if (!redis) return 0;

  let redisValue = NaN;
  try {
    redisValue = Number((await redis.get(problemId)) ?? NaN);
  } catch {
    return 0;
  }

  return Number.isFinite(redisValue) ? redisValue : 0;
};

const incrementEffectiveSolveCount = async (
  problemId: string,
  delta: number,
): Promise<void> => {
  if (!redis) return;

  try {
    const currentRaw = Number((await redis.get(problemId)) ?? 0);
    const currentValue = Number.isFinite(currentRaw) ? currentRaw : 0;
    await redis.set(problemId, currentValue + delta);
  } catch {
    // Best-effort cache update; DB remains source of truth.
  }
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

const ensureRealtimeLeaderboardChannelKeyType = async () => {
  if (!redis) return;

  try {
    const keyType = String(await redis.type(REALTIME_LEADERBOARD_CHANNEL));
    if (keyType !== "none" && keyType !== STREAM_KEY_TYPE) {
      await redis.del(REALTIME_LEADERBOARD_CHANNEL);
      console.warn(
        `Deleted incompatible Redis key "${REALTIME_LEADERBOARD_CHANNEL}" before realtime emit (type: ${keyType})`,
      );
    }
  } catch (error: unknown) {
    console.error("Failed to validate realtime leaderboard channel key", error);
  }
};

const emitRealtime = async (
  leaderboard: LeaderboardEvent,
  question: QuestionEvent | null,
) => {
  const { realtime } = await import("@/lib/realtime");
  const channel = realtime.channel(REALTIME_LEADERBOARD_CHANNEL);
  await channel.emit("leaderboard", leaderboard);
  if (question) {
    await channel.emit("question", question);
  }
};

const emitLeaderboardAndQuestion = async (
  leaderboard: LeaderboardEvent,
  question: QuestionEvent | null,
) => {
  if (!redis) return;

  try {
    await ensureRealtimeLeaderboardChannelKeyType();
    await emitRealtime(leaderboard, question);
  } catch (error: unknown) {
    if (isWrongTypeError(error)) {
      try {
        await redis.del(REALTIME_LEADERBOARD_CHANNEL);
        await emitRealtime(leaderboard, question);
        return;
      } catch (retryError: unknown) {
        console.error("Failed to emit realtime leaderboard", retryError);
        return;
      }
    }

    console.error("Failed to emit realtime leaderboard", error);
  }
};

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Judge0Response;
    const { token, stdout, stderr, compile_output, status, time, memory } = body;

    if (!token) {
      return NextResponse.json(
        { message: "Missing submission token" },
        { status: 400 },
      );
    }

    const findSubmissionTestcaseByToken = async () => {
      const rows = await db
        .select({
          submissionTestcase: submissionTestcases,
          testcase: testcases,
          submission: submissions,
        })
        .from(submissionTestcases)
        .leftJoin(testcases, eq(submissionTestcases.testcaseId, testcases.id))
        .leftJoin(submissions, eq(submissionTestcases.submissionId, submissions.id))
        .where(eq(submissionTestcases.token, token))
        .orderBy(asc(testcases.orderIndex))
        .limit(1);

      return rows[0];
    };

    let submissionTestcaseRow = await findSubmissionTestcaseByToken();

    // Guard against rare timing windows where Judge0 callback arrives just
    // before token rows are persisted locally.
    for (let attempt = 0; attempt < 4; attempt++) {
      const testcase = submissionTestcaseRow?.submissionTestcase;
      const submission = submissionTestcaseRow?.submission;
      if (testcase && submission) break;

      await new Promise((resolve) => setTimeout(resolve, 150));
      submissionTestcaseRow = await findSubmissionTestcaseByToken();
    }

    const submissionTestcase = submissionTestcaseRow?.submissionTestcase;
    const testcase = submissionTestcaseRow?.testcase ?? null;
    const submission = submissionTestcaseRow?.submission ?? null;

    if (!submissionTestcase || !submission) {
      // Return 200 to avoid unnecessary external retries for stale/missing tokens.
      return NextResponse.json({ message: "Submission not found" }, { status: 200 });
    }

    if (submissionTestcase.evaluated) {
      return NextResponse.json({ message: "Submission already processed" }, { status: 200 });
    }

    const evaluationStatus = judge0StatusToEval(status.description);

    const updateSolveIfComplete = async () => {
      const rows = await db
        .select({
          submissionTestcase: submissionTestcases,
          testcase: testcases,
        })
        .from(submissionTestcases)
        .leftJoin(testcases, eq(submissionTestcases.testcaseId, testcases.id))
        .where(eq(submissionTestcases.submissionId, submission.id))
        .orderBy(asc(testcases.orderIndex));

      const allEvaluated = rows.every((row) => row.submissionTestcase.evaluated);
      if (!allEvaluated) return;

      const passedCount = rows.filter((row) => row.submissionTestcase.passed).length;

      await db
        .update(submissions)
        .set({
          testcasesPassed: passedCount,
          evaluated: true,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, submission.id));

      await firestoreService.submissions.processed(submission.id);

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
        (row) =>
          row.problemId === submission.problemId &&
          row.teamId === submission.teamId,
      );

      let solveChanged = false;

      if (!teamSolve) {
        const insertedSolveRows = await db
          .insert(solve)
          .values({
            problemId: submission.problemId,
            teamId: submission.teamId,
            bestSubmissionId: submission.id,
            testcasesPassed: passedCount,
          })
          .onConflictDoNothing()
          .returning({ id: solve.id });

        if (insertedSolveRows[0]) {
          await incrementEffectiveSolveCount(
            submission.problemId,
            calculateSolveContribution(passedCount),
          );
          solveChanged = true;
        } else {
          const latestSolveRows = await db
            .select({ id: solve.id, testcasesPassed: solve.testcasesPassed })
            .from(solve)
            .where(
              and(
                eq(solve.problemId, submission.problemId),
                eq(solve.teamId, submission.teamId),
              ),
            )
            .limit(1);

          const latestSolve = latestSolveRows[0];
          if (!latestSolve || passedCount <= latestSolve.testcasesPassed) return;

          const updatedSolveRows = await db
            .update(solve)
            .set({
              testcasesPassed: passedCount,
              bestSubmissionId: submission.id,
            })
            .where(
              and(
                eq(solve.id, latestSolve.id),
                eq(solve.testcasesPassed, latestSolve.testcasesPassed),
                lt(solve.testcasesPassed, passedCount),
              ),
            )
            .returning({ id: solve.id });

          if (!updatedSolveRows[0]) return;

          const gainedTestcases = passedCount - latestSolve.testcasesPassed;
          await incrementEffectiveSolveCount(
            submission.problemId,
            calculateSolveContribution(gainedTestcases),
          );
          solveChanged = true;
        }
      } else {
        if (passedCount <= teamSolve.testcasesPassed) return;

        const improvedSolveRows = await db
          .update(solve)
          .set({
            testcasesPassed: passedCount,
            bestSubmissionId: submission.id,
          })
          .where(
            and(
              eq(solve.id, teamSolve.id),
              eq(solve.testcasesPassed, teamSolve.testcasesPassed),
              lt(solve.testcasesPassed, passedCount),
            ),
          )
          .returning({ id: solve.id });

        if (!improvedSolveRows[0]) return;

        const gainedTestcases = passedCount - teamSolve.testcasesPassed;
        await incrementEffectiveSolveCount(
          submission.problemId,
          calculateSolveContribution(gainedTestcases),
        );
        solveChanged = true;
      }

      if (!solveChanged) return;

      const refreshedSolveRows = await db
        .select({
          problemId: solve.problemId,
          teamId: solve.teamId,
          testcasesPassed: solve.testcasesPassed,
        })
        .from(solve);

      const leaderboard = await buildLeaderboard(refreshedSolveRows);
      const question = await buildQuestionEvent(submission.problemId);
      await emitLeaderboardAndQuestion(leaderboard, question);
    };

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
        .where(eq(submissionTestcases.id, submissionTestcase.id));

      await updateSolveIfComplete();
      return NextResponse.json(
        { message: "Submission failed with compile error" },
        { status: 200 },
      );
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
        .where(eq(submissionTestcases.id, submissionTestcase.id));

      await updateSolveIfComplete();
      return NextResponse.json(
        { message: "Submission failed with runtime error" },
        { status: 200 },
      );
    }

    const decodedStdout = stdout
      ? Buffer.from(stdout, "base64").toString("utf-8")
      : "";

    const expectedOutput = normalizeOutput(testcase?.output);
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
      .where(eq(submissionTestcases.id, submissionTestcase.id));

    await updateSolveIfComplete();

    return NextResponse.json(
      { message: "Submission updated successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error processing Judge0 callback request", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const POST = PUT;
