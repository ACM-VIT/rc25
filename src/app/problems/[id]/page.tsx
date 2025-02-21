import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import type { Round } from "@prisma/client";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import QuestionPage from "@/app/problems/[id]/question-page";
import { Prisma } from "@prisma/client";

type ProblemPayload = Prisma.ProblemGetPayload<{
  include: {
    Testcase: true;
    round: true;
    solution: true;
  };
}>;

export interface Problem extends Omit<ProblemPayload, "solution"> {
  solution?: { code: string; explanation: string };
  roundNumber: number;
  solutionExplanation?: string;
  slno?: number;
}

interface TestCase {
  id: string;
  weight: number;
  input: string;
  output: string;
  problemId: string;
  isEdge: boolean;
}

async function getProblem(id: string): Promise<Problem> {
  const problemData = await prisma.problem.findUnique({
    where: { id },
    include: {
      Testcase: true,
      round: true,
      solution: true,
    } as any,
  });
  if (!problemData) notFound();

  const round = (problemData as any).round as Round;
  const solution = (problemData as any).solution as { code: string; explanation: string } | null;

  return {
    ...problemData,
    roundNumber: round.number,
    solutionExplanation: solution ? solution.explanation : "",
  } as Problem;
}

async function getQuestions(roundId: string) {
  const problems = await prisma.problem.findMany({
    where: { roundId },
    orderBy: { id: "desc" },
  });
  return problems.map((problem, index) => ({
    ...problem,
    slno: index + 1,
  }));
}

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { Team: true },
  });
  return user;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const problem = await getProblem((await params).id);
    return {
      title: `${problem.title} - Round ${problem.round.number} | Reverse Coding`,
      description: `${problem.difficulty} difficulty problem: ${problem.description.substring(0, 150)}...`,
      openGraph: {
        title: problem.title,
        description: `Solve this ${problem.difficulty.toLowerCase()} difficulty problem in Round ${problem.round.number}`,
        type: "article",
      },
      robots: { index: false, follow: false },
      icons: { icon: "/favicon.ico" },
    };
  } catch {
    return {
      title: "Question Not Found",
      description: "The requested question could not be found",
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const problem = await getProblem(resolvedParams.id);
  const questions = await getQuestions(problem.round.id);
  const session = await auth();

  if (!session || !session.user || !session.user.id) notFound();

  const user = await getUser(session.user.id);
  const currentQuestion = questions.find((q) => q.id === resolvedParams.id);
  const currentSlno = currentQuestion?.slno ?? 1;

  return (
    <div>
      <QuestionPage
        problem={problem}
        session={{ user: { id: session.user.id } }}
        questions={questions}
        currentSlno={currentSlno}
        desc={<MDXRemote source={problem.description} />}
      />
    </div>
  );
}
