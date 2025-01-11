"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type CheckInResponse = {
    success: boolean;
    message: string;
};

export default async function CheckInTeam(teamId: string): Promise<CheckInResponse> {
    try {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true },
        });

        if (!team) {
            throw new Error("Team not found");
        }
        if (team.members.length < Number.parseInt(process.env.MIN_TEAM_CAPACITY || "2")) {
            return {
                success: false,
                message: "Insufficient team members"
            };
        }

        await prisma.team.update({
            where: { id: teamId },
            data: { checkedIn: true }
        });

        try {
            await prisma.teamRound.create({
                data: {
                    team: { connect: { id: teamId } },
                    round: { connect: { number: 1 } },
                },
            });
        } catch (roundError) {
            // Revert team check-in if round creation fails
            await prisma.team.update({
                where: { id: teamId },
                data: { checkedIn: false }
            });
            throw roundError;
        }

        revalidatePath(`/check-in/user/${teamId}`, 'page');
        
        return {
            success: true,
            message: "Team checked in successfully"
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("Check-in error:", errorMessage);
        
        return {
            success: false,
            message: errorMessage
        };
    }
}