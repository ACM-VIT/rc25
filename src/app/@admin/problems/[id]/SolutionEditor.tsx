"use client";
import React, { useState, useTransition } from "react";
import { updateSolution } from "@/app/actions/update-solution";

interface SolutionEditorFormProps {
  problemId: string;
  initialCode: string;
  initialExplanation: string;
}

export default function SolutionEditorForm({
  problemId,
  initialCode,
  initialExplanation,
}: SolutionEditorFormProps) {
  const [code, setCode] = useState(initialCode);
  const [explanation, setExplanation] = useState(initialExplanation);
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("problemId", problemId);
    formData.append("code", code);
    formData.append("explanation", explanation);

    startTransition(async () => {
      try {
        await updateSolution(formData);
        setConfirmation("Solution updated successfully!");
        setTimeout(() => setConfirmation(""), 3000);
      } catch (error) {
        console.error("Update failed:", error);
        setConfirmation("Update failed. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="problemId" value={problemId} />
      <div>
        <label htmlFor="solution_code">Solution Code</label>
        <textarea
          id="solution_code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={6}
          className="border rounded p-2 w-full"
        />
      </div>
      <div>
        <label htmlFor="solution_explanation">Explanation</label>
        <textarea
          id="solution_explanation"
          name="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={4}
          className="border rounded p-2 w-full"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-green-500 text-white rounded mt-4"
      >
        {isPending ? "Saving..." : "Save Solution"}
      </button>
      {confirmation && (
        <div className="mt-2 text-green-600 font-semibold">{confirmation}</div>
      )}
    </form>
  );
}
