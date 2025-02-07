import {type NextRequest, NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
import {firestoreService} from "@/lib/firebase-admin-service";
import {EvalEnum} from "@prisma/client";

interface WebhookBody {
    token: string;
    stdout: string;
    status?: string;
    stderr?: string;
    compile_output?: string;
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // console.log("Request body:", body);
        const {token, stdout, stderr, compile_output }: WebhookBody = body;
        
        // Base64 decode the stdout
        const decodedStdout = Buffer.from(stdout, 'base64').toString('utf-8');

        const submission = await prisma.submission.findUnique({
            relationLoadStrategy: 'join',
            where: {token: token},
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
                    },
                    orderBy: {
                        sequence: 'asc'
                    }
                },
            },
        });

        if (!submission) {
            return NextResponse.json(
                {message: "Submission not found"},
                {status: 404}
            );
        }

        if (compile_output !== "") {
            await prisma.submission.update({
                where: {id: submission.id},
                data: {
                    evaluated: true,
                    evaluationStatus: EvalEnum.COMPILE_ERROR
                },
            });
            return NextResponse.json(
                {message: "Submission failed with compile error"},
                {status: 200}
            );
        }

        if (stderr !== "") {
            await prisma.submission.update({
                where: {id: submission.id},
                data: {
                    evaluated: true,
                    evaluationStatus: EvalEnum.RUNTIME_ERROR
                },
            });
            return NextResponse.json(
                {message: "Submission failed with runtime error"},
                {status: 200}
            );
        }

        // console.log("Submission:", submission);

        // Split stdout using delimiter
        const delimiter = process.env.DELIMITER || "|||";
        const outputs = decodedStdout.split(delimiter);

        // console.log("Raw stdout:", stdout);
        // console.log("Split outputs:", outputs);

        // Retrieve problem to get maxScore for weight calculations
        const problem = await prisma.problem.findUnique({
            relationLoadStrategy: 'join',
            where: {id: submission.problemId},
            select: {maxScore: true},
        });
        if (!problem) {
            return NextResponse.json({message: "Problem not found"}, {status: 400});
        }

        // Compare outputs with testcases
        const testcasespassed = submission.testcases.map((relation, index) => {
            const expectedOutput = relation.testcase.output.trim();
            const actualOutput = outputs[index]?.trim() || "";
            return expectedOutput === actualOutput;
        });

        // Calculate total ratio from test cases
        const totalRatio = submission.testcases.reduce(
            (acc, rel) => acc + rel.testcase.weight,
            0
        );

        // Function to compute effective weight for a testcase
        const effectiveWeight = (index: number): number => {
            return (problem.maxScore / totalRatio) * submission.testcases[index].testcase.weight;
        };

        // Compute individual submission score using effective weight
        const invidualSubmissionScore = testcasespassed.reduce((acc, isPassed, index) => {
            if (isPassed) {
                return acc + effectiveWeight(index);
            }
            return acc;
        }, 0);

        // Get user's team
        const user = await prisma.user.findUnique({
            relationLoadStrategy: 'join',
            where: {id: submission.userId},
            include: {Team: true},
        });

        if (!user?.Team) {
            return NextResponse.json(
                {message: "User not in team"},
                {status: 400}
            );
        }

        await prisma.$transaction(async () => {

            // Get all team submissions for this problem
            const teamSubmissions = await prisma.submission.findMany({
                relationLoadStrategy: 'join',
                where: {
                    problemId: submission.problemId,
                    user: {
                        teamId: user.Team!.id,
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

            const teamTestResults = submission.testcases.map((_, index) => {
                return teamSubmissions.some((sub) => sub.testcasespassed[index]);
            });

            const finalTestCasesPassed = testcasespassed;

            let scoreChange = 0;
            testcasespassed.forEach((isPassed, index) => {
                const wasPassedByTeam = teamTestResults[index];
                if (!wasPassedByTeam && isPassed) {
                    scoreChange += effectiveWeight(index);
                }
            });

            const [{}, {score}] = await Promise.all([prisma.submission.update({
                where: {id: submission.id},
                data: {
                    testcasespassed: finalTestCasesPassed,
                    score: invidualSubmissionScore,
                    evaluated: true,
                    evaluationStatus: EvalEnum.ACCEPTED
                },
            }), prisma.team.update({
                where: {id: user.Team!.id},
                data: {
                    score: {
                        increment: scoreChange,
                    },
                },
            })])

            await Promise.all([firestoreService.submissions.processed(submission.id), firestoreService.leaderboard.updateTeam({
                id: user.Team!.id,
                name: user.Team!.name,
                score
            })])
        });

        return NextResponse.json(
            {message: "Submission updated successfully"},
            {status: 200}
        );
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Error processing POST request:", errorMessage);

        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500}
        );
    }
}
