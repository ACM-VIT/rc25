import QuestionPage from "./question-page";
import { db } from "@/db";
import { problems, rounds, testcases, teams, users, type Round } from "@/db/schema";
import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; // Import your auth

import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { desc, eq } from "drizzle-orm";

export async function generateMetadata({
    params,
}: PageParams): Promise<Metadata> {
    try {
        const problem = await getProblem((await params).id);
        return {
            title: `${problem.title} - Round ${problem.round.number} | Reverse Coding`,
            description: `${
                problem.difficulty
            } difficulty problem: ${problem.description.substring(0, 150)}...`,
            openGraph: {
                title: `${problem.title}`,
                description: `Solve this ${problem.difficulty.toLowerCase()} difficulty problem in Round ${
                    problem.round.number
                }`,
                type: "article",
            },
            robots: {
                index: false,
                follow: false,
            },
            icons: {
                icon: "/favicon.ico",
            },
        };
    } catch {
        return {
            title: "Question Not Found",
            description: "The requested question could not be found",
        };
    }
}

interface PageParams {
    params: Promise<{
        id: string;
    }>;
}

export interface Problem {
    id: string;
    title: string;
    nickname: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    initial: number;
    roundNumber: number;
    description: string;
    normal_cases: number;
    edge_cases: number;
    Testcase: TestCase[];
    round: Round;
    slno?: number; // Add slno property
}

interface TestCase {
    id: string;
    weight: number;
    input: string;
    output: string;
    isEdge: boolean;
}

async function getProblem(id: string) {
    const problemRows = await db
        .select({ problem: problems, round: rounds })
        .from(problems)
        .innerJoin(rounds, eq(problems.roundId, rounds.id))
        .where(eq(problems.id, id))
        .limit(1);
    const problemRow = problemRows[0];
    if (!problemRow) notFound();

    const testcaseRows = await db
        .select()
        .from(testcases)
        .where(eq(testcases.problemId, id));

    return {
        ...problemRow.problem,
        Testcase: testcaseRows,
        round: problemRow.round,
    };
}

async function getQuestions(roundId: string) {
    // Change parameter type
    const problemRows = await db
        .select()
        .from(problems)
        .where(eq(problems.roundId, roundId))
        .orderBy(desc(problems.id));

    // Add slno property based on array index
    return problemRows.map((problem, index) => ({
        ...problem,
        slno: index + 1,
    }));
}

async function getUser(id: string) {
    const userRows = await db
        .select({ user: users, team: teams })
        .from(users)
        .leftJoin(teams, eq(users.teamId, teams.id))
        .where(eq(users.id, id))
        .limit(1);
    const row = userRows[0];
    if (!row) return null;
    return { ...row.user, Team: row.team ?? null };
}

export default async function Page({ params }: PageParams) {
    const resolvedParams = await params;
    const problem = await getProblem(resolvedParams.id);
    const questions = await getQuestions(problem.round.id);
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        notFound();
    }

    const user = await getUser(session.user.id);

    // Find the current question's slno based on the problem id
    const currentQuestion = questions.find((q) => q.id === resolvedParams.id);
    const currentSlno = currentQuestion?.slno ?? 1;

    // console.log("User:", user);

    if (
        !problem ||
        ((problem.round.start > new Date() || problem.round.end < new Date()) &&
            user?.Team?.id !== process.env.ADMIN_TEAM_ID) ||
        (problem.isHidden && user?.Team?.id !== process.env.ADMIN_TEAM_ID)
    )
        notFound();
    
    return (
        <div>
            <QuestionPage
                desc={<MDXRemote source={problem.description} options={{ mdxOptions: { format: 'md' } }} />}
                problem={problem}
                session={{ user: { id: session.user.id } }}
                questions={questions}
                currentSlno={currentSlno}
            />
        </div>
    );
}
