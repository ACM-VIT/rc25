"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { firestoreService } from "@/lib/firebase-admin-service";
import { EvalEnum } from "@prisma/client";

interface WebhookBody {
  token: string;
  stdout: string | null;
  status: string | null;
  stderr: string | null;
  compile_output: string | null;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { token, stdout, stderr, compile_output }: WebhookBody = body;

    const submission = await prisma.submission.findUnique({
      where: { token },
      include: {
        testcases: {
          include: {
            testcase: {
              select: {
                id: true,
                output: true,
                weight: true,
              },
            },
          },
          orderBy: { sequence: "asc" },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    if (compile_output) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          evaluated: true,
          evaluationStatus: EvalEnum.COMPILE_ERROR,
        },
      });
      await firestoreService.submissions.processed(submission.id);
      return NextResponse.json(
        { message: "Submission failed with compile error" },
        { status: 200 }
      );
    }

    if (stderr) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          evaluated: true,
          evaluationStatus: EvalEnum.RUNTIME_ERROR,
        },
      });
      await firestoreService.submissions.processed(submission.id);
      return NextResponse.json(
        { message: "Submission failed with runtime error" },
        { status: 200 }
      );
    }

    // Decode stdout from base64 (defaulting to an empty string if stdout is null)
    const decodedStdout = Buffer.from(stdout ?? "", "base64").toString("utf-8");
    const delimiter = process.env.DELIMITER || "|||";
    const outputs = decodedStdout.split(delimiter);

    const problem = await prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: { maxScore: true },
    });
    if (!problem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 400 }
      );
    }

    // Compare each testcase's expected output with the corresponding actual output.
    const testcasespassed = submission.testcases.map((relation, index) => {
      const expectedOutput = relation.testcase.output.trim();
      const actualOutput = outputs[index]?.trim() || "";
      return expectedOutput === actualOutput;
    });

    // Calculate the effective weight for each testcase.
    const totalRatio = submission.testcases.reduce(
      (acc, rel) => acc + rel.testcase.weight,
      0
    );
    const effectiveWeight = (index: number): number => {
      return (problem.maxScore / totalRatio) * submission.testcases[index].testcase.weight;
    };

    // Compute the individual submission score based on passed testcases.
    const individualSubmissionScore = testcasespassed.reduce((acc, isPassed, index) => {
      return isPassed ? acc + effectiveWeight(index) : acc;
    }, 0);

    // Update the submission with the test results and computed score.
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        testcasespassed: testcasespassed,
        score: individualSubmissionScore,
        evaluated: true,
        evaluationStatus: EvalEnum.ACCEPTED,
      },
    });

    // Mark the submission as processed in Firestore.
    await firestoreService.submissions.processed(submission.id);

    return NextResponse.json(
      { message: "Submission updated successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing PUT request:", errorMessage);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
