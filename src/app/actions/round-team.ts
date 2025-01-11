'use server'

import { prisma } from "@/utils/prisma";

export async function promoteTeams(teamIds: string[], roundId?: number) {
  if (!roundId) return { success: false };
  
  try {
    await prisma.teamRound.createMany({
      data: teamIds.map(teamId => ({
        teamId,
        roundId
      })),
      skipDuplicates: true
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to promote teams:', error);
    return { success: false };
  }
}

export async function demoteTeams(teamIds: string[], roundId?: number) {
  if (!roundId) return { success: false };

  try {
    await prisma.teamRound.deleteMany({
      where: {
        teamId: { in: teamIds },
        roundId: roundId
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to demote teams:', error);
    return { success: false };
  }
}