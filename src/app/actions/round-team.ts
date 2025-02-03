'use server'

import { prisma } from "@/utils/prisma";

export async function promoteTeams(teamIds: string[], roundId?: string) {
  if (!roundId) return { success: false };
  
  try {
    await prisma.teamRound.createMany({
      data: teamIds.map(teamId => ({
        teamId,
        roundId: roundId
      })),
      skipDuplicates: true
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to promote teams:', error);
    return { success: false };
  }
}

export async function demoteTeams(teamIds: string[], roundId?: string) {
  if (!roundId) return { success: false };

  try {
    const targetRound = await prisma.round.findUnique({
      where: { id: roundId },
      select: { start: true }
    });

    if (!targetRound) return { success: false };

    const laterRounds = await prisma.round.findMany({
      where: {
        start: {
          gte: targetRound.start
        }
      },
      select: { id: true }
    });

    const laterRoundIds = laterRounds.map(round => round.id);

    await prisma.teamRound.deleteMany({
      where: {
        AND: [
          { teamId: { in: teamIds } },
          { roundId: { in: laterRoundIds } }
        ]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to demote teams:', error);
    return { success: false };
  }
}