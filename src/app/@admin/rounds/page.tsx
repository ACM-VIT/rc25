import { prisma } from "@/utils/prisma";
import RoundClient from "./RoundClient";

async function getRounds() {
  try {
    const rounds = await prisma.round.findMany({
      relationLoadStrategy: 'join',
      orderBy: {
        number: "asc",
      },
    });
    return rounds;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function Page() {
  const rounds = await getRounds();
  return <RoundClient initialRounds={rounds} />;
}