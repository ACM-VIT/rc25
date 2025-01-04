"use server";
import { auth } from "../(auth)/auth";
import { PrismaClient, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function teamAction(inputValue: string, createMode: boolean) {
    const prisma = new PrismaClient();
    const session = await auth();

    if (!session || !session.user) {
        return { error: { code: 10 } };
    }

    if (createMode) {
        if (await prisma.team.findUnique({ where: { name: inputValue } })) {
            return { error: { code: 2 } };
        }
        for (let i = 0; i < 5; i++) {
            try {
                const shortCode = Math.random().toString(36).substring(7).toUpperCase();
                await prisma.team.create({
                    data: {
                        name: inputValue,
                        shortCode,
                        members: {
                            connect: { email: session.user.email! },
                        },
                    },
                });
                revalidatePath("/");
                return { randomCode: shortCode };
            } catch (e) {
                if (
                    !(e instanceof Prisma.PrismaClientKnownRequestError) ||
                    e.code !== "P2002"
                ) {
                    return { error: { code: 10 } };
                }
            }
        }
    } else {
        const team = await prisma.team.findUnique({
            where: { shortCode: inputValue },
            include: { members: true },
        });
        if (!team) {
            return { error: { code: 1 } };
        }
        if (team.members.length >= parseInt(process.env.TEAM_CAPACITY || "4")) {
            return { error: { code: 4 } };
        }
        await prisma.user.update({
            where: { email: session.user.email! },
            data: { teamId: team.id },
        });
        revalidatePath("/");
    }
}
