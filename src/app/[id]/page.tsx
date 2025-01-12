import ViewProblem from './ProblemClient';
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
  web_code: string;
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

export default async function Page({ params }: PageParams) {
  const resolvedParams = await params;
  const problem = await getProblem(resolvedParams.id);
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  return <ViewProblem problem={problem} session={{ user: { id: session.user.id }}} />;
}