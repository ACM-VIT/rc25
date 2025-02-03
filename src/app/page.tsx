import { prisma } from "@/utils/prisma";
import Dashboard from "@/components/dashboard";
// import SignOutButton from "@/components/buttons/sign-out";
// import type { TeamRound } from "@prisma/client"
import { getTeamRound } from "@/hooks/useTeamRound";
import type { Metadata } from "next";
import { FLAGS } from "@/types/flags"
import { auth } from "./(auth)/auth";
import { use } from "react";

async function getLeaderBoardShowBoolean(): Promise<boolean> {
  const showBool = await prisma.flags.findFirst({
    where: { name: FLAGS.SCOREBOARD_VISIBLE },
    select: { value: true },
  });

  return showBool?.value ?? false;
}

export async function generateMetadata(): Promise<Metadata> {
  const teamRound = await getTeamRound();
  const roundInfo = teamRound?.roundId
    ? await prisma.round.findFirst({
        where: { id: teamRound.roundId },
        select: { number: true },
      })
    : null;

  if (!roundInfo?.number) {
    return {
      title: "Reverse Coding | ACM-VIT",
      description: "Join Reverse Coding competition",
      openGraph: {
        title: "Reverse Coding | ACM-VIT",
        description: "Join ACM-VIT's premier coding competition",
        type: "website",
      },
      robots: {
        index: false,
        follow: false,
      },
      icons: {
        icon: "/favicon.ico",
      },
    };
  }

  return {
    title: `Round ${roundInfo.number} Dashboard`,
    description:
      "View your team's progress, leaderboard and available problems",
    openGraph: {
      title: `Round ${roundInfo.number}`,
      description: "Track your team's progress in real-time",
    },
    robots: {
      index: false,
      follow: false,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}
export default async function Page() {
  const teamRound = await getTeamRound();

  const session = await auth();
  if (!session?.user?.email) {
    return <div>Please sign in to continue</div>;
  }

  const user = await prisma.user.findUnique({
      where: {
          email: session.user.email,
      },
      include: {
          Team: {
              include: { TeamRound: true },
          },
          Admin: {
              select: {
                  id: true,
              },
          },
      },
  });

  if (!user) {
      return <div>User not found</div>;
  }

  const isAdminTeam = user.Team?.id === process.env.ADMIN_TEAM_ID;
  

  if (!isAdminTeam) {
    if (!teamRound?.roundId) {
      return <div>No active round found</div>;
    }
  }

  // Round info
  const roundInfo = await prisma.round.findFirst({
    where: { id: teamRound?.roundId ?? '' },
    select: { number: true, end: true, id: true },
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
  }

  let teamData = teamRound ? await prisma.team.findUnique({
    where: { id: teamRound.teamId },
    select: {
      id: true,
      name: true,
      shortCode: true,
      score: true,
      members: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  }) : null;

  if (isAdminTeam){
    teamData = user.teamId ? await prisma.team.findUnique({
      where: { id: user.teamId },
      select: {
        id: true,
        name: true,
        shortCode: true,
        score: true,
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }): null;
  }

  let problems: ProblemType[];

  // Questions
  if (!isAdminTeam){
    problems = roundInfo
    ? await prisma.problem.findMany({
        where: { roundId: roundInfo.id },
        orderBy: { id: "asc" },
        include: {
          submissions: {
            where: {
              userId: {
                in: teamData?.members.map(member => member.id) || []
              }
            },
            orderBy: { createdAt: "desc" },
          },
        },
      })
    : [];
  } else {
    problems = await prisma.problem.findMany({
      orderBy: { id: "asc" },
      include: {
        submissions: {
          where: {
            userId: {
              in: teamData?.members.map(member => member.id) || []
            }
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  const questions = problems.map((problem, index) => {
    // Find submission with maximum passed test cases
    const bestSubmission = problem.submissions.reduce((best, current) => {
      const currentPassed = current.testcasespassed.filter(Boolean).length;
      const bestPassed = best ? best.testcasespassed.filter(Boolean).length : -1;
      return currentPassed > bestPassed ? current : best;
    }, null as any);

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
    };
  });

  const teamDetails = teamData
    ? {
        id: teamData.id,
        name: teamData.name,
        shortCode: teamData.shortCode,
        score: teamData.score,
        members: teamData.members.map((member: { id: any; name: any; }) => ({
          id: member.id,
          name: member.name,
          score: 0, // Adjust if you store member scores
        })),
      }
    : {
        id: "",
        name: "",
        shortCode: "",
        score: 0,
        members: [],
      };

  // Leaderboard
  const leaderboardData = await prisma.team.findMany({
    where: {
      id: {
        not: process.env.ADMIN_TEAM_ID // Exclude admin team
      }
    },
    orderBy: { score: "desc" },
    select: {
      id: true,
      name: true,
      score: true,
    },
  });
  
  const leaderboard = leaderboardData.map((team) => ({
    id: team.id,
    name: team.name,
    score: team.score,
  }));

  const showLeaderboard = await getLeaderBoardShowBoolean();

  // Fetch news
  const news = await prisma.news.findMany({
    orderBy: {
      time: 'desc'
    },
    select: {
      id: true,
      title: true,
      content: true,
      time: true
    }
  });

  return (
    <>
      <Dashboard
        teamDetails={teamDetails}
        leaderboard={leaderboard}
        leaderboardShow={showLeaderboard}
        questions={questions}
        roundInfo={{
          number: roundInfo?.number ?? 0,
          end: roundInfo?.end ?? new Date(),
        }}
        news={news}
      />
    </>
  );
}