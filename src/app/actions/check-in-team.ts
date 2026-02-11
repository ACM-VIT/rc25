"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { rounds, teamRounds, teams, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

type CheckInResponse = {
  success: boolean;
  message: string;
};

export default async function CheckInTeam(
  teamId: string,
): Promise<CheckInResponse> {
  try {
    const teamRows = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);
    const team = teamRows[0];

    if (!team) {
      throw new Error("Team not found");
    }
    const memberCountRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.teamId, teamId));
    const memberCount = Number(memberCountRows[0]?.count ?? 0);
    if (memberCount < parseInt(process.env.MIN_TEAM_CAPACITY || "1")) {
      return {
        success: false,
        message: "Insufficient team members",
      };
    }

    const roundRows = await db
      .select({ id: rounds.id })
      .from(rounds)
      .where(eq(rounds.number, 1))
      .limit(1);
    const round = roundRows[0];
    if (!round) {
      throw new Error("Round 1 not found");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(teams)
        .set({ checkedIn: true })
        .where(eq(teams.id, teamId));
      await tx.insert(teamRounds).values({
        teamId,
        roundId: round.id,
      });
    });

    revalidatePath(`/check-in/${teamId}`, "page");

    return {
      success: true,
      message: "Team checked in successfully",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Check-in error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
    };
  }
}
