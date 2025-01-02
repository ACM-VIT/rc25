"use client";

import { useState, useEffect } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Problem } from "@prisma/client";
import { fetchQuestions } from "@/app/actions/fetch-questions";
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
import { useRouter } from "next/navigation";

export default function QuestionsHelper() {
	const [questions, setQuestions] = useState<Problem[]>([]);
	const [editingQuestion, setEditingQuestion] = useState<Problem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const loadQuestions = async () => {
			try {
				setIsLoading(true);
				const fetchedQuestions = await fetchQuestions();
				if (fetchedQuestions) {
					setQuestions(fetchedQuestions);
				}
			} catch (err) {
				console.error("Error loading questions:", err);
				setError(
					err instanceof Error ? err.message : "Failed to load questions",
				);
			} finally {
				setIsLoading(false);
			}
		};

		loadQuestions();
	}, []);

	const handleSaveQuestion = async (formData: FormData) => {
		try {
			await handleQuestionSubmit(formData, editingQuestion?.id);
			const updatedQuestions = await fetchQuestions();
			setQuestions(updatedQuestions);
			setEditingQuestion(null);
			router.push("/questions");
		} catch (error) {
			console.error("Error saving question:", error);
		}
	};

	const handleDeleteQuestion = async (questionId: string) => {
		try {
			await deleteQuestion(questionId);
			const updatedQuestions = await fetchQuestions();
			setQuestions(updatedQuestions);
		} catch (error) {
			console.error("Error deleting question:", error);
		}
	};

	if (isLoading) {
		return <div>Loading questions...</div>;
	}

	if (error) {
		return <div className="text-red-500">Error: {error}</div>;
	}

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
												onClick={() => setEditingQuestion(question)}
											>
												<Edit className="h-4 w-4" />
												<span className="sr-only">Edit</span>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="text-red-500 hover:text-destructive"
												onClick={() => handleDeleteQuestion(question.id)}
											>
												<Trash2 className="h-4 w-4" />
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
			/>
		</div>
	);
}
