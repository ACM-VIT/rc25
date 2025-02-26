"use client";
import React, { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { updateSolution } from "@/app/actions/update-solution";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface SolutionEditorProps {
  problemId: string;
  initialCode: string;
  initialExplanation: string;
}

export default function SolutionEditor({
  problemId,
  initialCode,
  initialExplanation,
}: SolutionEditorProps) {
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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit Solution</h2>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="problemId" value={problemId} />
        <div>
          <label htmlFor="solution_code" className="block mb-1 font-semibold">
            Solution Code
          </label>
          <div className="border rounded overflow-hidden">
            <MonacoEditor
              height="300px"
              defaultLanguage="cpp"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
              }}
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="solution_explanation" className="block mb-1 font-semibold">
            Explanation
          </label>
          <textarea
            id="solution_explanation"
            name="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={6}
            className="border rounded p-2 w-full whitespace-pre-wrap"
            placeholder="Enter your explanation here..."
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {isPending ? "Saving..." : "Save Solution"}
        </button>
        {confirmation && (
          <div className="mt-2 text-green-600 font-semibold">{confirmation}</div>
        )}
      </form>
    </div>
  );
}
