"use server";
import { PrismaClient } from '@prisma/client';

export default async function GetParicipant(regNo: string) {
    const prisma = new PrismaClient();
    const promises = [prisma.user.findFirst({
        where: {
            name: {
                endsWith: regNo
            }
        },
        include: {
            Team: true
        }
    }), prisma.uniReg.findFirst({
        where: {
            regNo
        }
    })];

    const [user, uniReg] = await Promise.all(promises);

    await prisma.$disconnect();

    return {
        user,
        uniReg
    };
}