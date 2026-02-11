import {QuestionForm} from "../question-form";
import {handleQuestionSubmit} from "@/app/actions/upsert-question";
import { db } from "@/db";
import { rounds } from "@/db/schema";
import { asc } from "drizzle-orm";

async function getRounds() {
	try {
		return await db.select().from(rounds).orderBy(asc(rounds.number));
	} catch (error) {
		console.error("Error fetching rounds:", error);
		return [];
	}
}

export default async function CreateQuestion() {
	const rounds = await getRounds();
	return <QuestionForm onSubmitAction={handleQuestionSubmit} rounds={rounds} />;
}
