'use client';

import { useState, useEffect } from 'react';
import createSubmission from '@/app/actions/create-submission';
import { checkSubmissionStatus } from '@/app/actions/submit-code';
import parse from 'html-react-parser';


// Initialize DOMPurify only on client side
import DOMPurify from 'dompurify';

const DEFAULT_LANGUAGE = "c";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  maxScore: number;
}

interface SubmissionResult {
  success: boolean;
  submission?: {
    id: string;
    code: string;
    problemId: string;
    userId: string;
    testcasespassed: boolean[];
    // Add other relevant fields if needed
  };
  token?: string;
  error?: string;
}

interface ViewProblemProps {
  problem: Problem;
  session: { user: { id: string }}; // Use Session type
}

export default function ViewProblem({ problem, session }: ViewProblemProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    if (DOMPurify) {
      const clean = DOMPurify.sanitize(problem.description, {
        USE_PROFILES: { html: true }
      });
      setSanitizedContent(clean);
    }
  }, [problem.description]);

  const checkStatus = async (token: string) => {
    const status = await checkSubmissionStatus(token);
    
    if (status.success) {
      setSubmissionStatus('Accepted');
      setResult(status);
    } else if (status.error) {
      setSubmissionStatus('Failed');
      setError(status.error);
    } else {
      // Keep checking if still processing
      setTimeout(() => checkStatus(token), 2000);
    }
  };

  const handleSubmit = async () => {

    // Use session instead of calling auth()
    if (!session?.user?.id) {
      setError('Please login to submit');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSubmissionStatus('Submitting...');

      const submissionResult = await createSubmission({
        code,
        problemId: problem.id,
        userId: session.user.id,
        language: DEFAULT_LANGUAGE,
      });


      if (submissionResult.success && submissionResult.token) {
        setSubmissionStatus('Processing...');
        setResult(submissionResult); // Update the result state
        checkStatus(submissionResult.token);
      } else {
        setError(submissionResult.error || 'Submission failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <div className="flex gap-4">
          <span className={`px-2 py-1 rounded ${
            problem.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
            problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {problem.difficulty}
          </span>
          <span className="text-gray-600">Score: {problem.maxScore}</span>
        </div>
      </div>
      
      <div className="mb-8 prose max-w-none">
        <div className="whitespace-pre-wrap">
          {parse(sanitizedContent)}
        </div>
      </div>

      <div className="mb-6">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono bg-gray-50 border rounded"
          placeholder="Paste your code here..."
        />
      </div>

      {submissionStatus && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          Status: {submissionStatus}
        </div>
      )}

      {result && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Solution'}
      </button>
    </div>
  );
}