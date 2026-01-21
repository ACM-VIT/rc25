"use server";

import { auth } from "@/app/(auth)/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function leaveTeam() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("User not authenticated.");
    }

    // Fetch the user and their team details
    const userRows = await db
      .select({ id: users.id, teamId: users.teamId })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);
    const user = userRows[0];

    if (!user?.teamId) {
      throw new Error("You are not part of any team.");
    }

    const memberCountRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.teamId, user.teamId));
    const memberCount = Number(memberCountRows[0]?.count ?? 0);

    // Remove the user from the team by setting teamId to null
    await db
      .update(users)
      .set({ teamId: null })
      .where(eq(users.email, session.user.email));

    revalidatePath("/" , "layout");

    // Check if the user is the only member in the team
    if (memberCount === 1) {
      // Delete the team since the user is the only member
      await db.delete(teams).where(eq(teams.id, user.teamId));
      return { success: true, message: "You were the only member. The team has been deleted." };
    }

    return { success: true, message: "You have successfully left the team." };
  } catch (error) {
    console.error("Error leaving team:", error);
    return { success: false, message: "Failed to leave team." };
  }
}
