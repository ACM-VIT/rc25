'use client'

import ValidateButton from './ValidateButton';
import { useState } from 'react'
import AddTestCaseModal from './AddTestCaseModal'
import EditTestCaseDialog from './EditTestCaseDialog'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import deleteTestCase from './action/deletecase'
import { validateCode } from './validate';
import UploadFolder from './UploadFolder';

// Add this constant at the top of the file
const commonButtonStyle = "inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium";

interface Problem {
  id: string;
  title: string;
  nickname: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  maxScore: number;
  roundNumber: number;
  description: string;
  norml_cases: number;
  edge_cases: number;
  lin_dl: string;
  win_dl: string;
  mac_dl: string;
  web_code: string;
  Testcase: TestCase[];
}

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [testCaseToDelete, setTestCaseToDelete] = useState<string | null>(null)
  const [key, setKey] = useState(0) // For forcing re-render after adding test case

  // Add validation state
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  const handleTestCaseAdded = () => {
    setKey(prev => prev + 1)
    // You might want to implement a more sophisticated refresh strategy
    window.location.reload()
  }

  const handleEditTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setIsEditDialogOpen(true)
  }

  const handleTestCaseEdited = () => {
    setKey(prev => prev + 1)
    window.location.reload()
  }

  const handleDeleteTestCase = async () => {
    if (testCaseToDelete) {
      await deleteTestCase(testCaseToDelete)
      setKey(prev => prev + 1)
      window.location.reload()
    }
    setIsDeleteDialogOpen(false)
  }

  // Add validation handler
  const handleValidateAll = async () => {
    setIsValidating(true);
    const results = problem.Testcase.reduce((acc, testCase) => ({
      ...acc,
      [testCase.id]: validateCode(problem.web_code, testCase.input, testCase.output)
    }), {});
    setValidationResults(results);
    setIsValidating(false);
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

  // Update the table rows to use serial numbers
  const tableRows = problem.Testcase.map((testCase, index) => (
    <tr key={testCase.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-black">{index + 1}</td>
      <td className="px-6 py-4 whitespace-nowrap text-black">{testCase.weight}</td>
      <td className="px-6 py-4 text-black">{testCase.input}</td>
      <td className="px-6 py-4 text-black">{testCase.output}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-sm rounded-full ${
          testCase.isEdge ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
        }`}>
          {testCase.isEdge ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          className="text-blue-600 hover:text-blue-900"
          onClick={() => handleEditTestCase(testCase)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button 
          className="text-red-600 hover:text-red-900 ml-2"
          onClick={() => {
            setTestCaseToDelete(testCase.id)
            setIsDeleteDialogOpen(true)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v10a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 4a1 1 0 112 0v8a1 1 0 11-2 0V6z" clipRule="evenodd" />
          </svg>
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {validationResults[testCase.id] !== undefined && (
          <span className={`px-2 py-1 text-sm rounded-full ${
            validationResults[testCase.id] 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {validationResults[testCase.id] ? "Passed" : "Failed"}
          </span>
        )}
      </td>
    </tr>
  ));

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-black">{problem.title}</h1>
          <p className="text-gray-600">Nickname: {problem.nickname}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2 text-black">Difficulty</h3>
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
            <h3 className="font-semibold mb-2 text-black">Max Score</h3>
            <p className="text-black">{problem.maxScore}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2 text-black">Round Number</h3>
            <p className="text-black">{problem.roundNumber}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-black">Description</h2>
          <div className="prose max-w-none text-black">{problem.description}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2 text-black">Test Cases</h3>
            <p className="text-black">Normal: {problem.norml_cases}</p>
            <p className="text-black">Edge: {problem.edge_cases}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-black">Downloads</h3>
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
          <h2 className="text-2xl font-semibold text-black">Test Cases</h2>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className={commonButtonStyle}
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Single Test Case
            </button>
            
            <UploadFolder problemId={problem.id} onSuccess={() => window.location.reload()} />
            
            <ValidateButton 
              onValidate={handleValidateAll}
              isValidating={isValidating}
              className={commonButtonStyle}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg text-gray-900">
            <thead>
              {tableHeaders}
            </thead>
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
    </div>
  );
}
