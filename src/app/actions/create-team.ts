"use server";

import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq, inArray, isNull } from "drizzle-orm";

export async function getAvailableUsers() {
	try {
		return await db
			.select({ id: users.id, name: users.name, email: users.email })
			.from(users)
			.where(isNull(users.teamId));
	} catch (error) {
		console.error("Error fetching available users:", error);
		return [];
	}
}

export async function createTeam(userIds: string[], name: string) {
	try {
		const shortCode = Math.random().toString(36).substring(7).toUpperCase();
		const team = await db.transaction(async (tx) => {
			const created = await tx
				.insert(teams)
				.values({ name, shortCode })
				.returning();
			const createdTeam = created[0];
			if (!createdTeam) return null;

			if (userIds.length > 0) {
				await tx
					.update(users)
					.set({ teamId: createdTeam.id })
					.where(inArray(users.id, userIds));
			}

			const members = userIds.length
				? await tx
						.select()
						.from(users)
						.where(inArray(users.id, userIds))
				: [];

			return { ...createdTeam, members };
		});

		return team;
	} catch (error) {
		console.error("Error creating team:", error);
		return null;
	}
}
