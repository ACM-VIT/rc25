import { prisma } from "@/utils/prisma";
import Dashboard from "@/components/dashboard";
import FallbackPage from "@/components/fallback-page";
import type { Metadata } from "next";
import type { DashboardProps } from "@/types/dashboard";
import { auth } from "./(auth)/auth";

export async function generateMetadata(): Promise<Metadata> {
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

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    return (
      <FallbackPage
        headerTitle="PIT STOP"
        title="Please Sign In"
        message="You need to be signed in to access the dashboard. Head back and log in to join the race."
        actionLabel="SIGN IN"
        googleSignIn
      />
    );
  }

  const problems = await prisma.problem.findMany({
    orderBy: { id: "asc" },
    include: {
      round: true,
      submissions: {
        where: { userId: session.user.id },
        select: { testcasespassed: true, createdAt: true },
      },
    },
  });

  interface SubmissionType {
    testcasespassed: boolean[];
    createdAt: Date;
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
      points: problem.maxScore ?? 0,
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
    const roundInfo: DashboardProps["roundInfo"] = {
        number: problems[0]?.round?.number ?? 0,
        end: problems[0]?.round?.end ?? new Date(),
    };

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
