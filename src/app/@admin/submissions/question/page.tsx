import { prisma } from "@/utils/prisma";
import QuestionSubmissionClient from "../QuestionSubmissionClient";
import type { GroupedQuestionSubmissions, SubmissionType } from "../types";

async function getSubmissionsByQuestion(): Promise<GroupedQuestionSubmissions> {
  try {
    const submissions = await prisma.submission.findMany({
      select: {
        id: true,
        code: true,
        score: true,
        createdAt: true,
        testcasespassed: true,
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return submissions.reduce<GroupedQuestionSubmissions>((acc, submission) => {
      const problemTitle = submission.problem.title;
      if (!acc[problemTitle]) {
        acc[problemTitle] = [];
      }
      acc[problemTitle].push(submission as SubmissionType);
      return acc;
    }, {});
  } finally {
    await prisma.$disconnect();
  }
}

export default async function QuestionPage() {
  const submissionsByQuestion = await getSubmissionsByQuestion();
  return <QuestionSubmissionClient initialSubmissions={submissionsByQuestion} />;
}