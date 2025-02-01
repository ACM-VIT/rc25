'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { GroupedTeamSubmissions } from './types';

export default function TeamSubmissionClient({ 
  initialSubmissions 
}: { 
  initialSubmissions: GroupedTeamSubmissions 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const filteredSubmissions = Object.entries(initialSubmissions).reduce((acc, [team, subs]) => {
    const filtered = subs.filter(sub => 
      sub.problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) acc[team] = filtered;
    return acc;
  }, {} as GroupedTeamSubmissions);

  return (
    <div className="space-y-6">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search problems..."
          className="pl-10 p-2 border rounded w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {Object.entries(filteredSubmissions).map(([teamName, submissions]) => (
        <div key={teamName} className="border rounded shadow">
          <button
            type="button"
            onClick={() => {
              const newExpanded = new Set(expandedTeams);
              if (expandedTeams.has(teamName)) {
                newExpanded.delete(teamName);
              } else {
                newExpanded.add(teamName);
              }
              setExpandedTeams(newExpanded);
            }}
            className="w-full flex justify-between items-center p-4 bg-gray-50"
          >
            <div>
              <span className="font-bold">{teamName}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({submissions[0]?.user.Team?.shortCode})
              </span>
            </div>
            {expandedTeams.has(teamName) ? 
              <ChevronUpIcon className="h-5 w-5" /> : 
              <ChevronDownIcon className="h-5 w-5" />
            }
          </button>

          {expandedTeams.has(teamName) && (
            <div className="p-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Problem</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="border-b">
                      <td className="p-2">{sub.problem.title}</td>
                      <td className="p-2">{sub.score}</td>
                      <td className="p-2">{new Date(sub.createdAt).toLocaleString()}</td>
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