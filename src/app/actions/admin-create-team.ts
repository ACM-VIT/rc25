"use server";

import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { like, or } from "drizzle-orm";

interface CreateTeamParams {
  name: string;
  shortCode: string;
  registrationNumbers: string[];
}

export async function createTeam({
  name,
  shortCode,
  registrationNumbers,
}: CreateTeamParams) {
  try {
    const conditions = registrationNumbers.map((registrationNumber) =>
      like(users.name, `%${registrationNumber}`)
    );

    const team = await db.transaction(async (tx) => {
      const createdTeams = await tx
        .insert(teams)
        .values({ name, shortCode })
        .returning();
      const createdTeam = createdTeams[0];
      if (!createdTeam) {
        throw new Error("Failed to create team");
      }

      if (conditions.length > 0) {
        await tx
          .update(users)
          .set({ teamId: createdTeam.id })
          .where(or(...conditions));
      }

      return createdTeam;
    });

    return team;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create team: ${errorMessage}`);
  }
}
