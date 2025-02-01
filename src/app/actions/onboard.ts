"use server";
import { auth } from "../(auth)/auth";
import { PrismaClient } from "@prisma/client"; // ✅ Import Prisma Enum
import { revalidatePath } from "next/cache";
import parsePhoneNumber from "libphonenumber-js";

export default async function onboard(formData: FormData) {
    const prisma = new PrismaClient();
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
        gender: { set: gender as "male" | "female" },  // ✅ Use Prisma update object
    };

    try {
        await prisma.user.update({
            where: {
                email: session.user.email ?? '',
            },
            data: rawData,  // ✅ Prisma now correctly accepts `gender`
        });
        revalidatePath("/");
    } catch (error) {
        console.error("Database update failed:", error);
    }
}
