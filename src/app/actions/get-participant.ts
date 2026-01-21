"use server";
import { db } from "@/db";
import { teams, uniRegs, users } from "@/db/schema";
import { eq, like } from "drizzle-orm";

export default async function GetParicipant(regNo: string) {
    const userPromise = db
        .select({ user: users, team: teams })
        .from(users)
        .leftJoin(teams, eq(users.teamId, teams.id))
        .where(like(users.name, `%${regNo}`))
        .limit(1);

    const uniRegPromise = db
        .select()
        .from(uniRegs)
        .where(eq(uniRegs.regNo, regNo))
        .limit(1);

    const [userRows, uniRegRows] = await Promise.all([userPromise, uniRegPromise]);

    const userRow = userRows[0];
    const user = userRow
        ? { ...userRow.user, Team: userRow.team ?? null }
        : null;
    const uniReg = uniRegRows[0] ?? null;

    return {
        user,
        uniReg
    };
}
