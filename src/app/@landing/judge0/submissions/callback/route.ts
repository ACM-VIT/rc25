import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  submissions,
  submissionTestcases,
  testcases,
  solve,
} from "@/db/schema";
import { firestoreService } from "@/lib/firebase-admin-service";
import { and, asc, eq, isNull } from "drizzle-orm";
import {
  Judge0StatusEnumValue,
  judge0StatusToEval,
} from "@/utils/judge0-status";
import type {
  SupportedLanguageId,
  SupportedLanguageName,
} from "@/utils/judge0-langs";
import * as Ably from "ably";

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
      const client = new Ably.Rest(process.env.ABLY_API_KEY);
      const channel = realtime.channels.get("leaderboard");

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
          submission: submissions,
        })
        .from(submissionTestcases)
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

      // Query 4: Retrieve the team's existing solve record for this problem (if any)
      // This query:
      // - Selects the solve record which tracks the best submission for a team/problem combination
      // - Filters by problemId and teamId to get the team's current best attempt at this problem
      // - The solve table maintains partial scoring: tracks how many testcases (0-10) the team has passed
      // - Returns the current best submission reference and testcasesPassed count
      // - Used to determine if this new submission improves upon the team's previous best
      const solveRows = await db
        .select({
          id: solve.id,
          bestSubmissionId: solve.bestSubmissionId,
          testcasesPassed: solve.testcasesPassed,
        })
        .from(solve)
        .where(
          and(
            eq(solve.problemId, submission.problemId),
            eq(solve.teamId, submission.teamId),
          ),
        );

      const teamSolve = solveRows[0];

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
        await db.insert(solve).values({
          problemId: submission.problemId,
          teamId: submission.teamId ?? null,
          bestSubmissionId: submission.id,
          testcasesPassed: passedCount,
        });
        return;
      }

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
      await db
        .update(solve)
        .set({
          testcasesPassed: passedCount,
          bestSubmissionId: submission.id,
        })
        .where(eq(solve.id, teamSolve.id));
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

    return NextResponse.json(
      { message: "Submission updated successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing POST request:", errorMessage);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
