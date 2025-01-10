import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

interface WebhookBody {
  submissionId: string;
  stdout: string;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, stdout, status }: WebhookBody = body;  


    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },  
      include: {
        testcases: {
          include: {
            testcase: {
              select: {
                id: true,
                output: true,
                weight: true,
              },
            }
          }
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    console.log(submission);

    // Split stdout using delimiter
    const delimiter = process.env.DELIMITER || "|||";
    const outputs = stdout.split(delimiter);

    console.log("Raw stdout:", stdout); // Debug log
    console.log("Split outputs:", outputs);
    // Compare outputs with testcases
    const testcasespassed = submission.testcases.map((relation, index) => {
      const expectedOutput = relation.testcase.output.trim();
      const actualOutput = outputs[index]?.trim() || "";
      return expectedOutput === actualOutput;
    });

    // Get user's team
    const user = await prisma.user.findUnique({
      where: { id: submission.userId },
      include: { Team: true },
    });

    if (!user?.Team) {
      return NextResponse.json(
        { message: "User not in team" },
        { status: 400 }
      );
    }

    // Get all team submissions for this problem
    const teamSubmissions = await prisma.submission.findMany({
      where: {
        problemId: submission.problemId,
        user: {
          teamId: user.Team.id,
        },
      },
      include: {
        testcases: {
          include: {
            testcase: {
              select: {
                id: true,
                weight: true
              }
            }
          },
        },
        user: {
          select: {
            id: true,
            teamId: true
          }
        }
      },
    });

    console.log(teamSubmissions)

    // Combine all test results (true if any team member passed)
    const teamTestResults = submission.testcases.map((_, index) => {
      return teamSubmissions.some((sub) => sub.testcasespassed[index] === true);
    });

    // Merge results - keep true if previously passed by any team member
    const finalTestCasesPassed = submission.testcases.map((_, index) => {
      const wasPassedByTeam = teamTestResults[index];
      const isPassedNow = testcasespassed[index];
      return wasPassedByTeam ? wasPassedByTeam : isPassedNow;
    });

    let scoreChange = 0;
    testcasespassed.forEach((isPassed, index) => {
      const wasPassedByTeam = teamTestResults[index];
      if (!wasPassedByTeam && isPassed) {
        scoreChange += submission.testcases[index].testcase.weight;
      }
    });

    await prisma.$transaction([
      prisma.submission.update({
        where: { id: submissionId },
        data: {
          testcasespassed: finalTestCasesPassed,
        },
      }),
      prisma.team.update({
        where: { id: user.Team.id },
        data: {
          score: {
            increment: scoreChange,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Submission updated successfully",
        testcasespassed: finalTestCasesPassed,
        scoreChange,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing POST request:", errorMessage);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
