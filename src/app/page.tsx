import { prisma } from "@/utils/prisma";
import Dashboard from "@/components/dashboard";
// import SignOutButton from "@/components/buttons/sign-out";
// import type { TeamRound } from "@prisma/client"
import { getTeamRound } from "@/hooks/useTeamRound";
import { Metadata } from "next";

async function getLeaderBoardShowBoolean(): Promise<boolean> {
  const showBool = await prisma.flags.findFirst({
    where: { name: "showLeaderboard" },
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

  if (!teamRound?.roundId) {
    return <div>No active round found</div>;
  }

  // Round info
  const roundInfo = await prisma.round.findFirst({
    where: { id: teamRound.roundId },
    select: { number: true, end: true, id: true },
  });

  // Questions
  const problems = roundInfo
    ? await prisma.problem.findMany({
        where: { roundId: roundInfo.id },
        orderBy: { id: "asc" },
        include: {
          submissions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })
    : [];

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

  const teamData = await prisma.team.findUnique({
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
  });

  const teamDetails = teamData
    ? {
        id: teamData.id,
        name: teamData.name,
        shortCode: teamData.shortCode,
        score: teamData.score,
        members: teamData.members.map((member) => ({
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
      />
    </>
  );
}
