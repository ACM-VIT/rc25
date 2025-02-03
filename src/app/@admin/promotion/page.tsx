import { prisma } from "@/utils/prisma";
import TeamsClient from "./TeamsClient";

async function getNextRound() {
  const now = new Date();  
  const nextRound = await prisma.round.findFirst({
    relationLoadStrategy: 'join',
    where: {
      start: {
        gt: now
      }
    },
    orderBy: {
      start: 'asc'
    },
    select: {
      id: true
    }
  });
  
  return nextRound?.id;
}

async function getTeams() {
  try {
    const teams = await prisma.team.findMany({
      relationLoadStrategy: 'join',
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
      currentRound: team.TeamRound[0] ? team.TeamRound[0].roundId.toString() : '-1'
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