import { prisma } from "@/utils/prisma";
import Dashboard from "@/components/dashboard";
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

interface SubmissionType {
  testcasespassed: boolean[];
  createdAt: Date;
  problemId: string;
}

interface ProblemType {
  id: string;
  title: string;
  difficulty: string;
  isHidden: boolean;
}

export default async function Page() {
  const session = await auth();
  if (!session?.user?.email) {
    return <div>Please sign in to continue</div>;
  }

  const problemsPromise = prisma.problem.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      title: true,
      difficulty: true,
      isHidden: true,
    },
  }) as Promise<ProblemType[]>;

  const problems = await problemsPromise;
  const problemIds = problems.map((p) => p.id);
  
  const submissionsPromise = prisma.submission.findMany({
    where: {
      user: { email: session.user.email },
      problemId: { in: problemIds },
    },
    select: {
      problemId: true,
      testcasespassed: true,
      createdAt: true,
    },
  }) as Promise<SubmissionType[]>;
  
  const submissions = await submissionsPromise;

  const questions = problems.map((problem, index) => {
    const problemSubs = submissions.filter(
      (sub) => sub.problemId === problem.id
    );
    const bestSubmission = problemSubs.reduce(
      (best: SubmissionType | null, current: SubmissionType) => {
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

  // Get news (if needed by the dashboard).
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
      news={news}
    />
  );
}
