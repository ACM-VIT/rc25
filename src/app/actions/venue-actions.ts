"use server";

import { prisma } from "@/utils/prisma";
import { VenueTeam } from "../@admin/venue/page";
import { Venue } from "@prisma/client";

export async function assignTeams(teams: VenueTeam[], venue: Venue) {
    try {
        const assignedTeams = await Promise.all(
            teams.map(async (team) => {
                try {
                    return await prisma.team.update({
                        where: { id: team.id },
                        data: { venue }
                    });
                } catch (error) {
                    console.error(`Failed to assign team ${team.id} to venue ${venue}:`, error);
                    return null; // Prevents Promise.all from failing entirely
                }
            })
        );

        return assignedTeams.filter(team => team !== null);
    } catch (error) {
        console.error("Error while assigning teams:", error);
        return []; 
    }
}

// Assign a single team to a venue with error handling
export async function assignTeam(team: VenueTeam, venue: Venue) {
    try {
        const assignedTeam = await prisma.team.update({
            where: { id: team.id },
            data: { venue }
        });

        return assignedTeam;
    } catch (error) {
        console.error(`Failed to assign team ${team.id} to venue ${venue}:`, error);
        return null; // Return null instead of throwing an error
    }
}

export default async function getTeamVenueData(): Promise<VenueTeam[]> {
    const teams = await prisma.team.findMany({
        include: {
            members: true, // Fetching members to count them
        },
    });
    
    // Type-safe formatted teams array
    const formattedTeams: VenueTeam[] = teams.map(team => ({
        ...team,
        memberCount: team.members.length, // Adding member count
    }));
    
    return formattedTeams;
}

export async function unassignTeams(teams: VenueTeam[]) {
    try {
        const unassignedTeams = await Promise.all(
            teams.map(async (team) => {
                try {
                    return await prisma.team.update({
                        where: { id: team.id },
                        data: { venue: null }
                    });
                } catch (error) {
                    console.error(`Failed to unassign team ${team.id}:`, error);
                    return null;
                }
            })
        );

        return unassignedTeams.filter(team => team !== null);
    } catch (error) {
        console.error("Error while unassigning teams:", error);
        return [];
    }
}

export async function unassignTeam(team: VenueTeam) {
    try {
        const unassignedTeam = await prisma.team.update({
            where: { id: team.id },
            data: { venue: null }
        });

        return unassignedTeam;
    } catch (error) {
        console.error(`Failed to unassign team ${team.id}:`, error);
        return null;
    }
}
