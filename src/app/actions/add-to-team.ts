"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

export default async function AddToTeam(userId: string, teamId: string) {
	const prisma = new PrismaClient();
	try {
		const team = await prisma.team.findUnique({
			relationLoadStrategy: 'join',
			where: { id: teamId },
			include: { members: true },
		});
		if (!team) return null;
		if (team.checkedIn){
			return false
		}
		if (
			team.members.length >= Number.parseInt(process.env.TEAM_CAPACITY || "4")
		) {
			return false;
		}
		try {
			await prisma.user.update({
				where: { id: userId },
				data: {
					Team: {
						connect: { id: teamId },
					},
				},
			});
		} catch (e) {
			if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
				return false;
			}
			return null;
		}
		revalidatePath(`/check-in/${teamId}`);
		return true;
	} finally {
		await prisma.$disconnect();
	}
}
