import {auth} from "@/app/(auth)/auth";
import { db } from "@/db";
import { rounds, teamRounds, users, type TeamRound } from "@/db/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";

export async function getTeamRound(): Promise<TeamRound | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Get user's team
  const userRows = await db
    .select({ teamId: users.teamId })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  const teamId = userRows[0]?.teamId;
  if (!teamId) return null;

  // Get current active round
  const now = new Date();
  const curRoundRows = await db
    .select()
    .from(rounds)
    .where(and(lte(rounds.start, now), gte(rounds.end, now)))
    .orderBy(asc(rounds.start))
    .limit(1);

  const curRound = curRoundRows[0];
  if (!curRound) return null;

  // Get team round
  const teamRoundRows = await db
    .select()
    .from(teamRounds)
    .where(and(eq(teamRounds.teamId, teamId), eq(teamRounds.roundId, curRound.id)))
    .limit(1);

  return teamRoundRows[0] ?? null;
}
