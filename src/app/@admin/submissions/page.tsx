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
    return submissions;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Page() {
  const submissions = await getSubmissions();
  return <SubmissionClient initialSubmissions={submissions} />;
}
