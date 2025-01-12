import { QuestionForm } from "../question-form";
import { handleQuestionSubmit } from "@/app/actions/upsert-question";
import { prisma } from "@/utils/prisma";

async function getRounds() {
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

export default async function CreateQuestion() {
	const rounds = await getRounds();
	return <QuestionForm onSubmit={handleQuestionSubmit} rounds={rounds} />;
}
