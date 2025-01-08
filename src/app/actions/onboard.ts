"use server";


import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import parsePhoneNumber from "libphonenumber-js";

export default async function onboard(formData: FormData) {
    const prisma = new PrismaClient();




    const rawData = {
        phone: parsePhoneNumber(formData.get('phone')?.toString() as string, 'IN')!.format('INTERNATIONAL'),
        gender: formData.get("gender") as "male" | "female",
    };




}