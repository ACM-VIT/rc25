import React from "react";
import Image from "next/image";
import { db } from "@/db";
import { problems, rounds, solve, teams, users, type Team, type User } from "@/db/schema";
import { calculateCurrentPoints, calculateSolveContribution } from "@/db/scoring";
import { notFound } from "next/navigation";
import { auth } from "../(auth)/auth";
import FloatingDock from "@/components/FloatingDock";
import Header from "@/components/Header";
import SignOut from "@/app/(auth)/authactions/signout";
import { and, eq, gte, inArray, lte } from "drizzle-orm";

type TeamWithMembers = Team & { members: User[] };

type ProblemScoreRow = {
    id: string;
    initial: number;
    minimum: number;
    decay: number;
};

type SolveRow = {
    problemId: string;
    teamId: string | null;
    testcasesPassed: number;
};

const buildEffectiveSolvesMap = (rows: SolveRow[]) => {
    const effectiveSolvesByProblem = new Map<string, number>();
    for (const row of rows) {
        const contribution = calculateSolveContribution(row.testcasesPassed);
        effectiveSolvesByProblem.set(
            row.problemId,
            (effectiveSolvesByProblem.get(row.problemId) ?? 0) + contribution
        );
    }
    return effectiveSolvesByProblem;
};

const calculateTeamRoundScore = (
    problemsInRound: ProblemScoreRow[],
    solves: SolveRow[],
    teamId: string
): number => {
    const effectiveSolvesByProblem = buildEffectiveSolvesMap(solves);
    const teamSolvesByProblem = new Map<string, number>();

    for (const row of solves) {
        if (row.teamId === teamId) {
            teamSolvesByProblem.set(row.problemId, row.testcasesPassed);
        }
    }

    let total = 0;
    for (const problem of problemsInRound) {
        const effectiveSolves = effectiveSolvesByProblem.get(problem.id) ?? 0;
        const currentPoints = calculateCurrentPoints({
            ...problem,
            effectiveSolves,
        });
        const teamPassed = teamSolvesByProblem.get(problem.id) ?? 0;
        if (teamPassed > 0) {
            total += Math.round(currentPoints * (teamPassed / 10));
        }
    }
    return total;
};

async function getTeam(userId: string): Promise<TeamWithMembers | null> {
    try {
        const userRows = await db
            .select({ teamId: users.teamId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const teamId = userRows[0]?.teamId;
        if (!teamId) return null;

        const teamRows = await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamId))
            .limit(1);
        const team = teamRows[0];
        if (!team) return null;

        const members = await db
            .select()
            .from(users)
            .where(eq(users.teamId, teamId));

        return { ...team, members };
    } catch (error) {
        console.error("Error fetching team:", error);
        return null;
    }
}

async function getQuestionsSolved(teamId: string) {
    const now = new Date();
    const currentRoundRows = await db
        .select()
        .from(rounds)
        .where(and(lte(rounds.start, now), gte(rounds.end, now)))
        .limit(1);

    const currentRound = currentRoundRows[0];
    if (!currentRound) return 0;

    const solveRows = await db
        .select({ problemId: solve.problemId })
        .from(solve)
        .innerJoin(problems, eq(solve.problemId, problems.id))
        .where(
            and(
                eq(solve.teamId, teamId),
                eq(problems.roundId, currentRound.id),
                gte(solve.testcasesPassed, 1)
            )
        );

    const uniqueProblemIds = new Set(solveRows.map((row) => row.problemId));
    return uniqueProblemIds.size;
}

async function getTeamScore(teamId: string) {
    const now = new Date();
    const currentRoundRows = await db
        .select()
        .from(rounds)
        .where(and(lte(rounds.start, now), gte(rounds.end, now)))
        .limit(1);

    const currentRound = currentRoundRows[0];
    if (!currentRound) return 0;

    const problemsInRound = await db
        .select({
            id: problems.id,
            initial: problems.initial,
            minimum: problems.minimum,
            decay: problems.decay,
        })
        .from(problems)
        .where(eq(problems.roundId, currentRound.id));

    const problemIds = problemsInRound.map((problem) => problem.id);
    const solveRows = problemIds.length
        ? await db
            .select({
                problemId: solve.problemId,
                teamId: solve.teamId,
                testcasesPassed: solve.testcasesPassed,
            })
            .from(solve)
            .where(inArray(solve.problemId, problemIds))
        : [];

    return calculateTeamRoundScore(problemsInRound, solveRows, teamId);
}

