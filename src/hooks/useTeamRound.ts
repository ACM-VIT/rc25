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

  const now = new Date();
  const teamRoundRows = await db
    .select({ teamRound: teamRounds })
    .from(teamRounds)
    .innerJoin(rounds, eq(teamRounds.roundId, rounds.id))
    .where(
      and(
        eq(teamRounds.teamId, teamId),
        lte(rounds.start, now),
        gte(rounds.end, now)
      )
    )
    .orderBy(asc(rounds.start))
    .limit(1);

  return teamRoundRows[0]?.teamRound ?? null;
}
