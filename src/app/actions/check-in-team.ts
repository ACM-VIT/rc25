"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function CheckInTeam(teamId: string) {
	const prisma = new PrismaClient();

	try {
		const team = await prisma.team.findUnique({
			where: {
				id: teamId,
			},
			include: {
				members: true,
			},
		});

		if (!team) {
			return null;
		}

		if (
			team.members.length <
			Number.parseInt(process.env.MIN_TEAM_CAPACITY || "2")
		) {
			return false;
		}

		await prisma.teamRound.create({
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

		revalidatePath(`/check-in/${teamId}`);
		return true;
	} finally {
		await prisma.$disconnect();
	}
}
