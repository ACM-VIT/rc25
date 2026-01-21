import { db } from "@/db";
import { rounds, teamRounds, teams } from "@/db/schema";
import TeamsClient from "./TeamsClient";
import { asc, desc, eq } from "drizzle-orm";

async function getTeams() {
    try {
        const teamRows = await db.select().from(teams).orderBy(asc(teams.name));

        const teamRoundRows = await db
            .select({
                id: teamRounds.id,
                teamId: teamRounds.teamId,
                roundId: teamRounds.roundId,
                round: {
                    id: rounds.id,
                    number: rounds.number,
                    start: rounds.start,
                },
            })
            .from(teamRounds)
            .innerJoin(rounds, eq(teamRounds.roundId, rounds.id))
            .orderBy(desc(rounds.start));

        const latestRoundByTeam = new Map<string, typeof teamRoundRows[0]>();
        for (const row of teamRoundRows) {
            if (!latestRoundByTeam.has(row.teamId)) {
                latestRoundByTeam.set(row.teamId, row);
            }
        }

        return teamRows.map((team) => {
            const latest = latestRoundByTeam.get(team.id);
            return {
                id: team.id,
                name: team.name,
                points: team.score,
                teamRound: latest
                    ? {
                          id: latest.id,
                          teamId: latest.teamId,
                          roundId: latest.roundId,
                          round: {
                              id: latest.round.id,
                              number: latest.round.number,
                              start: latest.round.start.toISOString(),
                          },
                      }
                    : undefined,
            };
        });
    } catch (error) {
        console.error("Error fetching teams for promotion:", error);
        return [];
    }
}

async function getRounds() {
    const roundRows = await db
        .select({ id: rounds.id, start: rounds.start, number: rounds.number })
        .from(rounds)
        .orderBy(asc(rounds.start));
    return roundRows.map((round) => ({
        id: round.id,
        start: round.start.toISOString(),
        number: round.number,
    }));
}

export default async function Page() {
    const [teams, rounds] = await Promise.all([getTeams(), getRounds()]);

    const teamsWithPoints = teams.filter((team) => team.points >= 0);
    return <TeamsClient teams={teamsWithPoints} rounds={rounds} />;
}
