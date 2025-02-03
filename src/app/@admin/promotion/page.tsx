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
      id: true
    }
  });
  
  return nextRound?.id;
}

async function getTeams() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        TeamRound: {
          orderBy: {
            roundId: 'desc'
          },
          take: 1,
          include: {
            round: {
              select: {
                id: true,
                number: true,
                start: true
              }
            }
          }
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
      teamRound: team.TeamRound[0] ? {
        id: team.TeamRound[0].id,
        teamId: team.TeamRound[0].teamId,
        roundId: team.TeamRound[0].roundId,
        round: {
          id: team.TeamRound[0].round.id,
          number: team.TeamRound[0].round.number,
          start: team.TeamRound[0].round.start.toISOString()
        }
      } : undefined
    }));
  } finally {
    await prisma.$disconnect();
  }
}

async function getRounds() {
  const rounds = await prisma.round.findMany({
    orderBy: {
      start: "asc",
    },
    select: {
      id: true,
      start: true,
      number: true,
    },
  });
  return rounds.map(round => ({
    id: round.id,
    start: round.start.toISOString(),
    number: round.number,
  }));
}

export default async function Page() {
  const [teams, rounds] = await Promise.all([
    getTeams(),
    getRounds(),
  ]);

  const teamsWithPoints = teams.filter(team => team.points >= 0);
  return <TeamsClient teams={teamsWithPoints} rounds={rounds} />;
}