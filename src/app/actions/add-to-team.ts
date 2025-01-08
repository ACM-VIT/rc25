"use server";

import { Prisma, PrismaClient } from "@prisma/client";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;
import { revalidatePath } from "next/cache";

export default async function AddToTeam(userId: string, teamId: string) {
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
		team.members.length >= Number.parseInt(process.env.TEAM_CAPACITY || "4")
	) {
		await prisma.$disconnect();
		return false;
	}
	try {
		const x = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				Team: {
					connect: {
						id: teamId,
					},
				},
			},
		});
		await prisma.$disconnect();
	} catch (e) {
		await prisma.$disconnect();
		if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
			return false;
		}
		return null;
	}
	revalidatePath(`/check-in/${teamId}`);
	return true;
}
