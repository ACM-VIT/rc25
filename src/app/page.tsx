import type React from 'react';
import SignOutButton from '@/components/buttons/sign-out';
import { prisma } from '@/utils/prisma';
import QuestionClient from './QuestionClient';

async function getProblems() {
  try {
    return await prisma.problem.findMany({
      orderBy: {
        title: 'asc',
      },
      where: {
        roundNumber: 1,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Page() {
  const problems = await getProblems();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">PORTAL</h1>
        <SignOutButton/>
      </div>
      <QuestionClient questions={problems} />
    </div>
  );
}