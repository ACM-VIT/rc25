"use server";

import {revalidatePath} from "next/cache";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function RemoveFromTeam(userId: string, teamId: string){
    await db
        .update(users)
        .set({ teamId: null })
        .where(eq(users.id, userId));

    const memberCountRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.teamId, teamId));
    const memberCount = Number(memberCountRows[0]?.count ?? 0);

    if (memberCount === 0) {
        await db.delete(teams).where(eq(teams.id, teamId));
    }

    // revalidatePath("/");
    revalidatePath(`/check-in/${teamId}`);
    return true;
}
