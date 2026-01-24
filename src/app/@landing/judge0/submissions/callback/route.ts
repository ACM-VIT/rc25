import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  submissions,
  submissionTestcases,
  testcases,
  solve,
} from "@/db/schema";
import { firestoreService } from "@/lib/firebase-admin-service";
import { asc, eq } from "drizzle-orm";
import {
  Judge0StatusEnumValue,
  judge0StatusToEval,
} from "@/utils/judge0-status";
import type {
  SupportedLanguageId,
  SupportedLanguageName,
} from "@/utils/judge0-langs";

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
      await firestoreService.submissions.processed(submission.id);
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
      await firestoreService.submissions.processed(submission.id);
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

    const solveRows = await db
      .select({
        id: solve.id,
        teamId: solve.teamId,
        testcasesPassed: solve.testcasesPassed,
      })
      .from(solve)
      .where(eq(solve.problemId, submission.problemId));

    await firestoreService.submissions.processed(submission.id);

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
