"use server";

import {PrismaClient} from "@prisma/client"
import {revalidatePath} from "next/cache";

export default async function RemoveFromTeam(userId: string, teamId: string){
    const prisma = new PrismaClient();

    await prisma.user.update({
        where:{
            id: userId
        },
        data:{
            teamId: null
        }
    })

    const team = await prisma.team.findUnique({
        where:{
            id: teamId
        },
        include:{
            members: true
        }
    })

    if (team?.members.length === 0){
        await prisma.team.delete({
            where:{
                id: teamId
            }
        })
    }

    // revalidatePath("/");
    await prisma.$disconnect();
    revalidatePath(`/check-in/${teamId}`);
    return true;
}