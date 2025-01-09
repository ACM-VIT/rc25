"use server";
import { auth } from "../(auth)/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import parsePhoneNumber from "libphonenumber-js";

export default async function onboard(formData: FormData) {
    const prisma = new PrismaClient();
    const session = await auth();

    if (!session || !session.user) {
        return;
    }

    const rawData = {
        phone: parsePhoneNumber(formData.get('phone')?.toString() as string, 'IN')!.format('INTERNATIONAL'),
        gender: formData.get("gender") as "male" | "female",
    };

    const updatedUser = await prisma.user.update({
        where: {
            email: session.user.email!,
        },
        data: {
            ...rawData,
        },
    });
    revalidatePath("/");
    return updatedUser;
}