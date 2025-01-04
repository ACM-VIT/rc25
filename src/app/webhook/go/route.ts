import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionid, stdout, status } = body;

    if (!submissionid || !stdout || !status) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    // Get submission with testcases
    const submission = await prisma.submission.findUnique({
      where: { id: submissionid },
      include: {
        testcases: {
          select: {
            id: true,
            output: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    // Split stdout using delimiter
    const delimiter = process.env.OUTPUT_DELIMITER || "\n";
    const outputs = stdout.split(delimiter);

    // Compare outputs with testcases
    const testcasespassed = submission.testcases.map((testcase, index) => {
      const expectedOutput = testcase.output.trim();
      const actualOutput = outputs[index]?.trim() || "";
      return expectedOutput === actualOutput;
    });

    // Update submission
    await prisma.submission.update({
      where: { id: submissionid },
      data: {
        testcasespassed: testcasespassed
      }
    });

    //TODO: Update points and leaderboard 
    //TODO: SSN


    return NextResponse.json({ 
      message: "Submission updated successfully",
      testcasespassed 
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}