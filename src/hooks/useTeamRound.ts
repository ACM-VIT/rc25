import {auth} from "@/app/(auth)/auth";
import {prisma} from "@/utils/prisma";
import type {TeamRound} from "@prisma/client";

export async function getTeamRound(): Promise<TeamRound | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Get user's team
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { teamId: true }
  });

  if (!user?.teamId) return null;

  // Get current active round
  const curRound = await prisma.round.findFirst({
    where: {
      start: { lte: new Date() },
      end: { gte: new Date() }
    },
    orderBy: { start: "asc" }
  });

  if (!curRound) return null;

  // Get team round
  return prisma.teamRound.findFirst({
    where: {
      teamId: user.teamId,
      roundId: curRound.id
    }
  });
}