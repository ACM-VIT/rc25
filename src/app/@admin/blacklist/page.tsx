import { prisma } from "@/utils/prisma";
import BlacklistClient from "./BlacklistClient";

export default async function TeamBlacklistPage() {
  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {} // At least one member
      }
    },
    include: {
      members: true
    }
  });

  return <BlacklistClient initialTeams={teams} />;
}