"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function CheckInTeam(teamId: string) {
	const prisma = new PrismaClient();
	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		include: {
			members: true,
		},
	});

	if (!team) {
		await prisma.$disconnect();
		return null;
	}

	if (
		team.members.length < Number.parseInt(process.env.MIN_TEAM_CAPACITY || "2")
	) {
		await prisma.$disconnect();
		return false;
	}
	const TeamRound = await prisma.teamRound.create({
		data: {
			team: {
				connect: {
					id: teamId,
				},
			},
			round: {
				connect: {
					number: 1,
				},
			},
		},
	});

	await prisma.$disconnect();

	revalidatePath(`/check-in/${teamId}`);

	return true;
}
