"use server"

import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";

export default async function SwitchAdminMode(mode: "user" | "admin") {
    const cookieStore = await cookies()
    cookieStore.set('mode', mode)
    revalidatePath('/', "layout")
}