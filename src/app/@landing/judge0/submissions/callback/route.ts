import {type NextRequest, NextResponse} from "next/server";
import { db } from "@/db";
import {
    problems,
    submissions,
    teamTestcaseSolves,
    teams,
    testcaseSubmissions,
    testcases,
    users,
} from "@/db/schema";
import {firestoreService} from "@/lib/firebase-admin-service";
import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";

const EvalEnum = {
    ACCEPTED: "ACCEPTED",
    RUNTIME_ERROR: "RUNTIME_ERROR",
    COMPILE_ERROR: "COMPILE_ERROR",
} as const;

interface WebhookBody {
    token: string;
    stdout: string;
    status: string | null;
    stderr: string | null;
    compile_output: string | null;
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // console.log("Request body:", body);
        const {token, stdout, stderr, compile_output }: WebhookBody = body;

        const submissionRows = await db
            .select({
                submission: submissions,
                testcaseSubmission: testcaseSubmissions,
                testcase: testcases,
            })
            .from(submissions)
            .leftJoin(testcaseSubmissions, eq(submissions.id, testcaseSubmissions.submissionId))
            .leftJoin(testcases, eq(testcaseSubmissions.testcaseId, testcases.id))
            .where(eq(submissions.token, token))
            .orderBy(asc(testcaseSubmissions.sequence));

        const submission = submissionRows[0]?.submission;

        if (!submission) {
            return NextResponse.json(
                {message: "Submission not found"},
                {status: 404}
            );
        }

        const testcaseRelations = submissionRows
            .filter((row) => row.testcase && row.testcaseSubmission)
            .map((row) => ({
                testcase: {
                    id: row.testcase!.id,
                    output: row.testcase!.output,
                    weight: row.testcase!.weight,
                    dynamicDecay: row.testcase!.dynamicDecay,
                    dynamicMin: row.testcase!.dynamicMin,
                },
                sequence: row.testcaseSubmission!.sequence ?? 0,
            }))
            .sort((a, b) => a.sequence - b.sequence);

        if (compile_output) {
            await db
                .update(submissions)
                .set({
                    evaluated: true,
                    evaluationStatus: EvalEnum.COMPILE_ERROR,
                })
                .where(eq(submissions.id, submission.id));
            await firestoreService.submissions.processed(submission.id);
            return NextResponse.json(
                {message: "Submission failed with compile error"},
                {status: 200}
            );
        }

        if (stderr) {
            await db
                .update(submissions)
                .set({
                    evaluated: true,
                    evaluationStatus: EvalEnum.RUNTIME_ERROR,
                })
                .where(eq(submissions.id, submission.id));
            await firestoreService.submissions.processed(submission.id);
            return NextResponse.json(
                {message: "Submission failed with runtime error"},
                {status: 200}
            );
        }

        // console.log("Submission:", submission);
        const decodedStdout = Buffer.from(stdout, 'base64').toString('utf-8');

        // Split stdout using delimiter
        const delimiter = process.env.DELIMITER || "|||";
        const outputs = decodedStdout.split(delimiter);

        // console.log("Raw stdout:", stdout);
        // console.log("Split outputs:", outputs);

        // Retrieve problem to get maxScore for weight calculations
        const problemRows = await db
            .select({ maxScore: problems.maxScore })
            .from(problems)
            .where(eq(problems.id, submission.problemId))
            .limit(1);
        const problem = problemRows[0];
        if (!problem) {
            return NextResponse.json({message: "Problem not found"}, {status: 400});
        }

        // Compare outputs with testcases
        const testcasespassed = testcaseRelations.map((relation, index) => {
            const expectedOutput = relation.testcase.output.trim();
            const actualOutput = outputs[index]?.trim() || "";
            return expectedOutput === actualOutput;
        });

        // Calculate total ratio from test cases
        const totalRatio = testcaseRelations.reduce(
            (acc, rel) => acc + rel.testcase.weight,
            0
        );

        // Function to compute effective weight for a testcase
        const effectiveWeight = (index: number): number => {
            return (problem.maxScore / totalRatio) * testcaseRelations[index].testcase.weight;
        };

        // Get user's team
        const userRows = await db
            .select({ user: users, team: teams })
            .from(users)
            .leftJoin(teams, eq(users.teamId, teams.id))
            .where(eq(users.id, submission.userId))
            .limit(1);
        const user = userRows[0]?.user ?? null;
        const team = userRows[0]?.team ?? null;

        if (!user || !team) {
            return NextResponse.json(
                {message: "User not in team"},
                {status: 400}
            );
        }

        const adminTeamId = process.env.ADMIN_TEAM_ID || "";
        const isHiddenTeam = team.disqualify || (adminTeamId && team.id === adminTeamId);

        const defaultDecay = Number.parseInt(process.env.DYNAMIC_TESTCASE_DECAY ?? "50", 10);
        const defaultMinPercent = Number.parseFloat(process.env.DYNAMIC_TESTCASE_MIN_PERCENT ?? "0.1");
        const defaultMinPoints = Number.parseInt(process.env.DYNAMIC_TESTCASE_MIN_POINTS ?? "", 10);

        const safeDecay = Number.isFinite(defaultDecay) ? defaultDecay : 0;
        const safeMinPercent = Number.isFinite(defaultMinPercent) ? defaultMinPercent : 0;
        const safeMinPoints = Number.isFinite(defaultMinPoints) ? defaultMinPoints : null;

        const computeDynamicValue = (
            initial: number,
            minimum: number,
            decay: number,
            solveCount: number
        ): number => {
            if (!Number.isFinite(initial) || !Number.isFinite(decay) || decay <= 0) {
                return Math.round(initial);
            }
            const rawValue = (((minimum - initial) / (decay ** 2)) * (solveCount ** 2)) + initial;
            const capped = Math.max(minimum, Math.ceil(rawValue));
            return Number.isFinite(capped) ? capped : Math.round(initial);
        };

