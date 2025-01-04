import React from 'react';
import Link from 'next/link';

type Problem = {
  id: string;
  title: string;
  roundNumber: number;
};

interface QuestionClientProps {
  questions: Problem[];
}

export default function QuestionClient({ questions }: QuestionClientProps) {
  return (
    <div className="grid gap-4">
      {questions.map((problem) => (
        <Link 
          key={problem.id} 
          href={`/${problem.id}`}
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold">{problem.title}</h2>
          <p className="text-sm text-gray-600">Round {problem.roundNumber}</p>
        </Link>
      ))}
    </div>
  );
}