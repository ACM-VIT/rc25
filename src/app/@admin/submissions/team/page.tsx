import { prisma } from "@/utils/prisma";
import TeamSubmissionClient from "../TeamSubmissionClient";
import type { GroupedTeamSubmissions } from "../types";

async function getSubmissionsByTeam(): Promise<GroupedTeamSubmissions> {
  try {
    const submissions = await prisma.submission.findMany({
      select: {
        id: true,
        code: true,
        score: true,
        createdAt: true,
        problem: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            Team: {
              select: {
                name: true,
                shortCode: true
              }
            }
          }
        },
        testcasespassed: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return submissions.reduce<GroupedTeamSubmissions>((acc, submission) => {
      const teamName = submission.user.Team?.name || 'No Team';
      if (!acc[teamName]) {
        acc[teamName] = [];
      }
      acc[teamName].push(submission);
      return acc;
    }, {});
  } finally {
    await prisma.$disconnect();
  }
}

export default async function TeamPage() {
  const submissionsByTeam = await getSubmissionsByTeam();
  return <TeamSubmissionClient initialSubmissions={submissionsByTeam} />;
}