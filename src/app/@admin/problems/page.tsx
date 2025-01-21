import ProblemsClient from "./ProblemsClient";
import { prisma } from "@/utils/prisma";

async function getProblems() {
  try {
    return await prisma.problem.findMany({
      orderBy: { roundId: "asc" },
      include: {
        round: {
          select: {
            number: true
          }
        },
        Testcase: true
      }
    }).then(problems => problems.map(problem => ({
      ...problem,
      roundNumber: problem.round.number
    })));
  } finally {
    await prisma.$disconnect();
  }
}

async function getRounds() {
  try {
    return await prisma.round.findMany({
      orderBy: { number: "asc" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Page() {
  const [problems, rounds] = await Promise.all([getProblems(), getRounds()]);
  return <ProblemsClient problems={problems} rounds={rounds} />;
}
