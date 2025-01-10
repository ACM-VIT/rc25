"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function ReverseCheckIn(teamId: string) {
	const prisma = new PrismaClient();
	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		include: {
			TeamRound: true,
		},
	});

	if (!team) {
		await prisma.$disconnect();
		return null;
	}
	if (team.TeamRound.length === 0) {
		await prisma.$disconnect();
		return false;
	}

	await prisma.teamRound.delete({
		where: {
			teamId_roundId: {
				teamId: teamId,
				roundId: 1,
			},
		},
	});

	await prisma.$disconnect();

	revalidatePath(`/check-in/${teamId}`);

	return true;
}