export default async function Page() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        notFound();
    }
    const team = await getTeam(session.user.id);
    if (!team) notFound();

    const questionsSolved = await getQuestionsSolved(team.id);
    const teamScore = await getTeamScore(team.id);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#0C0C0C] text-white">
            {/* Background */}
            <div className="fixed inset-0 w-full h-full bg-[#0C0C0C]" />

            {/* Top F1 Car Header */}
            <Header title={team.name} />

            {/* Content Container */}
            <div className="w-full max-w-[1400px] p-8 z-10 space-y-8 flex flex-col items-center">

                {/* Main Content */}
                <div className="relative w-full space-y-8">
                    {/* Team Members Grid - 2x2 */}
                    <div className={`grid grid-cols-2 gap-x-80 gap-y-8 mb-12 ${team.members.length > 4 ? 'max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : ''}`}>
                        {team.members.map((member, index) => (
                            <div key={member.id} className="relative w-full mx-auto">
                                <div className="flex justify-between items-center bg-[#080A0D] py-4 px-4 border-b-[3px] border-[#A7282D]">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src="/pokeball.svg"
                                            alt="Pokeball"
                                            width={28}
                                            height={28}
                                            className="w-7 h-7 flex-shrink-0 -mt-3"
                                        />
                                        <div className="flex flex-col">
                                            <p className="font-['Formula1-Bold'] text-white">
                                                {member.name?.slice(0, member.name.lastIndexOf(" ")) || "Anonymous"}
                                            </p>
                                            <p className="text-sm text-gray-400 font-['Formula1-Regular']">
                                                {team.name}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-['Orbitron'] text-4xl text-white opacity-45 ">
                                        {Math.floor(Math.random()*91)+10}
                                    </p>
                                </div>
                                <div className="h-[7px] bg-black"></div>
                                <div className="h-[9px] bg-[#222221]"></div>
                            </div>
                        ))}
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-24 max-w-5xl mx-auto">
                        {/* Points Earned */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-8">
                                <Image
                                    src="/cheqflag.svg"
                                    alt="Checkered Flag"
                                    width={50}
                                    height={50}
                                />
                                <h3 className="text-xl font-['Formula1-Bold'] uppercase text-white">
                                    Points<br />Earned
                                </h3>
                            </div>

                            {/* Frame Structure */}
                            <div className="w-full max-w-[400px] relative">
                                {/* Top red rounded bar */}
                                <div className="absolute top-0 left-4 right-4 h-3 bg-[#A7282D] rounded-full z-10"></div>

                                {/* Corner brackets connecting to red bar */}
                                <div className="absolute top-1 left-[-24px] w-12 h-[63px] border-l-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>
                                <div className="absolute top-1 right-[-24px] w-12 h-[63px] border-r-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>

                                {/* Digit boxes container */}
                                <div className="flex gap-4 justify-center pt-16 pb-6">
                                    {String(teamScore).padStart(3, '0').split('').map((digit, index) => (
                                        <div key={index} className="relative w-32 h-40 border-2 border-[#A7282D] outline outline-2 outline-[#A7282D] flex items-center justify-center bg-[#0C0C0C] overflow-hidden">
                                            <span className="text-8xl text-white font-bold relative z-10" style={{ fontFamily: 'Orbitron, monospace' }}>
                                                {digit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Questions Solved */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-8">
                                <Image
                                    src="/cheqflag.svg"
                                    alt="Checkered Flag"
                                    width={50}
                                    height={50}
                                />
                                <h3 className="text-xl font-['Formula1-Bold'] uppercase text-white">
                                    Questions<br />Solved
                                </h3>
                            </div>

                            {/* Frame Structure */}
                            <div className="w-full max-w-[320px] relative">
                                {/* Top red rounded bar */}
                                <div className="absolute top-0 left-4 right-4 h-3 bg-[#A7282D] rounded-full z-10"></div>

                                {/* Corner brackets connecting to red bar */}
                                <div className="absolute top-1 left-0 w-6 h-[64px] border-l-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>
                                <div className="absolute top-1 right-0 w-6 h-[64px] border-r-[5px] border-t-[5px] border-b-[5px] border-[#ADADAD]"></div>

                                {/* Digit boxes container */}
                                <div className="flex gap-4 justify-center pt-16 pb-6">
                                    {String(questionsSolved).padStart(2, '0').split('').map((digit, index) => (
                                        <div key={index} className="relative w-32 h-40 border-2 border-[#A7282D] outline outline-2 outline-[#A7282D] flex items-center justify-center bg-[#0C0C0C] overflow-hidden">
                                            <span className="text-8xl text-white font-bold relative z-10" style={{ fontFamily: 'Orbitron, monospace' }}>
                                                {digit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Out Button */}
            <button
                onClick={SignOut}
                type="button"
                className="fixed bottom-8 right-8 px-8 py-3 bg-[#A7282D] text-white font-['Formula1-Bold'] text-lg hover:bg-[#8a1f24] transition-colors z-50 rounded-full"
            >
                Log Out
            </button>

            {/* Floating Dock */}
            <FloatingDock />
        </div>
    );
}
