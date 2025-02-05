"use server";

import {prisma} from "@/utils/prisma";
import type {SupportedLanguage} from '@/utils/judge0-langs';
import {judgeSolution} from "./submit-code";
import {
    pythonFunction,
    cFunction,
    cppFunction,
    javaFunction,
    jsFunction,
    goFunction,
    rustFunction
} from "@/utils/funcconvert";

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
            /^use\s+[^;]+;/gm,
            /^use\s+[^{]+\{[^}]+\};/gm,
            /^use\s+[^:]+::[^;]+;/gm
        ]
    };

    if (!importPatterns[language]) return code;

    const patterns = importPatterns[language] || [];
    const allImports = new Set<string>();

    let cleanCode = code;
    for (const pattern of patterns) {
        const matches = cleanCode.match(pattern) || [];
        for (const match of matches) {
            allImports.add(match.trim());
        }
        cleanCode = cleanCode.replace(pattern, '');
    }

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
            relationLoadStrategy: 'join',
            where: {
                id: data.problemId,
            },
            // Removed scalar fields from include as they are selected by default
            include: {
                round: {
                    select: {
                        start: true,
                        end: true,
                        number: true,
                    }
                },
                Testcase: {
                    where: {
                        isEdge: false
                    }
                },
            },
        });

        if (!problem) {
            throw new Error("Problem not found");
        }

        const user = await prisma.user.findUnique({
            relationLoadStrategy: 'join',
            where:{
                id: data.userId
            },
            include: {
                Team: true
            }
        })
        const userTeam = user?.Team

        if (!userTeam) {
            throw new Error("User is not part of any team");
        }

        if (userTeam.disqualify) {
            throw new Error("User's team has been disqualified");
        }

        if (userTeam.id !== process.env.ADMIN_TEAM_ID) {
            const currentTime = new Date();
            if (currentTime < problem.round.start) {
                throw new Error("Round has not started yet");
            }
            if (currentTime > problem.round.end) {
                throw new Error("Round has ended");
            }
        }

        // Get all testcases
        const allTestcases = await prisma.testcase.findMany({
            relationLoadStrategy: 'join',
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

        console.log(problem.normal_cases, problem.edge_cases);

        // Access scalar fields directly because they are always returned
        const selectedNormalCases = getRandomElements(
            normalCases,
            problem.normal_cases
        );
        const selectedEdgeCases = getRandomElements(edgeCases, problem.edge_cases);

        // Combine all selected testcases
        const selectedTestcases = [...selectedNormalCases, ...selectedEdgeCases];

        // Initialize testcases passed array
        const testcasespassed = selectedTestcases.map(() => false);

        console.log(selectedTestcases);

        // Create submission record
        const submission = await prisma.submission.create({
            data: {
                code: data.code,
                problemId: data.problemId,
                userId: data.userId,
                testcasespassed: testcasespassed,
                evaluated: false,
                testcases: {
                    create: selectedTestcases.map((tc) => ({
                        testcase: {
                            connect: {id: tc.id}
                        }
                    })),
                },
            },
        });

        // Combine selected inputs with newlines
        const combinedInput = selectedTestcases.map((tc) => tc.input).join("\n");

        console.log("combinedInput: ", combinedInput);

        // Get number of testcases
        const numTestcases = selectedTestcases.length;

        // Get delimiter from env or use default
        const delimiter = process.env.DELIMITER || "|||";

        // Transform code using appropriate template
        const templateFunction = languageTemplates[data.language];
        let transformedCode = templateFunction(data.code, numTestcases, delimiter);

        // Remove duplicated imports from the final code
        transformedCode = removeDuplicateImports(transformedCode, data.language);

        console.log("code: \n", transformedCode);

        // Submit to Judge0
        const judgeResult = await judgeSolution(
            transformedCode,
            data.language,
            combinedInput,
            submission.id
        );

        console.log("judge submit", judgeResult);

        if (!judgeResult.success) {
            return {
                success: false,
                error: judgeResult.error,
            };
        }

        await prisma.submission.update({
            where: {
                id: submission.id,
            },
            data: {
                token: judgeResult.token,
            },
        });

        return {
            success: true,
            submission: {...submission, user: {name: user.name}},
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
