import { prisma } from "@/utils/prisma";
import TeamsClient from "./TeamsClient";

async function getNextRound() {
  const now = new Date();  
  const nextRound = await prisma.round.findFirst({
    where: {
      start: {
        gt: now
      }
    },
    orderBy: {
      start: 'asc'
    },
    select: {
      number: true
    }
  });
  
  return nextRound?.number;
}

async function getTeams() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        TeamRound: {
          orderBy: {
            roundId: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        name: "asc",
      },
    });
    
    return teams.map(team => ({
      id: team.id,
      name: team.name,
      points: team.score,
      currentRound: team.TeamRound[0]?.roundId ?? -1
    }));
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Page() {
  const [teams, nextRoundId] = await Promise.all([
    getTeams(),
    getNextRound()
  ]);
  const teamsWithPoints = teams.filter(team => team.points >= 0);
  return <TeamsClient teams={teamsWithPoints} nextRoundId={nextRoundId} />;
}