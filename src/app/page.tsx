import { prisma } from "@/utils/prisma";
import Dashboard from "@/components/dashboard";
import type { Metadata } from "next";
import type { DashboardProps } from "@/types/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const roundInfo = await prisma.round.findFirst({
    where: {
      start: { lte: new Date() },
      end: { gte: new Date() },
    },
    select: { number: true },
  });

  if (!roundInfo?.number) {
    return {
      title: "Reverse Coding | ACM-VIT",
      description: "Join Reverse Coding competition",
      openGraph: {
        title: "Reverse Coding | ACM-VIT",
        description: "Join ACM-VIT's premier coding competition",
        type: "website",
      },
      icons: { icon: "/favicon.ico" },
    };
  }

  return {
    title: `Round ${roundInfo.number} Dashboard`,
    description: "Dashboard",
    openGraph: {
      title: `Round ${roundInfo.number}`,
      description: "Dashboard",
    },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function Page() {
  // Get current round info (if any)
  const roundInfo = await prisma.round.findFirst({
    where: {
      start: { lte: new Date() },
      end: { gte: new Date() },
    },
    select: { number: true, end: true, id: true },
  });

  if (!roundInfo) {
    return <div>No active round found</div>;
  }

  const problems = await prisma.problem.findMany({
    where: { roundId: roundInfo.id },
    orderBy: { id: "asc" },
    include: {
      submissions: {
        select: {
          testcasespassed: true,
          createdAt: true,
        },
      },
    },
  });

  interface SubmissionType {
    testcasespassed: boolean[];
    createdAt: Date;
  }
  interface ProblemType {
    id: string;
    title: string;
    difficulty: string;
    roundId: string;
    submissions: SubmissionType[];
    isHidden: boolean;
  }

  const questions = problems.map((problem, index) => {
    const bestSubmission = problem.submissions.reduce(
      (best, current) => {
        const currentPassed = current.testcasespassed.filter(Boolean).length;
        const bestPassed = best ? best.testcasespassed.filter(Boolean).length : -1;
        return currentPassed > bestPassed ? current : best;
      },
      null as SubmissionType | null
    );

    const passedArray = bestSubmission?.testcasespassed || [];
    const passCount = passedArray.filter(Boolean).length;
    const total = passedArray.length;
    const status = total > 0 ? `${passCount}/${total}` : "Not Attempted";

    return {
      slno: index + 1,
      id: problem.id,
      questionName: problem.title,
      difficulty: problem.difficulty,
      status,
      isHidden: problem.isHidden,
    };
  });

  const news = await prisma.news.findMany({
    orderBy: { time: "desc" },
    select: { id: true, title: true, content: true, time: true },
  });

  const teamDetails: DashboardProps["teamDetails"] = {
    id: "",
    name: "",
    shortCode: "",
    score: 0,
    members: [],
  };
  const leaderboard: DashboardProps["leaderboard"] = [];
  const leaderboardShow = false;

  return (
    <Dashboard
      teamDetails={teamDetails}
      leaderboard={leaderboard}
      leaderboardShow={leaderboardShow}
      questions={questions}
      roundInfo={roundInfo}
      news={news}
    />
  );
}
