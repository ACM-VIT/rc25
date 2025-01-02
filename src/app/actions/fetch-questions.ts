"use server";
import { PrismaClient } from "@prisma/client";

export async function fetchQuestions() {
	const prisma = new PrismaClient();
	const questions = await prisma.problem.findMany({
		include: {
			// Testcase: true,
			round: true,
		},
		orderBy: {
			roundNumber: "asc",
		},
	});

	return questions;
}
