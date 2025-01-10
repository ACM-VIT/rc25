"use server";

import { prisma } from "@/utils/prisma";
import type { SupportedLanguage } from "@/utils/judge0-langs";
import { judgeSolution } from "./submit-code";
import { pythonFunction, cFunction, cppFunction, javaFunction, jsFunction, goFunction } from "@/utils/funcconvert";

// Map language to template function
const languageTemplates = {
  'python': pythonFunction,
  'c': cFunction,
  'cpp': cppFunction,
  'java': javaFunction,
  'javascript': jsFunction,
  'go': goFunction
} as const;

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
        edge_cases: true,
      },
    });

    if (!problem) {
      throw new Error("Problem not found");
    }

    // Get all testcases
    const allTestcases = await prisma.testcase.findMany({
      where: {
        problemId: data.problemId,
      },
    });

    // Split into normal and edge cases
    const normalCases = allTestcases.filter((tc) => !tc.isEdge);
    const edgeCases = allTestcases.filter((tc) => tc.isEdge);

    // Function to randomly select n items from array
    const getRandomElements = <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    // Select required number of cases
    const selectedNormalCases = getRandomElements(
      normalCases,
      problem.normal_cases
    );
    const selectedEdgeCases = getRandomElements(edgeCases, problem.edge_cases);

    // Combine all selected testcases
    const selectedTestcases = [...selectedNormalCases, ...selectedEdgeCases];


    // Initialize testcases passed array
    const testcasespassed = selectedTestcases.map(() => false);

    console.log(selectedTestcases)

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        code: data.code,
        problemId: data.problemId,
        userId: data.userId,
        testcasespassed: testcasespassed,
        testcases: {
          create: selectedTestcases.map((tc) => ({
            testcase: {
              connect: { id: tc.id }
            }
          })),
        },
      },
    });

    // Combine selected inputs with newlines
    const combinedInput = selectedTestcases.map((tc) => tc.input).join("\n");

    // Get number of testcases
    const numTestcases = selectedTestcases.length;
    
    // Get delimiter from env or use default
    const delimiter = process.env.DELIMITER || "|||";

    // Transform code using appropriate template
    const templateFunction = languageTemplates[data.language];
    const transformedCode = templateFunction(data.code, numTestcases, delimiter);

    console.log(transformedCode)

    // Submit to Judge0
    const judgeResult = await judgeSolution(
      transformedCode,
      data.language,
      combinedInput,
      submission.id
    );

    if (!judgeResult.success) {
      return {
        success: false,
        error: judgeResult.error,
      };
    }

    return {
      success: true,
      submission,
      token: judgeResult.token,
    };
  } catch (error: unknown) {
    console.error(
      "Error creating submission:",
      error instanceof Error ? error : String(error)
    );

    return {
      success: false,
      error: `Submission creation failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}
