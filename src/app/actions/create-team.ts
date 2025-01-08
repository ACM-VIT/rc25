"use server";

import { PrismaClient } from "@prisma/client";

export async function getAvailableUsers() {
	try {
		const prisma = new PrismaClient();
		const users = await prisma.user.findMany({
			where: {
				teamId: null,
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});
		console.log(users);
		return users;
	} catch (error) {
		console.error("Error fetching available users:", error);
		return [];
	}
}

export async function createTeam(userIds: string[], name: string) {
	try {
		const prisma = new PrismaClient();
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
	}
}
