import { prisma } from "@/utils/prisma";
import {
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from "@/utils/judge0-langs";
import {
    pythonFunction,
    cFunction,
    cppFunction,
    javaFunction,
    jsFunction,
    goFunction,
    rustFunction,
} from "@/utils/funcconvert";
import { firestoreService } from "@/lib/firebase-admin-service";
import { EvalEnum } from "@prisma/client";

const languageTemplates = {
    python: pythonFunction,
    c: cFunction,
    cpp: cppFunction,
    java: javaFunction,
    javascript: jsFunction,
    go: goFunction,
    rust: rustFunction,
} as const;

function removeDuplicateImports(
    code: string,
    language: SupportedLanguage
): string {
    const importPatterns: Partial<Record<SupportedLanguage, RegExp[]>> = {
        cpp: [/#include\s*<[^>]+>/g],
        java: [/import\s+[^;]+;/g],
        python: [/^from\s+[\w.]+\s+import\s+.*$/gm, /^import\s+.*$/gm],
        go: [/^import\s*\([^)]*\)/gm, /^import\s+".*?"$/gm],
        rust: [
            /^use\s+[^;]+;/gm,
            /^use\s+[^{]+\{[^}]+\};/gm,
            /^use\s+[^:]+::[^;]+;/gm,
        ],
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
        cleanCode = cleanCode.replace(pattern, "");
    }

    let importSection = "";
    if (language === "go" && allImports.size > 0) {
        importSection = `import (\n  ${Array.from(allImports).join("\n  ")}\n)\n`;
    } else if (allImports.size > 0) {
        importSection = `${Array.from(allImports).join("\n")}\n`;
    }

    return importSection + cleanCode.trim();
}

export interface SubmissionInput {
    code: string;
    problemId: string;
    userId: string;
    language: SupportedLanguage;
    submissionId: string;
}

export interface SerializedTestcase {
    id: string;
    input: string;
    output: string;
    weight: number;
    sequence: number;
}

export interface SubmissionContext {
    submissionId: string;
    problemId: string;
    maxScore: number;
    userId: string;
    userName: string;
    teamId: string;
    teamName: string;
    testcases: SerializedTestcase[];
    transformedCode: string;
    languageId: number;
    language: SupportedLanguage;
}

/**
 * Step 1: Fetch all required data, validate, create submission record, and
 * serialize everything needed for subsequent steps.
 */
export async function initializeSubmission(
    data: SubmissionInput
): Promise<SubmissionContext> {
    "use step";

    const problem = await prisma.problem.findUnique({
        relationLoadStrategy: "join",
        where: { id: data.problemId },
        include: {
            round: {
                select: { start: true, end: true, number: true },
            },
            Testcase: true,
        },
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    const user = await prisma.user.findUnique({
        relationLoadStrategy: "join",
        where: { id: data.userId },
        include: { Team: true },
    });

    const userTeam = user?.Team;

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

    // Split into normal and edge cases
    const normalCases = problem.Testcase.filter((tc) => !tc.isEdge);
    const edgeCases = problem.Testcase.filter((tc) => tc.isEdge);

    const getRandomElements = <T>(arr: T[], n: number): T[] => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    const selectedNormalCases = getRandomElements(
        normalCases,
        problem.normal_cases
    );
    const selectedEdgeCases = getRandomElements(edgeCases, problem.edge_cases);
    const selectedTestcases = [...selectedNormalCases, ...selectedEdgeCases];

    const testcasespassed = selectedTestcases.map(() => false);

    // Create submission record using the pre-generated ID from the server action
    const submission = await prisma.submission.create({
        data: {
            id: data.submissionId,
            code: data.code,
            problemId: data.problemId,
            userId: data.userId,
            testcasespassed,
            evaluated: false,
            testcases: {
                create: selectedTestcases.map((tc, index) => ({
                    testcase: { connect: { id: tc.id } },
                    sequence: index,
                })),
            },
        },
    });

    // Mark submission as created in Firebase for real-time UI updates
    await firestoreService.submissions.created(submission.id);

    // Transform code for single-testcase execution (numTestcases=1 per Judge0 call)
    const delimiter = process.env.DELIMITER || "|||";
    const templateFunction = languageTemplates[data.language];
    let transformedCode = templateFunction(data.code, 1, delimiter);
    transformedCode = removeDuplicateImports(transformedCode, data.language);

    // Serialize all data needed for evaluation
    const serializedTestcases: SerializedTestcase[] = selectedTestcases.map(
        (tc, index) => ({
            id: tc.id,
            input: tc.input,
            output: tc.output,
            weight: tc.weight,
            sequence: index,
        })
    );

    return {
        submissionId: submission.id,
        problemId: data.problemId,
        maxScore: problem.maxScore,
        userId: data.userId,
        userName: user.name || "Unknown",
        teamId: userTeam.id,
        teamName: userTeam.name,
        testcases: serializedTestcases,
        transformedCode,
        languageId: SUPPORTED_LANGUAGES[data.language].id,
        language: data.language,
    };
}

/**
 * Step (called per testcase): Submit a single testcase to Judge0 with a
 * specific webhook callback URL.
 */
export async function submitTestcaseToJudge0(params: {
    transformedCode: string;
    languageId: number;
    input: string;
    webhookUrl: string;
}): Promise<void> {
    "use step";

    const encodedCode = Buffer.from(params.transformedCode).toString("base64");
    const encodedStdin = Buffer.from(params.input).toString("base64");

    const response = await fetch(
        "https://judge0-ce.p.sulu.sh/submissions?base64_encoded=true&wait=false&fields=*",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${process.env.SULU_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language_id: params.languageId,
                source_code: encodedCode,
                stdin: encodedStdin,
                callback_url: params.webhookUrl,
            }),
        }
    );

    const result = await response.json();

    if (!result.token) {
        throw new Error("No submission token received from Judge0");
    }
}

export interface Judge0WebhookResult {
    token?: string;
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    status?: { id: number; description: string } | null;
}

/**
 * Step 3: Evaluate all testcase results, calculate scores, update submission
 * and team records, and notify Firebase. Uses only serialized data from step 1
 * — no repeated database reads for problem/testcase data.
 */
export async function evaluateAndStore(params: {
    context: SubmissionContext;
    results: Judge0WebhookResult[];
}): Promise<void> {
    "use step";

    const { context, results } = params;
    const delimiter = process.env.DELIMITER || "|||";

    // Check for compile/runtime errors across all testcases.
    // If any testcase has a compile error, the whole submission is a compile error.
    // If any testcase has a runtime error (and no compile error), it's a runtime error.
    const hasCompileError = results.some((r) => r.compile_output);
    const hasRuntimeError = results.some((r) => r.stderr);

    if (hasCompileError) {
        await prisma.submission.update({
            where: { id: context.submissionId },
            data: {
                evaluated: true,
                evaluationStatus: EvalEnum.COMPILE_ERROR,
            },
        });
        await firestoreService.submissions.processed(context.submissionId);
        return;
    }

    if (hasRuntimeError) {
        await prisma.submission.update({
            where: { id: context.submissionId },
            data: {
                evaluated: true,
                evaluationStatus: EvalEnum.RUNTIME_ERROR,
            },
        });
        await firestoreService.submissions.processed(context.submissionId);
        return;
    }

    // Compare each testcase output
    const testcasespassed = context.testcases.map((tc, index) => {
        const result = results[index];
        if (!result.stdout) return false;

        const decodedStdout = Buffer.from(result.stdout, "base64").toString(
            "utf-8"
        );
        // Output may have trailing delimiter from the template, split and take first part
        const actualOutput = decodedStdout.split(delimiter)[0]?.trim() || "";
        const expectedOutput = tc.output.trim();

        return actualOutput === expectedOutput;
    });

    // Calculate total weight ratio from selected testcases
    const totalRatio = context.testcases.reduce(
        (acc, tc) => acc + tc.weight,
        0
    );

    const effectiveWeight = (index: number): number => {
        return (
            (context.maxScore / totalRatio) * context.testcases[index].weight
        );
    };

    // Compute individual submission score
    const individualSubmissionScore = testcasespassed.reduce(
        (acc, isPassed, index) => {
            return isPassed ? acc + effectiveWeight(index) : acc;
        },
        0
    );

    // Calculate team score change — only for NEW testcases not previously passed
    await prisma.$transaction(async () => {
        const teamSubmissions = await prisma.submission.findMany({
            relationLoadStrategy: "join",
            where: {
                problemId: context.problemId,
                user: { teamId: context.teamId },
            },
            include: {
                testcases: {
                    include: {
                        testcase: {
                            select: { id: true, weight: true },
                        },
                    },
                },
                user: {
                    select: { id: true, teamId: true },
                },
            },
        });

        const teamTestResults = context.testcases.map((_, index) => {
            return teamSubmissions.some((sub) => sub.testcasespassed[index]);
        });

        let scoreChange = 0;
        testcasespassed.forEach((isPassed, index) => {
            const wasPassedByTeam = teamTestResults[index];
            if (!wasPassedByTeam && isPassed) {
                scoreChange += effectiveWeight(index);
            }
        });

        const [{}, { score }] = await Promise.all([
            prisma.submission.update({
                where: { id: context.submissionId },
                data: {
                    testcasespassed,
                    score: individualSubmissionScore,
                    evaluated: true,
                    evaluationStatus: EvalEnum.ACCEPTED,
                },
            }),
            prisma.team.update({
                where: { id: context.teamId },
                data: {
                    score: { increment: scoreChange },
                },
            }),
        ]);

        await Promise.all([
            firestoreService.submissions.processed(context.submissionId),
            firestoreService.leaderboard.updateTeam({
                id: context.teamId,
                name: context.teamName,
                score,
            }),
        ]);
    });
}
