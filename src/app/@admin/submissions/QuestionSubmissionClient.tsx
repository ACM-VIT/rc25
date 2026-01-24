'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { GroupedQuestionSubmissions } from './types';

export default function QuestionSubmissionClient({ 
  initialSubmissions 
}: { 
  initialSubmissions: GroupedQuestionSubmissions 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const filteredSubmissions = Object.entries(initialSubmissions).reduce((acc, [problem, subs]) => {
    const filtered = subs.filter(sub => 
      sub.user.Team?.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) acc[problem] = filtered;
    return acc;
  }, {} as GroupedQuestionSubmissions);

  return (
    <div className="space-y-6">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search teams..."
          className="pl-10 p-2 border rounded w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {Object.entries(filteredSubmissions).map(([problemTitle, submissions]) => (
        <div key={problemTitle} className="border rounded shadow">
          <button
            type="button"
            onClick={() => {
              const newExpanded = new Set(expandedQuestions);
              if (expandedQuestions.has(problemTitle)) {
                newExpanded.delete(problemTitle);
              } else {
                newExpanded.add(problemTitle);
              }
              setExpandedQuestions(newExpanded);
            }}
            className="w-full flex justify-between items-center p-4 bg-gray-50"
          >
            <div>
              <span className="font-bold">{problemTitle}</span>
            </div>
            {expandedQuestions.has(problemTitle) ? 
              <ChevronUpIcon className="h-5 w-5" /> : 
              <ChevronDownIcon className="h-5 w-5" />
            }
          </button>

          {expandedQuestions.has(problemTitle) && (
            <div className="p-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Team</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">Test Cases</th>
                    <th className="text-left p-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="border-b">
                      <td className="p-2">{sub.user.Team?.shortCode || 'No Team'}</td>
                      <td className="p-2">{sub.score}</td>
                      <td className="p-2">{sub.testcasesPassed}/{sub.totalTestcases}</td>
                      <td className="p-2">{sub.createdAt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
