"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function searchTeams(query: string) {
	const prisma = new PrismaClient();
	try {
		const teams = await prisma.team.findMany({
			where: {
				OR: [{ name: { contains: query, mode: "insensitive" } }],
			},
			include: {
				members: true,
			},
		});
		return { success: true, data: teams };
	} catch (error) {
		return { success: false, error: "Failed to search teams" };
	} finally {
		await prisma.$disconnect();
	}
}

export async function blacklistTeam(teamId: string) {
	const prisma = new PrismaClient();
	try {
		await prisma.team.update({
			where: { id: teamId },
			data: { disqualify: true },
		});
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		return { success: false, error: "Failed to disqualify team" };
	}
}

export async function ReverseblacklistTeam(teamId: string) {
	const prisma = new PrismaClient();
	try {
		await prisma.team.update({
			where: { id: teamId },
			data: { disqualify: false },
		});
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		return { success: false, error: "Failed to disqualify team" };
	} finally {
		await prisma.$disconnect();
	}
}
