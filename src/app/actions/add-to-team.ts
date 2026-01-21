"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function AddToTeam(userId: string, teamId: string) {
	try {
		const teamRows = await db
			.select()
			.from(teams)
			.where(eq(teams.id, teamId))
			.limit(1);
		const team = teamRows[0];
		if (!team) return null;
		if (team.checkedIn){
			return false
		}
		const memberCountRows = await db
			.select({ count: sql<number>`count(*)` })
			.from(users)
			.where(eq(users.teamId, teamId));
		const memberCount = Number(memberCountRows[0]?.count ?? 0);
		if (
			memberCount >= Number.parseInt(process.env.MAX_TEAM_SIZE || "4")
		) {
			console.log(memberCount);
			return false;
		}
		const updatedUsers = await db
			.update(users)
			.set({ teamId })
			.where(eq(users.id, userId))
			.returning({ id: users.id });
		if (updatedUsers.length === 0) {
			return false;
		}
		revalidatePath(`/check-in/${teamId}`);
		return true;
	}
	catch (error) {
		console.error("Error adding user to team:", error);
		return false;
	}
}