"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { rounds, teamRounds, teams } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function ReverseCheckIn(teamId: string) {
	const teamRows = await db
		.select()
		.from(teams)
		.where(eq(teams.id, teamId))
		.limit(1);
	const team = teamRows[0];

	if (!team) {
		return null;
	}

	const roundRows = await db
		.select({ id: rounds.id })
		.from(rounds)
		.where(eq(rounds.number, 1))
		.limit(1);
	const round = roundRows[0];
	if (!round) {
		return false;
	}

	const teamRoundRows = await db
		.select()
		.from(teamRounds)
		.where(and(eq(teamRounds.teamId, teamId), eq(teamRounds.roundId, round.id)));
	if (teamRoundRows.length === 0) {
		return false;
	}

	await db.transaction(async (tx) => {
		await tx
			.delete(teamRounds)
			.where(and(eq(teamRounds.teamId, teamId), eq(teamRounds.roundId, round.id)));
		await tx
			.update(teams)
			.set({ checkedIn: false })
			.where(eq(teams.id, teamId));
	});

	revalidatePath(`/check-in/${teamId}`);

	return true;
}
