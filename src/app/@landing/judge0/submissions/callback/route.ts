import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  problems,
  submissions,
  submissionTestcases,
  testcases,
  teams,
  users,
  solve,
} from "@/db/schema";
import { firestoreService } from "@/lib/firebase-admin-service";
import {
  calculateCurrentPoints,
  calculateSolveContribution,
} from "@/db/scoring";
import { and, asc, eq, inArray } from "drizzle-orm";

const EvalStatus = {
  ACCEPTED: "ACCEPTED",
  COMPILATION_ERROR: "COMPILATION_ERROR",
  RUNTIME_ERROR: "RUNTIME_ERROR_OTHER",
  WRONG_ANSWER: "WRONG_ANSWER",
} as const;

interface WebhookBody {
  token: string;
  stdout: string;
  status: string | null;
  stderr: string | null;
  compile_output: string | null;
}

type ProblemScoreRow = {
  id: string;
  initial: number;
  minimum: number;
  decay: number;
};

type SolveRow = {
  problemId: string;
  teamId: string | null;
  testcasesPassed: number;
};

const buildEffectiveSolvesMap = (rows: SolveRow[]) => {
  const effectiveSolvesByProblem = new Map<string, number>();
  for (const row of rows) {
    const contribution = calculateSolveContribution(row.testcasesPassed);
    effectiveSolvesByProblem.set(
      row.problemId,
      (effectiveSolvesByProblem.get(row.problemId) ?? 0) + contribution
    );
  }
  return effectiveSolvesByProblem;
};

