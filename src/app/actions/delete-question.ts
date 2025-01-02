"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteQuestion(questionId: string): Promise<void> {
	try {
		await prisma.problem.delete({
			where: {
				id: questionId,
			},
		});
	} catch (error) {
		console.error("Error deleting question:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}