        const resolveMinimum = (initial: number, testcaseMin: number | null): number => {
            const fallbackMin = safeMinPoints !== null ? safeMinPoints : Math.ceil(initial * safeMinPercent);
            const resolved = testcaseMin ?? fallbackMin;
            if (!Number.isFinite(resolved)) return 0;
            return Math.min(Math.ceil(initial), Math.max(0, resolved));
        };

        const resolveDecay = (testcaseDecay: number | null): number => {
            if (Number.isFinite(testcaseDecay)) return testcaseDecay;
            return safeDecay;
        };

        const passedTestcaseIds = testcaseRelations
            .map((relation, index) => (testcasespassed[index] ? relation.testcase.id : null))
            .filter((id): id is string => Boolean(id));

        const visibleConditions = passedTestcaseIds.length
            ? [
                inArray(teamTestcaseSolves.testcaseId, passedTestcaseIds),
                eq(teams.disqualify, false),
            ]
            : [];
        if (passedTestcaseIds.length && adminTeamId) {
            visibleConditions.push(ne(teams.id, adminTeamId));
        }

        const visibleSolves = passedTestcaseIds.length
            ? await db
                .select({
                    testcaseId: teamTestcaseSolves.testcaseId,
                    teamId: teamTestcaseSolves.teamId,
                })
                .from(teamTestcaseSolves)
                .innerJoin(teams, eq(teamTestcaseSolves.teamId, teams.id))
                .where(and(...visibleConditions))
            : [];

        const solveCountByTestcase = new Map<string, number>();
        const solverTeamsByTestcase = new Map<string, string[]>();

        for (const solve of visibleSolves) {
            solveCountByTestcase.set(
                solve.testcaseId,
                (solveCountByTestcase.get(solve.testcaseId) ?? 0) + 1
            );
            const teams = solverTeamsByTestcase.get(solve.testcaseId) ?? [];
            teams.push(solve.teamId);
            solverTeamsByTestcase.set(solve.testcaseId, teams);
        }

        const alreadySolvedRows = passedTestcaseIds.length
            ? await db
                .select({ testcaseId: teamTestcaseSolves.testcaseId })
                .from(teamTestcaseSolves)
                .where(
                    and(
                        eq(teamTestcaseSolves.teamId, team.id),
                        inArray(teamTestcaseSolves.testcaseId, passedTestcaseIds)
                    )
                )
            : [];

        const alreadySolved = new Set(alreadySolvedRows.map((row) => row.testcaseId));

        let submissionScore = 0;
        let currentTeamIncrement = 0;
        const teamScoreDeltas = new Map<string, number>();
        const newSolveTestcaseIds: string[] = [];

        testcaseRelations.forEach((relation, index) => {
            if (!testcasespassed[index]) return;

            const testcaseId = relation.testcase.id;
            const initial = effectiveWeight(index);
            const minimum = resolveMinimum(initial, relation.testcase.dynamicMin ?? null);
            const decay = resolveDecay(relation.testcase.dynamicDecay ?? null);

            const baseSolveCount = solveCountByTestcase.get(testcaseId) ?? 0;
            const hasSolved = alreadySolved.has(testcaseId);
            const countsTowardDecay = !isHiddenTeam;
            const shouldIncreaseCount = !hasSolved && countsTowardDecay;

            const solveCountForValue = baseSolveCount + (shouldIncreaseCount ? 1 : 0);
            const valueForSolve = computeDynamicValue(initial, minimum, decay, solveCountForValue);
            submissionScore += valueForSolve;

            if (hasSolved) {
                return;
            }

            newSolveTestcaseIds.push(testcaseId);

            if (countsTowardDecay) {
                const oldValue = computeDynamicValue(initial, minimum, decay, baseSolveCount);
                const deltaExisting = valueForSolve - oldValue;

                if (deltaExisting !== 0) {
                    const solverTeams = solverTeamsByTestcase.get(testcaseId) ?? [];
                    solverTeams.forEach((teamId) => {
                        teamScoreDeltas.set(teamId, (teamScoreDeltas.get(teamId) ?? 0) + deltaExisting);
                    });
                }
            }

            currentTeamIncrement += valueForSolve;
        });

        const finalTestCasesPassed = testcasespassed;

        const updatedTeam = await db.transaction(async (tx) => {
            await tx
                .update(submissions)
                .set({
                    testcasespassed: finalTestCasesPassed,
                    score: submissionScore,
                    evaluated: true,
                    evaluationStatus: EvalEnum.ACCEPTED,
                })
                .where(eq(submissions.id, submission.id));

            if (newSolveTestcaseIds.length) {
                await tx
                    .insert(teamTestcaseSolves)
                    .values(
                        newSolveTestcaseIds.map((testcaseId) => ({
                            teamId: team.id,
                            testcaseId,
                        }))
                    )
                    .onConflictDoNothing();
            }

            for (const [teamId, delta] of teamScoreDeltas) {
                if (delta === 0 || teamId === team.id) continue;
                await tx
                    .update(teams)
                    .set({
                        score: sql`${teams.score} + ${delta}`,
                    })
                    .where(eq(teams.id, teamId));
            }

            const updated = await tx
                .update(teams)
                .set({
                    score: sql`${teams.score} + ${currentTeamIncrement}`,
                })
                .where(eq(teams.id, team.id))
                .returning({ score: teams.score });

            return updated[0];
        });

        await Promise.all([
            firestoreService.submissions.processed(submission.id),
            firestoreService.leaderboard.updateTeam({
                id: team.id,
                name: team.name,
                score: updatedTeam?.score ?? team.score,
            }),
        ]);

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
