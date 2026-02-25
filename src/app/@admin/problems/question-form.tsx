"use client";

import type React from "react";
import { useTransition } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty, Problem } from "@prisma/client";
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
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { reporter } from 'vfile-reporter';

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

type FormState = Partial<Problem> & {
	initial?: number;
	minimum?: number;
	decay?: number;
};

const validateMarkdown = async (markdown: string): Promise<MarkdownValidationError> => {
	if (!markdown || typeof markdown !== "string") {
		return { isValid: false, error: "Description is required" };
	}

	try {
		const file = await remark()
			.use(remarkMdx)
			.use(remarkGfm)
			.use(remarkFrontmatter)
			.use(remarkRehype)
			.use(rehypeStringify)
			.process(markdown);

		const report = reporter(file);
		
		// If there are any warnings or errors
		if (report && report !== 'no issues found') {
			return { 
				isValid: false, 
				error: `MDX validation issues:\n${report}` 
			};
		}

		// Additional custom checks for specific requirements
		const validation = validateMDXRules(markdown);
		if (!validation.isValid) {
			return validation;
		}

		return { isValid: true };
	} catch (error) {
		return { 
			isValid: false, 
			error: `Error validating MDX: ${error}` 
		};
	}
};

const validateMDXRules = (markdown: string): MarkdownValidationError => {
	// Check for unmatched MDX component tags
	const componentTags = markdown.match(/<[^>]+>/g) || [];
	const openTags = componentTags.filter(tag => !tag.includes('/>') && !tag.startsWith('</'));
	const closeTags = componentTags.filter(tag => tag.startsWith('</'));
	
	if (openTags.length !== closeTags.length) {
		return { isValid: false, error: "Unmatched MDX component tags found" };
	}

	// Check for invalid JSX expressions
	const jsxExpressions = markdown.match(/{[^}]+}/g) || [];
	for (const expr of jsxExpressions) {
		if (expr.includes('{{') || expr.includes('}}')) {
			return { isValid: false, error: "Invalid JSX expression syntax" };
		}
	}

	// Existing custom rules
	const tripleBacktickCount = (markdown.match(/```/g) || []).length;
	if (tripleBacktickCount % 2 !== 0) {
		return { isValid: false, error: "Unmatched code block markers found" };
	}

	return { isValid: true };
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
	const [formData, setFormData] = useState<FormState>({
		title: "",
		nickname: "",
		description: "",
		difficulty: "EASY" as Difficulty,
		roundId: "",
		maxScore: 0,
		initial: 0,
		minimum: 0,
		decay: 1,
		web_code: "",
		normal_cases: 0,
		edge_cases: 0,
	});

	useEffect(() => {
		if (initialData) {
			setFormData({
				...initialData,
				roundId: (initialData.roundId || "1").toString(),
				maxScore: initialData.maxScore ?? 0,
				initial: initialData.maxScore ?? 0,
				minimum: 0,
				decay: 1,
			});
		}
	}, [initialData]);

	useEffect(() => {
		if (formData.description) {
			const validate = async () => {
				const validation = await validateMarkdown(formData.description || "");
				setMarkdownError(validation.error || "");
			};
			validate();
		}
	}, [formData.description]);

	const handleSubmit = (e: React.FormEvent) => {
		startTransition(async () => {
			e.preventDefault();

			// Validate markdown before submission
			const markdownValidation = await validateMarkdown(formData.description || "");
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
						value !== ""
					) {
						formDataToSend.append(key, value.toString());
					}
				}

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
						<Label htmlFor="initial">Initial Points</Label>
						<Input
							id="initial"
							type="number"
							min="0"
							value={formData.initial ?? formData.maxScore ?? 0}
							onChange={(e) => {
								const value = Number.parseInt(e.target.value) || 0;
								setFormData((prev) => ({
									...prev,
									initial: value,
									maxScore: value,
								}));
							}}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="minimum">Minimum Points</Label>
						<Input
							id="minimum"
							type="number"
							min="0"
							value={formData.minimum ?? 0}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									minimum: Number.parseInt(e.target.value) || 0,
								}))
							}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="decay">Decay (Solves to Minimum)</Label>
						<Input
							id="decay"
							type="number"
							min="1"
							value={formData.decay ?? 1}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									decay: Number.parseInt(e.target.value) || 1,
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
