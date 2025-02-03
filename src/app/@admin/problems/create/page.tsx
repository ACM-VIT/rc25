import {QuestionForm} from "../question-form";
import {handleQuestionSubmit} from "@/app/actions/upsert-question";
import {prisma} from "@/utils/prisma";

async function getRounds() {
	try {
		return await prisma.round.findMany({
			relationLoadStrategy: 'join',
			orderBy: {
				number: "asc",
			},
		});
	} finally {
		await prisma.$disconnect();
	}
}

export default async function CreateQuestion() {
	const rounds = await getRounds();
	return <QuestionForm onSubmitAction={handleQuestionSubmit} rounds={rounds} />;
}
