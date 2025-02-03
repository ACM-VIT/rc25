import ViewProblem from './QuestionDisplay';
import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import type { Problem as PrismaBaseProblem } from '@prisma/client';
import SwitchAdminProblemModeButton from '@/components/switch-admin-problem-mode';

interface Problem extends PrismaBaseProblem {
  Testcase: TestCase[];
  round: {
    number: number;
  };
}

interface PageParams {
  params: Promise<{
    id: string;
  }>;
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
    relationLoadStrategy: 'join',
    where: { id },
    include: {
      Testcase: true,
      round: {
        select: {
          number: true
        }
      }
    }
  });

  if (!problem) notFound();
  return problem;
}

export default async function Page({ params }: PageParams) {
  const resolvedParams = await params;
  const problem = await getProblem(resolvedParams.id);
  return (
    <>
      <ViewProblem problem={problem} />
      <SwitchAdminProblemModeButton problemId={problem.id} />
    </>
  );
}