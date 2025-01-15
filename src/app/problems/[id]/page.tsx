import QuestionPage from "./question-page";
import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; // Import your auth

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

// Add interface for problem data
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
    }
  });

  if (!problem) notFound();
  return problem;
}

async function getQuestions(roundNumber: number) {
  const problems = await prisma.problem.findMany({
    where: { roundNumber },
    orderBy: { id: "asc" },
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const questions = problems.map((problem, index) => {
    const recentSubmission = problem.submissions[0];
    const passedArray = recentSubmission?.testcasespassed || [];
    const passCount = passedArray.filter(Boolean).length;
    const total = passedArray.length;
    const status = total > 0 ? `${passCount}/${total}` : "Not Attempted";
    return {
      slno: index + 1,
      id: problem.id,
      questionName: problem.title,
      difficulty: problem.difficulty,
      status,
    };
  });

  return questions;
}

export default async function Page({ params }: PageParams) {
  const resolvedParams = await params;
  const problem = await getProblem(resolvedParams.id);
  const questions = await getQuestions(problem.roundNumber);
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  // Find the current question's slno based on the problem id
  const currentQuestion = questions.find(q => q.id === resolvedParams.id);
  const currentSlno = currentQuestion ? currentQuestion.slno : 1;

  return <QuestionPage 
    problem={problem} 
    session={{ user: { id: session.user.id }}} 
    questions={questions} 
    currentSlno={currentSlno}
  />;
}