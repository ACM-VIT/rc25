"use server";

import { prisma } from "@/utils/prisma";
import type {
  SupportedLanguage,
} from "@/utils/judge0-langs";
import { judgeSolution } from "./submit-code";

export default async function createSubmission(data: {
  code: string;
  problemId: string;
  userId: string;
  language: SupportedLanguage;
}) {
  try {
    // Get problem details first
    const problem = await prisma.problem.findUnique({
      where: {
        id: data.problemId,
      },
      select: {
        normal_cases: true,
        edge_cases: true
      }
    });

    if (!problem) {
      throw new Error("Problem not found");
    }

    // Get all testcases
    const allTestcases = await prisma.testcase.findMany({
      where: {
        problemId: data.problemId,
      }
    });

    // Split into normal and edge cases
    const normalCases = allTestcases.filter(tc => !tc.isEdge);
    const edgeCases = allTestcases.filter(tc => tc.isEdge);

    // Function to randomly select n items from array
    const getRandomElements = <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    // Select required number of cases
    const selectedNormalCases = getRandomElements(normalCases, problem.normal_cases);
    const selectedEdgeCases = getRandomElements(edgeCases, problem.edge_cases);

    // Combine all selected testcases
    const selectedTestcases = [...selectedNormalCases, ...selectedEdgeCases];

    // Initialize testcases passed array
    const testcasespassed = selectedTestcases.map(() => false);

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        code: data.code,
        problemId: data.problemId,
        userId: data.userId,
        testcasespassed: testcasespassed,
        testcases: {
          connect: selectedTestcases.map(tc => ({ id: tc.id }))
        }
      },
    });

    // Combine selected inputs with newlines
    const combinedInput = selectedTestcases.map(tc => tc.input).join('\n');

    // Submit to Judge0
    const judgeResult = await judgeSolution(
      data.code,
      data.language,
      combinedInput,
      submission.id 
    );

    if (!judgeResult.success) {
      return {
        success: false,
        error: judgeResult.error
      };
    }


    return {
      success: true,
      submission,
      token: judgeResult.token,
    };

  } catch (error) {
    console.error("Error creating submission:", error);
    return {
      success: false,
      error: `Submission creation failed: ${(error as Error).message}`,
    };
  }
}
