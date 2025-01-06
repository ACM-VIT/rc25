"use client";

import { useState, useTransition } from "react";
import { Edit, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Problem, Round } from "@prisma/client";
import { handleQuestionSubmit } from "@/app/actions/upsert-question";
import { deleteQuestion } from "@/app/actions/delete-question";
import { QuestionForm } from "./question-form";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface QuestionsClientProps {
	questions: Problem[];
	rounds: Round[];
}

export default function QuestionsClient({
	questions: initialQuestions,
	rounds,
}: QuestionsClientProps) {
	const [questions, setQuestions] = useState<Problem[]>(initialQuestions);
	const [editingQuestion, setEditingQuestion] = useState<Problem | null>(null);
	const [isPending, startTransition] = useTransition();
	const [activeActionId, setActiveActionId] = useState<string | null>(null);

	const handleSaveQuestion = async (formData: FormData) => {
		try {
			const questionId = editingQuestion?.id || "";
			setActiveActionId(questionId);
			startTransition(async () => {
				await handleQuestionSubmit(formData, editingQuestion?.id);
				window.location.reload();
				setEditingQuestion(null);
				setActiveActionId(null);
			});
		} catch (error) {
			console.error("Error saving question:", error);
			setActiveActionId(null);
		}
	};

	const handleDeleteQuestion = async (questionId: string) => {
		try {
			setActiveActionId(questionId);
			startTransition(async () => {
				await deleteQuestion(questionId);
				window.location.reload();
				setActiveActionId(null);
			});
		} catch (error) {
			console.error("Error deleting question:", error);
			setActiveActionId(null);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-end">
				<Link href="questions/create">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Question
					</Button>
				</Link>
			</div>

			{questions.length === 0 ? (
				<div className="text-center py-6">
					No questions found. Create your first question!
				</div>
			) : (
				<div className="rounded-md border">
					<Table className="table-auto w-full border-collapse">
						<TableHeader>
							<TableRow>
								<TableHead className="w-48">Title</TableHead>
								<TableHead className="w-24">Difficulty</TableHead>
								<TableHead className="w-24">Round</TableHead>
								<TableHead className="w-24">Max Score</TableHead>
								<TableHead className="w-24 text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{questions.map((question) => (
								<TableRow key={question.id}>
									<TableCell className="font-medium">
										{question.title}
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
												question.difficulty === "EASY"
													? "bg-green-50 text-green-700"
													: question.difficulty === "MEDIUM"
														? "bg-yellow-50 text-yellow-700"
														: "bg-red-50 text-red-700"
											}`}
										>
											{question.difficulty}
										</span>
									</TableCell>
									<TableCell>Round {question.roundNumber}</TableCell>
									<TableCell>{question.maxScore}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												disabled={!!activeActionId}
												onClick={() => setEditingQuestion(question)}
											>
												{activeActionId === question.id && isPending ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Edit className="h-4 w-4" />
												)}
												<span className="sr-only">Edit</span>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												disabled={!!activeActionId}
												className="text-red-500 hover:text-destructive"
												onClick={() => handleDeleteQuestion(question.id)}
											>
												{activeActionId === question.id && isPending ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4" />
												)}
												<span className="sr-only">Delete</span>
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<QuestionForm
				initialData={editingQuestion}
				onSubmit={handleSaveQuestion}
				isDialog
				open={!!editingQuestion}
				onClose={() => setEditingQuestion(null)}
				rounds={rounds}
			/>
		</div>
	);
}
