"use client";

import type React from "react";
import { useTransition } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Problem, Difficulty } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface QuestionFormProps {
	initialData?: Problem | null;
	onSubmitAction: (formData: FormData) => Promise<void>;
	isDialog?: boolean;
	onClose?: () => void;
	open?: boolean;
	rounds?: { id: string; number: number }[];
}
interface MarkdownValidationError {
	isValid: boolean;
	error?: string;
}

interface MarkdownValidationError {
	isValid: boolean;
	error?: string;
}

const validateMarkdown = (markdown: string): MarkdownValidationError => {
	if (!markdown || typeof markdown !== "string") {
		return { isValid: false, error: "Description is required" };
	}

	try {
		// Check for unmatched backticks
		const backtickCount = (markdown.match(/`/g) || []).length;
		if (backtickCount % 2 !== 0) {
			return { isValid: false, error: "Unmatched code backticks found" };
		}

		// Check for unmatched triple backticks
		const tripleBacktickCount = (markdown.match(/```/g) || []).length;
		if (tripleBacktickCount % 2 !== 0) {
			return { isValid: false, error: "Unmatched code block markers found" };
		}

		// Check for unmatched square brackets
		const openSquareBrackets = (markdown.match(/\[/g) || []).length;
		const closeSquareBrackets = (markdown.match(/\]/g) || []).length;
		if (openSquareBrackets !== closeSquareBrackets) {
			return { isValid: false, error: "Unmatched square brackets found" };
		}

		// Check for unmatched parentheses
		const openParentheses = (markdown.match(/\(/g) || []).length;
		const closeParentheses = (markdown.match(/\)/g) || []).length;
		if (openParentheses !== closeParentheses) {
			return { isValid: false, error: "Unmatched parentheses found" };
		}

		// Check for unmatched curly braces
		const openCurlyBraces = (markdown.match(/\{/g) || []).length;
		const closeCurlyBraces = (markdown.match(/\}/g) || []).length;
		if (openCurlyBraces !== closeCurlyBraces) {
			return { isValid: false, error: "Unmatched curly braces found" };
		}

		// Check for unmatched asterisks for bold/italic
		const asteriskCount = (markdown.match(/\*/g) || []).length;
		if (asteriskCount % 2 !== 0) {
			return { isValid: false, error: "Unmatched asterisks found" };
		}

		// Check for unmatched underscores for bold/italic
		const underscoreCount = (markdown.match(/_/g) || []).length;
		if (underscoreCount % 2 !== 0) {
			return { isValid: false, error: "Unmatched underscores found" };
		}

		// Check for unmatched HTML tags
		const htmlTags = markdown.match(/<[^>]+>/g) || [];
		const unclosedTags = htmlTags.filter((tag) => !tag.startsWith("</")).length;
		const closingTags = htmlTags.filter((tag) => tag.startsWith("</")).length;
		if (unclosedTags !== closingTags) {
			return { isValid: false, error: "Unmatched HTML tags found" };
		}

		// Check for unmatched Markdown links
		const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
		const links = markdown.match(linkPattern) || [];
		const linkTexts = markdown.match(/\[([^\]]+)\]/g) || [];
		const linkUrls = markdown.match(/\(([^)]+)\)/g) || [];
		if (links.length !== linkTexts.length || links.length !== linkUrls.length) {
			return { isValid: false, error: "Unmatched Markdown links found" };
		}

		const equalSignMisuse = markdown.match(/(^|\s)=\s*[^=]|\s=\s*$/gm);
		if (equalSignMisuse && equalSignMisuse.length > 0) {
			return { isValid: false, error: "Misuse of equal sign (=) found" };
		}

		return { isValid: true };
	} catch (error) {
		return { isValid: false, error: "Error validating markdown"+error };
	}
};