const calculateTeamRoundScore = (
  problemsInRound: ProblemScoreRow[],
  solves: SolveRow[],
  teamId: string
): number => {
  const effectiveSolvesByProblem = buildEffectiveSolvesMap(solves);
  const teamSolvesByProblem = new Map<string, number>();

  for (const row of solves) {
    if (row.teamId === teamId) {
      teamSolvesByProblem.set(row.problemId, row.testcasesPassed);
    }
  }

  let total = 0;
  for (const problem of problemsInRound) {
    const effectiveSolves = effectiveSolvesByProblem.get(problem.id) ?? 0;
    const currentPoints = calculateCurrentPoints({
      ...problem,
      effectiveSolves,
    });
    const teamPassed = teamSolvesByProblem.get(problem.id) ?? 0;
    if (teamPassed > 0) {
      total += Math.round(currentPoints * (teamPassed / 10));
    }
  }
  return total;
};

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { token, stdout, stderr, compile_output }: WebhookBody = body;

    const submissionRows = await db
      .select({
        submission: submissions,
        submissionTestcase: submissionTestcases,
        testcase: testcases,
      })
      .from(submissions)
      .leftJoin(
        submissionTestcases,
        eq(submissions.id, submissionTestcases.submissionId)
      )
      .leftJoin(testcases, eq(submissionTestcases.testcaseId, testcases.id))
      .where(eq(submissions.token, token))
      .orderBy(asc(testcases.orderIndex));

    const submission = submissionRows[0]?.submission;

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    const testcaseRelations = submissionRows
      .filter((row) => row.testcase && row.submissionTestcase)
      .map((row) => ({
        testcaseId: row.testcase!.id,
        output: row.testcase!.output,
      }));

    const totalTestcases = testcaseRelations.length;

    if (compile_output) {
      await db
        .update(submissions)
        .set({
          evaluated: true,
          evaluationStatus: EvalStatus.COMPILATION_ERROR,
          testcasesPassed: 0,
        })
        .where(eq(submissions.id, submission.id));
      await firestoreService.submissions.processed(submission.id);
      return NextResponse.json(
        { message: "Submission failed with compile error" },
        { status: 200 }
      );
    }

    if (stderr) {
      await db
        .update(submissions)
        .set({
          evaluated: true,
          evaluationStatus: EvalStatus.RUNTIME_ERROR,
          testcasesPassed: 0,
        })
        .where(eq(submissions.id, submission.id));
      await firestoreService.submissions.processed(submission.id);
      return NextResponse.json(
        { message: "Submission failed with runtime error" },
        { status: 200 }
      );
    }

    const decodedStdout = Buffer.from(stdout, "base64").toString("utf-8");

    const delimiter = process.env.DELIMITER || "|||";
    const outputs = decodedStdout.split(delimiter);

    const testcasesPassed = testcaseRelations.map((relation, index) => {
      const expectedOutput = relation.output.trim();
      const actualOutput = outputs[index]?.trim() || "";
      return expectedOutput === actualOutput;
    });

    const passedCount = testcasesPassed.filter(Boolean).length;
    const evalStatus =
      totalTestcases > 0 && passedCount === totalTestcases
        ? EvalStatus.ACCEPTED
        : EvalStatus.WRONG_ANSWER;

    const userRows = await db
      .select({ user: users, team: teams })
      .from(users)
      .leftJoin(teams, eq(users.teamId, teams.id))
      .where(eq(users.id, submission.userId))
      .limit(1);
    const user = userRows[0]?.user ?? null;
    const team = userRows[0]?.team ?? null;

    if (!user || !team) {
      return NextResponse.json({ message: "User not in team" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(submissions)
        .set({
          testcasesPassed: passedCount,
          evaluated: true,
          evaluationStatus: evalStatus,
        })
        .where(eq(submissions.id, submission.id));

      for (let i = 0; i < testcaseRelations.length; i += 1) {
        const relation = testcaseRelations[i];
        const passed = testcasesPassed[i] ?? false;
        await tx
          .update(submissionTestcases)
          .set({ passed })
          .where(
            and(
              eq(submissionTestcases.submissionId, submission.id),
              eq(submissionTestcases.testcaseId, relation.testcaseId)
            )
          );
      }

      const teamSolveRows = await tx
        .select({
          id: solve.id,
          testcasesPassed: solve.testcasesPassed,
        })
        .from(solve)
        .where(
          and(eq(solve.problemId, submission.problemId), eq(solve.teamId, team.id))
        )
        .limit(1);

      const teamSolve = teamSolveRows[0] ?? null;

      if (!teamSolve) {
        await tx.insert(solve).values({
          problemId: submission.problemId,
          userId: submission.userId,
          teamId: team.id,
          bestSubmissionId: submission.id,
          testcasesPassed: passedCount,
        });
      } else if (passedCount > teamSolve.testcasesPassed) {
        await tx
          .update(solve)
          .set({
            userId: submission.userId,
            bestSubmissionId: submission.id,
            testcasesPassed: passedCount,
          })
          .where(eq(solve.id, teamSolve.id));
      }
    });

    const problemRows = await db
      .select({ roundId: problems.roundId })
      .from(problems)
      .where(eq(problems.id, submission.problemId))
      .limit(1);
    const roundId = problemRows[0]?.roundId ?? null;

    let teamScore = 0;
    if (roundId) {
      const problemsInRound = await db
        .select({
          id: problems.id,
          initial: problems.initial,
          minimum: problems.minimum,
          decay: problems.decay,
        })
        .from(problems)
        .where(eq(problems.roundId, roundId));

      const problemIds = problemsInRound.map((problem) => problem.id);
      const solveRows = problemIds.length
        ? await db
            .select({
              problemId: solve.problemId,
              teamId: solve.teamId,
              testcasesPassed: solve.testcasesPassed,
            })
            .from(solve)
            .where(inArray(solve.problemId, problemIds))
        : [];

      teamScore = calculateTeamRoundScore(problemsInRound, solveRows, team.id);
    }

    const adminTeamId = process.env.ADMIN_TEAM_ID || "";
    const shouldUpdateLeaderboard =
      !team.hidden && !team.disqualify && team.id !== adminTeamId;

    await Promise.all([
      firestoreService.submissions.processed(submission.id),
      shouldUpdateLeaderboard
        ? firestoreService.leaderboard.updateTeam({
            id: team.id,
            name: team.name,
            score: teamScore,
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json(
      { message: "Submission updated successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing POST request:", errorMessage);

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
