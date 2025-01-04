import { PrismaClient } from "@prisma/client";
import QuestionsClient from "./question-client";
import { revalidatePath } from "next/cache";

async function getQuestions() {
	const prisma = new PrismaClient();
	try {
		const questions = await prisma.problem.findMany({
			include: {
				round: true,
			},
			orderBy: {
				roundNumber: "asc",
			},
		});

		return questions;
	} finally {
		await prisma.$disconnect();
	}
}
async function getRounds() {
	const prisma = new PrismaClient();
	try {
		const rounds = await prisma.round.findMany({
			orderBy: {
				number: "asc",
			},
		});
		return rounds;
	} finally {
		await prisma.$disconnect();
	}
}
export default async function QuestionsPage() {
	const [questions, rounds] = await Promise.all([getQuestions(), getRounds()]);
	return <QuestionsClient questions={questions} rounds={rounds} />;
}
