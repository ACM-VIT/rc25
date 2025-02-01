'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Submission {
  id: string;
  code: string;
  score: number;
  createdAt: string;
  problem: {
    title: string;
  };
  user: {
    Team: {
      name: string;
      shortCode: string;
    } | null;
  };
}

interface GroupedSubmissions {
  [key: string]: Submission[];
}

// interface SubmissionClientProps {
//   initialSubmissions: GroupedSubmissions;
//   viewType: 'team' | 'question';
// }

export default function SubmissionClient({ 
  initialSubmissions,
  // _viewType // Prefixed with underscore to indicate intentionally unused
}: {
  initialSubmissions: GroupedSubmissions;
  // viewType: 'team' | 'question';
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeam = (teamName: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamName)) {
      newExpanded.delete(teamName);
    } else {
      newExpanded.add(teamName);
    }
    setExpandedTeams(newExpanded);
  };

  const filteredSubmissions = Object.entries(initialSubmissions).reduce((acc, [teamName, submissions]) => {
    const filtered = submissions.filter(sub => 
      sub.problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[teamName] = filtered;
    }
    return acc;
  }, {} as GroupedSubmissions);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by question name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {Object.entries(filteredSubmissions).map(([teamName, submissions]) => (
          <div key={teamName} className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleTeam(teamName)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{teamName}</span>
                <span className="text-sm text-gray-500">
                  ({submissions.length} submissions)
                </span>
              </div>
              {expandedTeams.has(teamName) ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>

            {expandedTeams.has(teamName) && (
              <div className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Problem</th>
                      <th className="px-4 py-2 text-left">Score</th>
                      <th className="px-4 py-2 text-left">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="px-4 py-2">{submission.problem.title}</td>
                        <td className="px-4 py-2">{submission.score}</td>
                        <td className="px-4 py-2">
                          {new Date(submission.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}