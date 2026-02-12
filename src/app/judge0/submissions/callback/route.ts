import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  problems,
  submissions,
  submissionTestcases,
  testcases,
  teams,
  solve,
} from "@/db/schema";
import { and, asc, eq, lt } from "drizzle-orm";
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
export interface Judge0Error {
  error: string;
}

const normalizeOutput = (value: string | null | undefined) =>
  (value ?? "").replace(/\r\n/g, "\n").trimEnd();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;
const LEADERBOARD_CACHE_KEY = "leaderboard:cache";
const REALTIME_LEADERBOARD_CHANNEL = "leaderboard";
const REALTIME_BLOCKING_TYPES = new Set([
  "string",
  "set",
  "list",
  "zset",
  "hash",
]);

const ensureRealtimeLeaderboardChannelKeyType = async () => {
  if (!redis) return;
  try {
    const keyType = await redis.type(REALTIME_LEADERBOARD_CHANNEL);
    if (typeof keyType === "string" && REALTIME_BLOCKING_TYPES.has(keyType)) {
      await redis.del(REALTIME_LEADERBOARD_CHANNEL);
      console.warn(
        `Deleted incompatible Redis key "${REALTIME_LEADERBOARD_CHANNEL}" before realtime emit (type: ${keyType})`,
      );
    }
  } catch (error: unknown) {
    console.error("Failed to validate realtime leaderboard channel key", error);
  }
};

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      token,
      stdout,
      stderr,
      compile_output,
      status,
      time,
      memory,
    }: Judge0Response = body;

    if (!token) {
      return NextResponse.json(
        { message: "Missing submission token" },
        { status: 400 },
      );
    }

    // Query 1: Retrieve the submission testcase record along with related testcase and submission data
    // This query:
    // - Selects from the submissionTestcases junction table (stores individual testcase results for each submission)
    // - LEFT JOINs with testcases table to get the expected input/output for this specific test case
    // - LEFT JOINs with submissions table to get submission metadata (problemId, teamId, etc.)
    // - Filters by the Judge0 token to find the specific testcase execution that just completed
    // - Orders by testcases.orderIndex to maintain consistent testcase ordering
    // - Limits to 1 since each token uniquely identifies one submission-testcase pair
    const submissionTestcaseRows = await db
      .select({
        submissionTestcase: submissionTestcases,
        testcase: testcases,
        submission: submissions,
      })
      .from(submissionTestcases)
      .leftJoin(testcases, eq(submissionTestcases.testcaseId, testcases.id))
      .leftJoin(
        submissions,
        eq(submissionTestcases.submissionId, submissions.id),
      )
      .where(eq(submissionTestcases.token, token))
      .orderBy(asc(testcases.orderIndex))
      .limit(1);

    const submissionTestcaseRow = submissionTestcaseRows[0];
    const submissionTestcase = submissionTestcaseRow?.submissionTestcase;
    const testcase = submissionTestcaseRow?.testcase ?? null;
    const submission = submissionTestcaseRow?.submission ?? null;

    if (!submissionTestcase || !submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 },
      );
    }

    const evaluationStatus = judge0StatusToEval(status.description);

    const updateSolveIfComplete = async () => {
      // Query 2: Retrieve ALL testcase results for this submission to check if evaluation is complete
      // This query:
      // - Selects all submissionTestcases records for the current submission
      // - LEFT JOINs with submissions table (though submission data isn't really needed here)
      // - Filters by submissionId to get all testcases (typically 10 total: normal_cases + edge_cases)
      // - Orders by testcases.orderIndex to maintain consistent ordering
      // Used to determine if all testcases have been evaluated before updating the solve record
      const problemSubmissionTestcaseRows = await db
        .select({
          submissionTestcase: submissionTestcases,
          testcase: testcases,
          submission: submissions,
        })
        .from(submissionTestcases)
        .leftJoin(testcases, eq(submissionTestcases.testcaseId, testcases.id))
        .leftJoin(
          submissions,
          eq(submissionTestcases.submissionId, submissions.id),
        )
        .where(eq(submissionTestcases.submissionId, submission.id))
        .orderBy(asc(testcases.orderIndex));

      const allEvaluated = problemSubmissionTestcaseRows.every(
        (row) => row.submissionTestcase.evaluated,
      );

      if (!allEvaluated) {
        return;
      }

      const passedCount = problemSubmissionTestcaseRows.filter(
        (row) => row.submissionTestcase.passed,
      ).length;

      // Query 3: Update the submission record with final evaluation results
      // This query:
      // - Updates the submissions table with the total count of passed testcases (0-10)
      // - Sets evaluated flag to true, indicating all testcases have been processed
      // - Updates the timestamp to track when evaluation completed
      // - This aggregate data allows quick access to submission results without joining to submissionTestcases
      await db
        .update(submissions)
        .set({
          testcasesPassed: passedCount,
          evaluated: true,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, submission.id));

      await firestoreService.submissions.processed(submission.id);

      // Query 4: Retrieve all solve rows and find the team's existing solve record in-memory
      // This query:
      // - Selects all rows from solve table so we can recompute leaderboard after updates
      // - Finds current team/problem solve row from this dataset
      // - Uses full solve snapshot for point calculations
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
      const solveLogContext = {
        token,
        submissionId: submission.id,
        teamId: submission.teamId,
        problemId: submission.problemId,
        passedCount,
      };
      let solveChanged = false;

      if (!teamSolve) {
        if (passedCount <= 0) {
          return;
        }
        // Query 5a: Create a NEW solve record for this team's first valid submission to this problem
        // This query:
        // - Inserts a new record into the solve table (first-time solve for this team/problem)
        // - Only executes if: no prior solve exists AND at least 1 testcase passed
        // - Records this submission as the "best" since it's the first one with any passing testcases
        // - Establishes the baseline for partial scoring (can be improved by later submissions)
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
          if (redis) {
            const contribution = calculateSolveContribution(passedCount);
            const currentValue = Number(
              (await redis.get(submission.problemId)) ?? 0,
            );
            await redis.set(submission.problemId, currentValue + contribution);
          }
          solveChanged = true;
        } else {
          console.warn("Solve insert skipped due to concurrent callback", {
            ...solveLogContext,
            reason: "conflict_on_team_problem",
          });

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
            const currentValue = Number(
              (await redis.get(submission.problemId)) ?? 0,
            );
            await redis.set(submission.problemId, currentValue + contribution);
          }
          solveChanged = true;
        }
      } else {
        if (passedCount <= teamSolve.testcasesPassed) {
          return;
        }

        // Query 5b: Update EXISTING solve record if this submission improves the team's best score
        // This query:
        // - Updates the solve table when a team submits a better solution (more testcases passed)
        // - Only executes if: passedCount > previous testcasesPassed
        // - Updates both the testcasesPassed count and the bestSubmissionId reference
        // - Implements partial scoring: teams can incrementally improve from 1/10 to 10/10 testcases
        // - Used for leaderboard calculations and determining team progress
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
          const currentValue = Number(
            (await redis.get(submission.problemId)) ?? 0,
          );
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
        await redis.set(LEADERBOARD_CACHE_KEY, leaderboard);
        if (question) {
          await redis.set(`question:${question.id}`, question);
        }
        try {
          await ensureRealtimeLeaderboardChannelKeyType();
          const { realtime } = await import("@/lib/realtime");
          const channel = realtime.channel("leaderboard");
          await channel.emit("leaderboard", leaderboard);
          if (question) {
            await channel.emit("question", question);
          }
        } catch (error: unknown) {
          if (
            redis &&
            error instanceof Error &&
            error.message.includes("WRONGTYPE")
          ) {
            try {
              await redis.del(REALTIME_LEADERBOARD_CHANNEL);
              const { realtime } = await import("@/lib/realtime");
              const channel = realtime.channel("leaderboard");
              await channel.emit("leaderboard", leaderboard);
              if (question) {
                await channel.emit("question", question);
              }
              return;
            } catch (retryError: unknown) {
              console.error(
                "Failed to emit realtime leaderboard after WRONGTYPE recovery",
                retryError,
              );
            }
          }
          console.error("Failed to emit realtime leaderboard", error);
        }
      }
    };

    if (compile_output) {
      // Query 6a: Update submissionTestcase when compilation fails
      // This query:
      // - Updates the submissionTestcases record for a compilation error
      // - Sets evaluated=true (processing complete), passed=false (compilation failed)
      // - Stores the compiler error message in errorMessage field
      // - Sets actualOutput to null since code never executed
      // - Records execution metrics (time/memory) from Judge0
      // - Compilation errors fail the entire submission across all testcases
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
      // Query 6b: Update submissionTestcase when runtime error occurs
      // This query:
      // - Updates the submissionTestcases record for runtime errors (SIGSEGV, SIGFPE, etc.)
      // - Sets evaluated=true, passed=false (code crashed during execution)
      // - Stores the stderr output (error message/stack trace) in errorMessage
      // - Sets actualOutput to null since execution didn't complete successfully
      // - Records execution metrics (time/memory used before crash)
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

    // Query 6c: Update submissionTestcase for successful execution (with or without correct output)
    // This query:
    // - Updates the submissionTestcases record when code executed without errors
    // - Sets evaluated=true (processing complete)
    // - Records the actual program output (decoded from base64, normalized)
    // - Sets passed=true/false based on whether actualOutput matches expected testcase output
    // - Stores execution metrics (time in ms, memory in KB) for performance analysis
    // - Sets errorMessage to null since execution was successful (even if output was wrong)
    // - The 'passed' boolean is determined by exact string comparison after normalization
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
    await firestoreService.submissions.processed(submission.id);

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
