"use server";

import { PrismaClient } from "@prisma/client";

export async function getAvailableUsers() {
	const prisma = new PrismaClient();
	try {
		const users = await prisma.user.findMany({
			relationLoadStrategy: 'join',
			where: {
				teamId: null,
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});
		return users;
	} catch (error) {
		console.error("Error fetching available users:", error);
		return [];
	} finally {
		await prisma.$disconnect();
	}
}

export async function createTeam(userIds: string[], name: string) {
	const prisma = new PrismaClient();

	try {
		const shortCode = Math.random().toString(36).substring(7).toUpperCase();
		const team = await prisma.team.create({
			data: {
				name: name,
				shortCode,
				members: {
					connect: userIds.map((id) => ({ id })),
				},
			},
			include: {
				members: true,
			},
		});
		return team;
	} catch (error) {
		console.error("Error creating team:", error);
		return null;
	} finally {
		await prisma.$disconnect();
	}
}
