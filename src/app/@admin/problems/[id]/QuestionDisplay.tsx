"use client";

import ValidateButton from "./ValidateButton";
import { useState } from "react";
import AddTestCaseModal from "./AddTestCaseModal";
import EditTestCaseDialog from "./EditTestCaseDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import deleteTestCase from "../../../actions/delete-case";
import deleteAllTestCases from "../../../actions/delete-all-test-cases";
import { validateCode } from "./validate";
import UploadFolder from "./UploadFolder";
import { useRouter } from "next/navigation";
import DeleteQuestionDialog from "../DeleteQuestionDialog";
import { deleteQuestion } from "@/app/actions/delete-question";
import type { Problem as PrismaBaseProblem } from "@/db/schema";
import hideQuestion from "./hideQuestion";

interface Problem extends PrismaBaseProblem {
    Testcase: TestCase[];
    round: {
        number: number;
    };
}

// Add this constant at the top of the file
const commonButtonStyle =
    "inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium";

interface TestCase {
    id: string;
    weight: number;
    input: string;
    output: string;
    isEdge: boolean;
}

interface ViewProblemProps {
    problem: Problem;
}

export default function ViewProblem({ problem }: ViewProblemProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
        null
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [testCaseToDelete, setTestCaseToDelete] = useState<string | null>(
        null
    );
    const [key, setKey] = useState(0); // For forcing re-render after adding test case
    const [switchHideModalVisible, setSwitchHideModalVisible] = useState(false);

    const handleSwitchHideModalVisible = () => {
        setSwitchHideModalVisible((prev) => !prev);
    };

    // Add validation state
    const [validationResults, setValidationResults] = useState<
        Record<string, boolean>
    >({});
    const [isValidating, setIsValidating] = useState(false);

    // Add new state
    const router = useRouter();
    const [isDeleteQuestionDialogOpen, setIsDeleteQuestionDialogOpen] =
        useState(false);

    const handleTestCaseAdded = () => {
        setKey((prev) => prev + 1);
        // You might want to implement a more sophisticated refresh strategy
        window.location.reload();
    };

    const handleEditTestCase = (testCase: TestCase) => {
        setSelectedTestCase(testCase);
        setIsEditDialogOpen(true);
    };

    const handleTestCaseEdited = () => {
        setKey((prev) => prev + 1);
        window.location.reload();
    };

    const handleDeleteTestCase = async () => {
        if (testCaseToDelete) {
            await deleteTestCase(testCaseToDelete);
            setKey((prev) => prev + 1);
            window.location.reload();
        }
        setIsDeleteDialogOpen(false);
    };

    // Add validation handler
    const handleValidateAll = async () => {
        setIsValidating(true);
        const results: Record<string, boolean> = {};
        for (const testCase of problem.Testcase) {
            results[testCase.id] = validateCode(
                problem.web_code,
                testCase.input,
                testCase.output
            );
        }
        setValidationResults(results);
        setIsValidating(false);
    };

    // Add new handler
    const handleDeleteQuestion = async () => {
        try {
            await deleteQuestion(problem.id);
            router.push("/problems");
            router.refresh();
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const handleDeleteAllTestCases = async () => {
        try {
            await deleteAllTestCases(problem.id);
            setKey((prev) => prev + 1);
            window.location.reload();
        } catch (error) {
            console.error("Error deleting all test cases:", error);
        }
    };

    const handleSwitchingVisibility = async () => {
        try {
            console.log(problem);
            await hideQuestion(problem.id, !problem.isHidden);
            router.refresh();
            setSwitchHideModalVisible(false);
        } catch (error) {
            console.error("Error switching visibility:", error);
        }
    };

    // Update table headers
    const tableHeaders = (
        <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Input
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Output
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Is Edge
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
            </th>
        </tr>
    );

    // Update the table rows to use serial numbers and wrap content
    const tableRows = problem.Testcase.map((testCase, index) => (
        <tr key={testCase.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-black">
                {index + 1}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-black">
                {testCase.weight}
            </td>
            <td className="px-6 py-4 text-black break-words">
                {testCase.input}
            </td>
            <td className="px-6 py-4 text-black break-words">
                {testCase.output}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`px-2 py-1 text-sm rounded-full ${
                        testCase.isEdge
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                >
                    {testCase.isEdge ? "Yes" : "No"}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    type="button"
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => handleEditTestCase(testCase)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <title>Edit Test Case</title>
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button
                    type="button"
                    className="text-red-600 hover:text-red-900 ml-2"
                    onClick={() => {
                        setTestCaseToDelete(testCase.id);
                        setIsDeleteDialogOpen(true);
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <title>Delete Test Case</title>
                        <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v10a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 4a1 1 0 112 0v8a1 1 0 11-2 0V6z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {validationResults[testCase.id] !== undefined && (
                    <span
                        className={`px-2 py-1 text-sm rounded-full ${
                            validationResults[testCase.id]
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {validationResults[testCase.id] ? "Passed" : "Failed"}
                    </span>
                )}
            </td>
        </tr>
    ));

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-black">
                            {problem.title}
                        </h1>
                        <p className="text-gray-600">
                            Nickname: {problem.nickname}
                        </p>
                    </div>

                    <div>
                        <h1 className="text-xl font-semibold mb-2 text-black">
                            This question is:{" "}
                            <span
                                className={
                                    problem.isHidden
                                        ? "text-red-500"
                                        : "text-green-500"
                                }
                            >
                                {problem.isHidden ? "Hidden" : "Visible"}
                            </span>
                        </h1>
                        {problem.isHidden ? (
                            <button onClick={handleSwitchHideModalVisible}>
                                <span className="px-2 py-1 rounded-lg bg-red-500 text-white">
                                    Make it visible
                                </span>
                            </button>
                        ) : (
                            <button onClick={handleSwitchHideModalVisible}>
                                <span className="px-2 py-1 rounded-lg bg-red-500 text-white">
                                    Hide this question
                                </span>
                            </button>
                        )}
                    </div>

                    {switchHideModalVisible && (
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                                <h2 className="text-2xl font-semibold text-black mb-4">
                                    Are you sure you want to{" "}
                                    {problem.isHidden ? "Show" : "Hide"} this
                                    question?
                                </h2>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleSwitchHideModalVisible}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSwitchingVisibility}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsDeleteQuestionDialogOpen(true)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg 
              flex items-center space-x-2 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <title>Delete Question Icon</title>
                            <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>Delete Question</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded">
                        <h3 className="font-semibold mb-2 text-black">
                            Difficulty
                        </h3>
                        <span
                            className={`
              px-2 py-1 rounded text-sm
              ${problem.difficulty === "EASY" && "bg-green-100 text-green-800"}
              ${
                  problem.difficulty === "MEDIUM" &&
                  "bg-yellow-100 text-yellow-800"
              }
              ${problem.difficulty === "HARD" && "bg-red-100 text-red-800"}
            `}
                        >
                            {problem.difficulty}
                        </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded">
                        <h3 className="font-semibold mb-2 text-black">
                            Max Score
                        </h3>
                        <p className="text-black">{problem.maxScore}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded">
                        <h3 className="font-semibold mb-2 text-black">
                            Round Number
                        </h3>
                        <p className="text-black">{problem.round.number}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-black">
                        Description
                    </h2>
                    <div className="prose max-w-none text-black">
                        {problem.description}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-black">
                            Test Cases
                        </h3>
                        <p className="text-black">
                            Normal: {problem.normal_cases}
                        </p>
                        <p className="text-black">Edge: {problem.edge_cases}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2 text-black">
                            Downloads
                        </h3>
                        <div className="space-y-2">
                            <p className="text-black">
                                Linux:
                                <a
                                    href={problem.lin_dl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline visited:text-purple-600"
                                >
                                    Click to Download
                                </a>
                            </p>
                            <p className="text-black">
                                Windows:
                                <a
                                    href={problem.win_dl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline visited:text-purple-600"
                                >
                                    Click to Download
                                </a>
                            </p>
                            <p className="text-black">
                                Mac:
                                <a
                                    href={problem.mac_dl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline visited:text-purple-600"
                                >
                                    Click to Download
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-black">
                        Test Cases
                    </h2>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className={commonButtonStyle}
                        >
                            <svg
                                className="mr-2 h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <title>Add Test Case</title>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Add Single Test Case
                        </button>

                        <UploadFolder
                            problemId={problem.id}
                            onSuccess={() => window.location.reload()}
                        />

                        <ValidateButton
                            onValidate={handleValidateAll}
                            isValidating={isValidating}
                            className={commonButtonStyle}
                        />

                        <button
                            type="button"
                            onClick={handleDeleteAllTestCases}
                            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                        >
                            <svg
                                className="mr-2 h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <title>Delete All Test Cases</title>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Delete All Test Cases
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg text-gray-900">
                        <thead>{tableHeaders}</thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddTestCaseModal
                key={key}
                problemId={problem.id}
                webCode={problem.web_code}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleTestCaseAdded}
            />

            {selectedTestCase && (
                <EditTestCaseDialog
                    problemId={problem.id}
                    webCode={problem.web_code}
                    testCase={selectedTestCase}
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                    onSuccess={handleTestCaseEdited}
                />
            )}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteTestCase}
            />
            <DeleteQuestionDialog
                isOpen={isDeleteQuestionDialogOpen}
                onClose={() => setIsDeleteQuestionDialogOpen(false)}
                onConfirm={handleDeleteQuestion}
                title={problem.title}
            />
        </div>
    );
}
