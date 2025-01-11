import { prisma } from "@/utils/prisma";
import SubmissionClient from "./SubmissionClient";

async function getSubmissions() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        problem: {
          select: {
            title: true
          }
        }
      }
    });
    return submissions.map(submission => ({
      ...submission,
      score: submission.score ?? 0 // Ensure score is always a number
    }));
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Page() {
  const submissions = await getSubmissions();
  return <SubmissionClient initialSubmissions={submissions} />;
}