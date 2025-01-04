'use client';

import { useState } from 'react';
import addTestCase from './action/addcase';
import { validateCode } from './validate';

interface EditTestCaseDialogProps {
  problemId: string;
  webCode: string;  // Add this
  testCase: {
    id: string;
    input: string;
    output: string;
    weight: number;
    isEdge: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTestCaseDialog({ problemId, webCode, testCase, isOpen, onClose, onSuccess }: EditTestCaseDialogProps) {
  const [input, setInput] = useState(testCase.input);
  const [output, setOutput] = useState(testCase.output);
  const [weight, setWeight] = useState(testCase.weight);
  const [isEdge, setIsEdge] = useState(testCase.isEdge);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTestCase(problemId, weight, input, output, isEdge, testCase.id);
    onSuccess();
    onClose();
  };

  const handleCheck = () => {
    if (!input || !output) {
      return;
    }
    const result = validateCode(webCode, input, output);
    setValidationResult(result);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4 text-black">Edit Test Case</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">Input</label>
              <textarea
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm text-black"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Output</label>
              <textarea
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm text-black"
                value={output}
                onChange={(e) => setOutput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Weight</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm text-black"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="flex items-center text-black">
                <input
                  type="checkbox"
                  checked={isEdge}
                  onChange={(e) => setIsEdge(e.target.checked)}
                />
                <span className="ml-2">Is Edge Case</span>
              </label>
            </div>
            {validationResult !== null && (
              <div className={`p-2 rounded ${validationResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {validationResult ? 'Test case passed!' : 'Test case failed!'}
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Save Changes
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