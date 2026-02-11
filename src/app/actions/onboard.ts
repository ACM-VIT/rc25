"use server";
import { auth } from "../(auth)/auth";
import { revalidatePath } from "next/cache";
import parsePhoneNumber from "libphonenumber-js";
import { db } from "@/db";
import { type Gender, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function onboard(formData: FormData) {
    const session = await auth();

    if (!session || !session.user) {
        return;
    }

    // ✅ Ensure `gender` is always a valid string
    const gender = (formData.get("gender")?.toString() || "").toLowerCase();
    if (!["male", "female"].includes(gender)) {
        console.error("Invalid gender value:", gender);
        return;
    }

    const phoneNumber = parsePhoneNumber(formData.get('phone')?.toString() as string, 'IN');

    const rawData = {
        phone: phoneNumber?.format('INTERNATIONAL') ?? '',
        gender: gender as Gender,
    };

    try {
        await db
            .update(users)
            .set(rawData)
            .where(eq(users.email, session.user.email ?? ''));
        revalidatePath("/");
    } catch (error) {
        console.error("Database update failed:", error);
    }
}
