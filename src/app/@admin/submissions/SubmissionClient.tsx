'use client'

import { useState } from 'react'

interface Submission {
  id: string
  code: string
  problemId: string
  userId: string
  score: number // Ensure score is not nullable
  testcasespassed: boolean[]
  createdAt: Date
  updatedAt: Date
  problem: {
    title: string
  }
}

interface SubmissionDetailProps {
  submission: Submission
  onClose: () => void
}

const SubmissionDetail = ({ submission, onClose }: SubmissionDetailProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full m-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{submission.problem.title}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="mt-4">
          <p>{submission.code}</p>
          <p className="text-sm text-gray-500 mt-2">
            Submitted: {new Date(submission.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SubmissionClient({ 
  initialSubmissions 
}: { 
  initialSubmissions: Submission[] 
}) {
  const [submissions] = useState<Submission[]>(initialSubmissions)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submissions</h1>
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            onClick={() => setSelectedSubmission(submission)}
            onKeyUp={(e) => e.key === 'Enter' && setSelectedSubmission(submission)}
            className="p-4 border rounded-lg cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all duration-200"
          >
            <h3 className="font-semibold">{submission.problem.title}</h3>
            <p className="text-sm text-gray-600">
              Score: {submission.score} | Test Cases Passed: {submission.testcasespassed.filter(Boolean).length}
            </p>
          </div>
        ))}
      </div>

      {selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  )
}