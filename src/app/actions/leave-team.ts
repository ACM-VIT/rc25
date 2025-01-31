"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/(auth)/auth";
import { revalidatePath } from "next/cache";
import Layout from "../@admin/layout";

export async function leaveTeam() {
  const prisma = new PrismaClient();

  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("User not authenticated.");
    }

    // Fetch the user and their team details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        Team: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!user?.teamId) {
      throw new Error("You are not part of any team.");
    }

    const team = user.Team;

    // Check if the user is the only member in the team
    if (team?.members?.length === 1) {
      // Delete the team since the user is the only member
      await prisma.team.delete({
        where: { id: user.teamId },
      });
      return { success: true, message: "You were the only member. The team has been deleted." };
    }

    // Remove the user from the team by setting teamId to null
    await prisma.user.update({
      where: { email: session.user.email },
      data: { teamId: null },
    });

    revalidatePath("/" , "layout");
    return { success: true, message: "You have successfully left the team." };
  } catch (error) {
    console.error("Error leaving team:", error);
    return { success: false, message: "Failed to leave team." };
  } finally {
    await prisma.$disconnect();
  }
}
