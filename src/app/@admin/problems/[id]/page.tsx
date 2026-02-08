import ViewProblem from './QuestionDisplay';
import { db } from "@/db";
import { problems, rounds, testcases, type Problem as PrismaBaseProblem } from "@/db/schema";
import { selectTestcasesSafe } from "@/db/testcase-queries";
import { notFound } from "next/navigation";
import SwitchAdminProblemModeButton from '@/components/switch-admin-problem-mode';
import { eq } from "drizzle-orm";

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
  const problemRows = await db
    .select({ problem: problems, roundNumber: rounds.number })
    .from(problems)
    .innerJoin(rounds, eq(problems.roundId, rounds.id))
    .where(eq(problems.id, id))
    .limit(1);

  const problemRow = problemRows[0];
  if (!problemRow) notFound();

  const testcaseRows = await selectTestcasesSafe(eq(testcases.problemId, id));

  return {
    ...problemRow.problem,
    Testcase: testcaseRows,
    round: {
      number: problemRow.roundNumber,
    },
  };
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
