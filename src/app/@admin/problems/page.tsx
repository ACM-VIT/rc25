import { PrismaClient } from "@prisma/client";
import ProblemsClient from "./ProblemsClient";

async function getProblems() {
  const prisma = new PrismaClient();
  try {
    return await prisma.problem.findMany({
      orderBy: { roundNumber: "asc" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function getRounds() {
  const prisma = new PrismaClient();
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