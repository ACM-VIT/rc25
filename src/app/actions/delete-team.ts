'use server'

import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DeleteTeam(teamId: string): Promise<boolean> {
  try {
    await db.delete(teams).where(eq(teams.id, teamId));
    return true;
  } catch (error) {
    console.error('Failed to delete team:', error);
    return false;
  }
}
