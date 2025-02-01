"use server";

import { prisma } from "@/utils/prisma";
import type {  SupportedLanguage } from '@/utils/judge0-langs';
import { judgeSolution } from "./submit-code";
import { pythonFunction, cFunction, cppFunction, javaFunction, jsFunction, goFunction, rustFunction } from "@/utils/funcconvert";

// Map language to template function
const languageTemplates = {
  'python': pythonFunction,
  'c': cFunction,
  'cpp': cppFunction,
  'java': javaFunction,
  'javascript': jsFunction,
  'go': goFunction,
  'rust': rustFunction
} as const;

// Add this helper to remove duplicated imports from final code
function removeDuplicateImports(code: string, language: SupportedLanguage): string {
  const importPatterns: Partial<Record<SupportedLanguage, RegExp[]>> = {
    'cpp': [/#include\s*<[^>]+>/g],
    'java': [/import\s+[^;]+;/g],
    'python': [/^from\s+[\w.]+\s+import\s+.*$/gm, /^import\s+.*$/gm],
    'go': [/^import\s*\([^)]*\)/gm, /^import\s+".*?"$/gm],
    'rust': [
      /^use\s+[^;]+;/gm,                    // Matches: use std::io;
      /^use\s+[^{]+\{[^}]+\};/gm,          // Matches: use std::io::{Write, Read};
      /^use\s+[^:]+::[^;]+;/gm             // Matches: use std::collections::HashMap;
    ]
  };

  if (!importPatterns[language]) return code;

  const patterns = importPatterns[language] || [];
  const allImports = new Set<string>();
  
  // Collect imports and remove them from code
  let cleanCode = code;
  for (const pattern of patterns) {
    const matches = cleanCode.match(pattern) || [];
    for (const match of matches) {
      allImports.add(match.trim());
    }
    cleanCode = cleanCode.replace(pattern, '');
  }

  // Re-append unique imports
  let importSection = '';
  if (language === 'go' && allImports.size > 0) {
    importSection = `import (\n  ${Array.from(allImports).join('\n  ')}\n)\n`;
  } else if (allImports.size > 0) {
    importSection = `${Array.from(allImports).join('\n')}\n`;
  }
  
  return importSection + cleanCode.trim();
}

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

    console.log(problem.normal_cases, problem.edge_cases)

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

    console.log("combinedInput: ",combinedInput)

    // Get number of testcases
    const numTestcases = selectedTestcases.length;
    
    // Get delimiter from env or use default
    const delimiter = process.env.DELIMITER || "|||";

    // Transform code using appropriate template
    const templateFunction = languageTemplates[data.language];
    let transformedCode = templateFunction(data.code, numTestcases, delimiter);

    // Remove duplicated imports from the final code
    transformedCode = removeDuplicateImports(transformedCode, data.language);

    console.log("code: \n",transformedCode)

    // Submit to Judge0
    const judgeResult = await judgeSolution(
      transformedCode,
      data.language,
      combinedInput,
      submission.id
    );

    console.log("judge submit",judgeResult)

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
