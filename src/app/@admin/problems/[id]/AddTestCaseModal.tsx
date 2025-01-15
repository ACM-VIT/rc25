"use client";

import { useState } from "react";
import addTestCase from "../../../actions/upsert-case";
import { validateCode } from "./validate";

interface AddTestCaseModalProps {
  problemId: string;
  webCode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTestCaseModal({
  problemId,
  webCode,
  isOpen,
  onClose,
  onSuccess,
}: AddTestCaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationResult, setValidationResult] = useState<boolean | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await addTestCase(
        problemId,
        Number(formData.get("weight")),
        formData.get("input") as string,
        formData.get("output") as string,
        formData.get("isEdge") === "true"
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Add test case error:", error); // Log the error
      setError("Failed to add test case");
    } finally {
      setLoading(false);
    }
  }

  const handleCheck = async () => {
    const form = document.querySelector("form") as HTMLFormElement;
    const formData = new FormData(form);
    const input = formData.get("input") as string;
    const output = formData.get("output") as string;

    if (!input || !output) {
      setError("Please fill in all fields");
      return;
    }

    const result = validateCode(webCode, input, output);
    setValidationResult(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black">Add New Test Case</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="weight" className="block mb-1 text-black">
                Weight
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                required
                className="w-full border p-2 rounded text-black"
              />
            </div>
            <div>
              <label htmlFor="input" className="block mb-1 text-black">
                Input
              </label>
              <textarea
                name="input"
                required
                className="w-full border p-2 rounded text-black"
              />
            </div>
            <div>
              <label htmlFor="output" className="block mb-1 text-black">
                Output
              </label>
              <textarea
                name="output"
                required
                className="w-full border p-2 rounded text-black"
              />
            </div>
            <div>
              <label className="flex items-center text-black">
                <input type="checkbox" name="isEdge" value="true" />
                <span className="ml-2">Is Edge Case</span>
              </label>
            </div>
            {validationResult !== null && (
              <div
                className={`p-2 rounded ${
                  validationResult
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {validationResult ? "Test case passed!" : "Test case failed!"}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-black"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Test Case"}
            </button>
            <button
              type="button"
              onClick={handleCheck}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
