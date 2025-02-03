"use server";

import {PrismaClient} from '@prisma/client';
import {redirect} from "next/navigation";

export default async function GetTeam(regNo: string) {
    const prisma = new PrismaClient();

    const team = await prisma.team.findFirst({
        relationLoadStrategy: 'join',
        where: {
            members: {
                some: {
                    name: {
                        endsWith: regNo
                    }
                }
            }
        }
    });

    await prisma.$disconnect();
    if (!team) {
        return false;
    }

    return redirect(`/check-in/${team.id}`);
}