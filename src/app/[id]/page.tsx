import ViewProblem from "./ProblemClient";
import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth"; // Import your auth
import type { Problem as PrismaBaseProblem } from "@prisma/client";
import { type Metadata } from "next";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  try {
    const problem = await getProblem((await params).id);
    return {
      title: `${problem.title}`,
      description: `Problem ${problem.id}: ${problem.description.substring(
        0,
        150
      )}...`,
      openGraph: {
        title: `${problem.title}`,
        description: `Solve problem ${problem.title} in Reverse Coding competition`,
      },
      robots: {
        index: true,
        follow: true,
      },
      icons: {
        icon: "/favicon.ico",
      },
    };
  } catch {
    return {
      title: "Problem Not Found",
      description: "The requested problem could not be found",
    };
  }
}

interface Problem extends PrismaBaseProblem {
  Testcase: TestCase[];
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
    where: { id },
    include: {
      Testcase: true,
    },
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

  return (
    <ViewProblem
      problem={problem}
      session={{ user: { id: session.user.id } }}
    />
  );
}
