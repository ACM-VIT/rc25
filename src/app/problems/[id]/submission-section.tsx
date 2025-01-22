"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { getTeamSubmissions } from "./actions";

interface SubmissionSectionProps {
  userId: string;
  problemId: string;
}

interface Submission {
  id: string;
  code: string;
  score: number | null;
  testcasespassed: boolean[];
  createdAt: Date;
}

const SubmissionSection: React.FC<SubmissionSectionProps> = ({ userId, problemId }) => {
  const [selectedOption, setSelectedOption] = useState<string>("best-submission");
  const [submissions, setSubmissions] = useState<{
    best: Submission | null;
    latest: Submission | null;
  }>({ best: null, latest: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getTeamSubmissions(userId, problemId);
      setSubmissions(data);
      setLoading(false);
    };
    fetchData();
  }, [userId, problemId]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const renderSubmission = (submission: Submission | null) => {
    if (loading) return <p>Loading submissions...</p>;
    if (!submission) return <p>No submission found</p>;

    const passedCount = submission.testcasespassed.filter(Boolean).length;
    const totalTests = submission.testcasespassed.length;

    return (
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span>Score: {submission.score}</span>
        </div>
        <div className="mb-2">
          Passed: {passedCount}/{totalTests} test cases
        </div>
        <div className="text-xs overflow-auto max-h-[200px]">
          <pre>{submission.code}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="border-2 border-yellow-400 rounded-lg p-4 bg-black/50 text-white">
      <select
        value={selectedOption}
        onChange={handleChange}
        className="w-full p-2 mb-4 bg-black border border-yellow-400 rounded"
      >
        <option value="best-submission">Best Submission</option>
        <option value="latest-submission">Latest Submission</option>
      </select>

      {selectedOption === "best-submission" && 
        renderSubmission(submissions.best)
      }

      {selectedOption === "latest-submission" && 
        renderSubmission(submissions.latest)
      }
    </div>
  );
};

export default SubmissionSection;