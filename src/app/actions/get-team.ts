"use server";

import {redirect} from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { like } from "drizzle-orm";

export default async function GetTeam(regNo: string) {
    const userRows = await db
        .select({ teamId: users.teamId })
        .from(users)
        .where(like(users.name, `%${regNo}`))
        .limit(1);
    const teamId = userRows[0]?.teamId;
    if (!teamId) {
        return false;
    }

    return redirect(`/check-in/${teamId}`);
}
