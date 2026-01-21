"use server";

import {revalidatePath} from "next/cache";
import { db } from "@/db";
import { uniRegs, users } from "@/db/schema";
import { like } from "drizzle-orm";

export default async function Override(regNo: string, teamId: string) {
    const userRows = await db
        .select()
        .from(users)
        .where(like(users.name, `%${regNo}`))
        .limit(1);
    const user = userRows[0];

    if (!user) {
        return null;
    }

    await db.insert(uniRegs).values({
        regNo,
        name: user.name?.slice(0, -10) ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        injected: true,
    });

    revalidatePath(`/check-in/${teamId}`);
    return
}
