import QuestionPage from "./question-page";
import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; // Import your auth
import type { Round } from "@prisma/client";


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
  maxScore: number;
  roundNumber: number;
  description: string;
  normal_cases: number;
  edge_cases: number;
  lin_dl: string;
  win_dl: string;
  mac_dl: string;
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

async function getProblem(id: string): Promise<Problem> {
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      Testcase: true,
      round: true, // Include round data
    }
  });

  if (!problem) notFound();
  return {
    ...problem,
    roundNumber: problem.round.number
  };
}

async function getQuestions(roundId: string) { // Change parameter type
  const problems = await prisma.problem.findMany({
    where: { roundId }, // Filter by roundId
    orderBy: { id: "desc" }, // Change order to desc
  });
  
  // Add slno property based on array index
  return problems.map((problem, index) => ({
    ...problem,
    slno: index + 1
  }));
}

export default async function Page({ params }: PageParams) {
  const resolvedParams = await params;
  const problem = await getProblem(resolvedParams.id);
  const questions = await getQuestions(problem.round.id);
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  // Find the current question's slno based on the problem id
  const currentQuestion = questions.find(q => q.id === resolvedParams.id);
  const currentSlno = currentQuestion?.slno ?? 1;

  return <QuestionPage 
    problem={problem} 
    session={{ user: { id: session.user.id }}} 
    questions={questions} 
    currentSlno={currentSlno}
  />;
}