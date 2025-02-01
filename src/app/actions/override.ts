"use server";

import { PrismaClient } from '@prisma/client';
import {revalidatePath} from "next/cache";

export default async function Override(regNo: string, teamId: string) {
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({
        where: {
            name: {
                endsWith: regNo
            }
        }
    });

    if (!user) {
        await prisma.$disconnect();
        return null;
    }

    await prisma.uniReg.create({
        data: {
            regNo,
            name: user.name?.slice(0, -10) ?? '',
            email: user.email ?? '',
            phone: user.phone ?? '',
            injected: true,
        }
    })

    await prisma.$disconnect();

    revalidatePath(`/check-in/${teamId}`);
    return
}