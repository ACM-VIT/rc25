"use server";

import { prisma } from "@/utils/prisma";

interface CreateTeamParams {
  name: string;
  shortCode: string;
  registrationNumbers: string[];
}

export async function createTeam({
  name,
  shortCode,
  registrationNumbers,
}: CreateTeamParams) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: registrationNumbers.map((registrationNumber) => ({
          name: {
            endsWith: registrationNumber,
          },
        })),
      },
    });

    const team = await prisma.team.create({
      data: {
        name,
        shortCode,
        members: {
          connect: users.map((user) => ({ id: user.id })),
        },
      },
    });

    return team;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create team: ${errorMessage}`);
  }
}
