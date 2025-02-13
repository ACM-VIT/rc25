"use client";

import { useState, useTransition } from "react";
import type { Round, Testcase, Problem as PrismaProblem } from "@prisma/client";
import { handleQuestionSubmit } from "@/app/actions/upsert-question";
import { ProblemDialog } from "./ProblemDialog";
import DeleteButton from "./DeleteButton";
import CreateProblemButton from "./CreateProblemButton";
import Link from "next/link";

type Problem = PrismaProblem & {
    roundNumber: number;
    Testcase: Testcase[];
};

interface ProblemsClientProps {
    problems: Problem[];
    rounds: Round[];
}

export default function ProblemsClient({
    problems,
    rounds,
}: ProblemsClientProps) {
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleEdit = async (formData: FormData) => {
        startTransition(async () => {
            await handleQuestionSubmit(formData, editingProblem?.id);
            setEditingProblem(null);
            window.location.reload();
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
                <CreateProblemButton />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg text-gray-900">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-6 py-3 text-left">Nickname</th>
                            <th className="px-6 py-3 text-left">Difficulty</th>
                            <th className="px-6 py-3 text-left">Round</th>
                            <th className="px-6 py-3 text-left">Max Score</th>
                            <th className="px-6 py-3 text-center">
                                Visibility
                            </th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map((problem) => (
                            <tr
                                key={problem.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">{problem.title}</td>
                                <td className="px-6 py-4">
                                    {problem.nickname}
                                </td>
                                <td className="px-6 py-4">
                                    {problem.difficulty}
                                </td>
                                <td className="px-6 py-4">
                                    {problem.roundNumber}
                                </td>
                                <td className="px-6 py-4">
                                    {problem.maxScore}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        className={`${
                                            problem.isHidden
                                                ? "text-red-500"
                                                : "text-green-500"
                                        } px-3 py-1 rounded font-bold cursor-default`}
                                    >
                                        {problem.isHidden
                                            ? "Hidden"
                                            : "Visible"}
                                    </button>
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    <Link
                                        href={`/problems/${problem.id}`}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        View
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingProblem(problem)
                                        }
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                        disabled={isPending}
                                    >
                                        {isPending ? "Editing..." : "Edit"}
                                    </button>
                                    <DeleteButton
                                        problemId={problem.id}
                                        title={problem.title}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ProblemDialog
                isOpen={!!editingProblem}
                onClose={() => setEditingProblem(null)}
                initialData={editingProblem}
                onSubmit={handleEdit}
                rounds={rounds}
            />
        </div>
    );
}
