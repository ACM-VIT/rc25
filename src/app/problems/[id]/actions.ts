'use server'
import { PrismaClient } from "@prisma/client";

export async function getTeamId(userId: string) {
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { teamId: true }
  })
  return user?.teamId
}

export async function getTeamSubmissions(userId: string, problemId: string) {
  // Get user's team
    const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { teamId: true }
  });

  if (!user?.teamId) return { latest: null, best: null };

  // Get all team members
  const teamMembers = await prisma.user.findMany({
    where: { teamId: user.teamId },
    select: { id: true }
  });

  const userIds = teamMembers.map(member => member.id);

  // Get all submissions
  const submissions = await prisma.submission.findMany({
    where: {
      userId: { in: userIds },
      problemId: problemId
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get latest and best submissions
  const latest = submissions[0] || null;
  const best = submissions.reduce((best, current) => {
    const currentPassed = current.testcasespassed.filter(Boolean).length;
    const bestPassed = best ? best.testcasespassed.filter(Boolean).length : -1;
    return currentPassed > bestPassed ? current : best;
  }, submissions[0] || null);

  return { latest, best };
}