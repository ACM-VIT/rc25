'use server'

import { db } from "@/db";
import { rounds, teamRounds } from "@/db/schema";
import { and, eq, gte, inArray } from "drizzle-orm";

export async function promoteTeams(teamIds: string[], roundId?: string) {
  if (!roundId) return { success: false };
  
  try {
    if (teamIds.length > 0) {
      await db
        .insert(teamRounds)
        .values(
          teamIds.map((teamId) => ({
            teamId,
            roundId,
          }))
        )
        .onConflictDoNothing();
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to promote teams:', error);
    return { success: false };
  }
}

export async function demoteTeams(teamIds: string[], roundId?: string) {
  if (!roundId) return { success: false };

  try {
    const targetRoundRows = await db
      .select({ start: rounds.start })
      .from(rounds)
      .where(eq(rounds.id, roundId))
      .limit(1);
    const targetRound = targetRoundRows[0];

    if (!targetRound) return { success: false };

    const laterRounds = await db
      .select({ id: rounds.id })
      .from(rounds)
      .where(gte(rounds.start, targetRound.start));

    const laterRoundIds = laterRounds.map(round => round.id);

    if (teamIds.length > 0 && laterRoundIds.length > 0) {
      await db
        .delete(teamRounds)
        .where(
          and(
            inArray(teamRounds.teamId, teamIds),
            inArray(teamRounds.roundId, laterRoundIds)
          )
        );
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to demote teams:', error);
    return { success: false };
  }
}