export function QuestionForm({
	initialData,
	onSubmitAction,
	isDialog = false,
	onClose,
	open,
	rounds = [],
}: QuestionFormProps) {
	const router = useRouter();
	const [markdownError, setMarkdownError] = useState<string>("");
	const [isPending, startTransition] = useTransition();
	const [formData, setFormData] = useState<Partial<Problem>>({
		title: "",
		nickname: "",
		description: "",
		difficulty: "EASY" as Difficulty,
		roundId: "",
		maxScore: 0,
		web_code: "",
		normal_cases: 0,
		edge_cases: 0,
	});
	const [files, setFiles] = useState({
		win_dl: null as File | null,
		mac_dl: null as File | null,
		lin_dl: null as File | null,
	});
	const [currentFiles, setCurrentFiles] = useState({
		win_dl: "",
		mac_dl: "",
		lin_dl: "",
	});

	useEffect(() => {
		if (initialData) {
			setFormData({
				...initialData,
				roundId: (initialData.roundId || "1").toString(),
			});
			setCurrentFiles({
				win_dl: initialData.win_dl || "",
				mac_dl: initialData.mac_dl || "",
				lin_dl: initialData.lin_dl || "",
			});
		}
	}, [initialData]);

	useEffect(() => {
		if (formData.description) {
			const validation = validateMarkdown(formData.description);
			setMarkdownError(validation.error || "");
		}
	}, [formData.description]);

	const handleSubmit = (e: React.FormEvent) => {
		startTransition(async () => {
			e.preventDefault();

			// Validate markdown before submission
			const markdownValidation = validateMarkdown(formData.description || "");
			if (!markdownValidation.isValid) {
				alert(markdownValidation.error);
				return;
			}

			// Add validation
			if ((formData.normal_cases ?? 0) < 0 || (formData.edge_cases ?? 0) < 0) {
				alert("Number of cases cannot be negative");
				return;
			}

			try {
				const formDataToSend = new FormData();

				for (const [key, value] of Object.entries(formData)) {
					if (
						value !== null &&
						value !== undefined &&
						!["win_dl", "mac_dl", "lin_dl"].includes(key)
					) {
						formDataToSend.append(key, value.toString());
					}
				}

				if (files.win_dl) formDataToSend.append("windows", files.win_dl);
				if (files.mac_dl) formDataToSend.append("mac", files.mac_dl);
				if (files.lin_dl) formDataToSend.append("linux", files.lin_dl);

				await onSubmitAction(formDataToSend);

				if (!isDialog) {
					router.push("/problems");
					router.refresh();
				}
			} catch (error) {
				console.error("Error submitting question:", error);
			}
		});
	};

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: keyof typeof files,
	) => {
		if (e.target.files?.[0]) {
			setFiles((prev) => ({
				...prev,
				[field]: e.target.files?.[0],
			}));
		}
	};

	const FormContent = (
		<form onSubmit={handleSubmit} className="space-y-8">
			<div className="grid gap-6">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							placeholder="Question title"
							value={formData.title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="nickname">Nickname</Label>
						<Input
							id="nickname"
							placeholder="Internal reference name"
							value={formData.nickname || ""}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, nickname: e.target.value }))
							}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						placeholder="Question description"
						className={`min-h-[100px] ${markdownError ? "border-red-500" : ""}`}
						value={formData.description || ""}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, description: e.target.value }))
						}
					/>
					{markdownError && (
						<p className="text-sm text-red-500">{markdownError}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="javascript">JavaScript Code</Label>
					<Textarea
						id="javascript"
						placeholder="Enter JavaScript code here..."
						className="min-h-[200px] font-mono"
						value={formData.web_code || ""}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, web_code: e.target.value }))
						}
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<div className="space-y-2">
						<Label>Difficulty</Label>
						<Select
							value={formData.difficulty}
							onValueChange={(value: Difficulty) =>
								setFormData((prev) => ({ ...prev, difficulty: value }))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select difficulty" />
							</SelectTrigger>
							<SelectContent>
								{["EASY", "MEDIUM", "HARD"].map((difficulty) => (
									<SelectItem key={difficulty} value={difficulty}>
										{difficulty}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Round</Label>
						<Select
							value={formData.roundId}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									roundId: value,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select round" />
							</SelectTrigger>
							<SelectContent>
								{rounds.map((round) => (
									<SelectItem key={round.id} value={round.id}>
										Round {round.number}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="maxScore">Max Score</Label>
						<Input
							id="maxScore"
							type="number"
							min="0"
							value={formData.maxScore}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									maxScore: Number.parseInt(e.target.value) || 0,
								}))
							}
						/>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="normalCases">Number of Normal Cases</Label>
						<Input
							id="normalCases"
							type="number"
							min="0"
							value={formData.normal_cases}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									normal_cases: Number.parseInt(e.target.value) || 0,
								}))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="edgeCases">Number of Edge Cases</Label>
						<Input
							id="edgeCases"
							type="number"
							min="0"
							value={formData.edge_cases}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									edge_cases: Number.parseInt(e.target.value) || 0,
								}))
							}
						/>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<div className="space-y-2">
						<Label htmlFor="win_dl">Windows Executable</Label>
						{currentFiles.win_dl && (
							<div className="text-sm text-green-500 mb-2">
								Uploaded:
								<a
									href={currentFiles.win_dl}
									target="_blank"
									rel="noopener noreferrer"
									className="underline text-blue-500 hover:text-blue-700"
								>
									{currentFiles.win_dl.split("/").pop()}
								</a>
							</div>
						)}
						<Input
							id="win_dl"
							type="file"
							accept=".exe"
							onChange={(e) => handleFileChange(e, "win_dl")}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="mac_dl">Mac Executable</Label>
						{currentFiles.mac_dl && (
							<div className="text-sm text-green-500 mb-2">
								Uploaded:
								<a
									href={currentFiles.mac_dl}
									target="_blank"
									rel="noopener noreferrer"
									className="underline text-blue-500 hover:text-blue-700"
								>
									{currentFiles.mac_dl.split("/").pop()}
								</a>
							</div>
						)}
						<Input
							id="mac_dl"
							type="file"
							accept=".mac"
							onChange={(e) => handleFileChange(e, "mac_dl")}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="lin_dl">Linux Executable</Label>
						{currentFiles.lin_dl && (
							<div className="text-sm text-green-500 mb-2">
								Uploaded:
								<a
									href={currentFiles.lin_dl}
									target="_blank"
									rel="noopener noreferrer"
									className="underline text-blue-500 hover:text-blue-700"
								>
									{currentFiles.lin_dl.split("/").pop()}
								</a>
							</div>
						)}
						<Input
							id="lin_dl"
							type="file"
							accept=".lin"
							onChange={(e) => handleFileChange(e, "lin_dl")}
						/>
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-4">
				<Button
					variant="outline"
					onClick={() => (isDialog ? onClose?.() : router.back())}
					type="button"
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending
						? "Saving..."
						: initialData
							? "Save Changes"
							: "Create Question"}
				</Button>
			</div>
		</form>
	);

	if (isDialog) {
		return (
			<Dialog open={open} onOpenChange={() => onClose?.()}>
				<DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
					<DialogHeader>
						<DialogTitle>
							{initialData ? "Edit Question" : "Create Question"}
						</DialogTitle>
					</DialogHeader>
					{FormContent}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl py-6">
			<Card>
				<CardHeader>
					<CardTitle>
						{initialData ? "Edit Question" : "Create Question"}
					</CardTitle>
				</CardHeader>
				<CardContent>{FormContent}</CardContent>
			</Card>
		</div>
	);
}
