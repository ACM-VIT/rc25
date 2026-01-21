"use server";
import { auth } from "../(auth)/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { teams, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function teamAction(inputValue: string, createMode: boolean) {
    const session = await auth();

    if (!session || !session.user) {
        return { error: { code: 10 } };
    }

    if (createMode) {
        const existingTeamRows = await db
            .select({ id: teams.id })
            .from(teams)
            .where(eq(teams.name, inputValue))
            .limit(1);
        if (existingTeamRows.length > 0) {
            return { error: { code: 2 } };
        }
        for (let i = 0; i < 5; i++) {
            try {
                const shortCode = Math.random().toString(36).substring(7).toUpperCase();
                await db.transaction(async (tx) => {
                    const createdTeams = await tx
                        .insert(teams)
                        .values({ name: inputValue, shortCode })
                        .returning();
                    const created = createdTeams[0];
                    if (!created) {
                        throw new Error("Failed to create team");
                    }
                    await tx
                        .update(users)
                        .set({ teamId: created.id })
                        .where(eq(users.email, session.user.email ?? ""));
                });
                revalidatePath("/");
                return { randomCode: shortCode };
            } catch (e) {
                const error = e as { code?: string };
                if (error?.code !== "23505") {
                    return { error: { code: 10 } };
                }
            }
        }
    } else {
        const teamRows = await db
            .select()
            .from(teams)
            .where(eq(teams.shortCode, inputValue))
            .limit(1);
        const team = teamRows[0];
        if (!team) {
            return { error: { code: 1 } };
        }
        if(team.checkedIn){
            return { error: { code: 11 } };
        }
        const members = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.teamId, team.id));
        if (members.length >= Number.parseInt(process.env.TEAM_CAPACITY || "4")) {
            return { error: { code: 4 } };
        }
        await db
            .update(users)
            .set({ teamId: team.id })
            .where(eq(users.email, session.user.email ?? ""));
        revalidatePath("/");
    }
}
