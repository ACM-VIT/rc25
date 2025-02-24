import ViewProblem from './QuestionDisplay';
import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import type { Problem as PrismaBaseProblem } from '@prisma/client';
import SwitchAdminProblemModeButton from '@/components/switch-admin-problem-mode';
import SolutionEditorModal from "./SolutionEditorModal";

interface TestCase {
  id: string;
  weight: number;
  input: string;
  output: string;
  isEdge: boolean;
}

interface Problem extends PrismaBaseProblem {
  Testcase: TestCase[];
  round: {
    number: number;
  };
  solution: {
    id: string;
    code: string;
    problemId: string;
    explanation: string;
  } | null;
  solutionExplanation?: string;
}

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

async function getProblem(id: string): Promise<Problem> {
  const problemData = await prisma.problem.findUnique({
    relationLoadStrategy: 'join',
    where: { id },
    include: {
      Testcase: true,
      round: { select: { number: true } },
      solution: true,
    }
  });

  if (!problemData) notFound();

  const round = problemData.round as { number: number };
  const solution = problemData.solution as
    | { id: string; code: string; problemId: string; explanation: string }
    | null;

  return {
    ...problemData,
    round: { number: round.number },
    solution,
    solutionExplanation: solution ? solution.explanation : "",
  } as Problem;
}

export default async function Page({ params }: PageParams) {
  const resolvedParams = await params;
  const problem = await getProblem(resolvedParams.id);
  return (
    <>
      <ViewProblem problem={problem} />
      <SwitchAdminProblemModeButton problemId={problem.id} />
      <SolutionEditorModal
        problemId={problem.id}
        initialCode={problem.solution?.code || ""}
        initialExplanation={problem.solution?.explanation || ""}
      />
    </>
  );
}
