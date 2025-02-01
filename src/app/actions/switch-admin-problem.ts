"use server"

import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";

export default async function SwitchAdminProblemMode(mode: "user" | "admin", problemId: string) {
    const cookieStore = await cookies()
    cookieStore.set('mode', mode)
    revalidatePath(`/problems/${problemId}`, "layout")
}   