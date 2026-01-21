"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq, ilike, inArray } from "drizzle-orm";

export async function searchTeams(query: string) {
  try {
    const teamRows = await db
      .select()
      .from(teams)
      .where(ilike(teams.name, `%${query}%`));

    const teamIds = teamRows.map((team) => team.id);
    const memberRows = teamIds.length
      ? await db
          .select()
          .from(users)
          .where(inArray(users.teamId, teamIds))
      : [];

    const membersByTeam = new Map<string, typeof memberRows>();
    for (const member of memberRows) {
      if (!member.teamId) continue;
      const list = membersByTeam.get(member.teamId) ?? [];
      list.push(member);
      membersByTeam.set(member.teamId, list);
    }

    const data = teamRows.map((team) => ({
      ...team,
      members: membersByTeam.get(team.id) ?? [],
    }));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: `Failed to search teams: ${(error as Error).name}`,
    };
  }
}

export async function blacklistTeam(teamId: string) {
  try {
    await db.update(teams).set({ disqualify: true }).where(eq(teams.id, teamId));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to disqualify team: ${(error as Error).name}`,
    };
  }
}

export async function ReverseblacklistTeam(teamId: string) {
  try {
    await db.update(teams).set({ disqualify: false }).where(eq(teams.id, teamId));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to disqualify team: ${(error as Error).name}`,
    };
  }
}
