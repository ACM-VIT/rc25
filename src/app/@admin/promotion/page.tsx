import { db } from "@/db";
import { problems, rounds, solve, teamRounds, teams } from "@/db/schema";
import TeamsClient from "./TeamsClient";
import { calculateCurrentPoints, calculateSolveContribution } from "@/db/scoring";
import { asc, desc, eq, inArray } from "drizzle-orm";

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

        const problemRows = await db
            .select({
                id: problems.id,
                roundId: problems.roundId,
                initial: problems.initial,
                minimum: problems.minimum,
                decay: problems.decay,
            })
            .from(problems);

        const problemIds = problemRows.map((problem) => problem.id);
        const solveRows = problemIds.length
            ? await db
                  .select({
                      problemId: solve.problemId,
                      teamId: solve.teamId,
                      testcasesPassed: solve.testcasesPassed,
                  })
                  .from(solve)
                  .where(inArray(solve.problemId, problemIds))
            : [];

        const effectiveSolvesByProblem = new Map<string, number>();
        for (const row of solveRows) {
            const contribution = calculateSolveContribution(row.testcasesPassed);
            effectiveSolvesByProblem.set(
                row.problemId,
                (effectiveSolvesByProblem.get(row.problemId) ?? 0) + contribution
            );
        }

        const currentPointsByProblem = new Map<string, number>();
        for (const problem of problemRows) {
            const effectiveSolves = effectiveSolvesByProblem.get(problem.id) ?? 0;
            currentPointsByProblem.set(
                problem.id,
                calculateCurrentPoints({
                    initial: problem.initial,
                    minimum: problem.minimum,
                    decay: problem.decay,
                    effectiveSolves,
                })
            );
        }

        const teamSolvesByTeam = new Map<string, Map<string, number>>();
        for (const row of solveRows) {
            if (!row.teamId) continue;
            const teamMap =
                teamSolvesByTeam.get(row.teamId) ?? new Map<string, number>();
            teamMap.set(row.problemId, row.testcasesPassed);
            teamSolvesByTeam.set(row.teamId, teamMap);
        }

        const problemsByRound = new Map<string, typeof problemRows>();
        for (const problem of problemRows) {
            const list = problemsByRound.get(problem.roundId) ?? [];
            list.push(problem);
            problemsByRound.set(problem.roundId, list);
        }

        const calculateTeamScoreForRound = (teamId: string, roundId: string) => {
            const problemsInRound = problemsByRound.get(roundId) ?? [];
            const teamSolves = teamSolvesByTeam.get(teamId) ?? new Map();
            let totalScore = 0;
            for (const problem of problemsInRound) {
                const currentPoints = currentPointsByProblem.get(problem.id) ?? 0;
                const passed = teamSolves.get(problem.id) ?? 0;
                if (passed > 0) {
                    totalScore += Math.round(currentPoints * (passed / 10));
                }
            }
            return totalScore;
        };

        return teamRows.map((team) => {
            const latest = latestRoundByTeam.get(team.id);
            const points = latest
                ? calculateTeamScoreForRound(team.id, latest.roundId)
                : 0;
            return {
                id: team.id,
                name: team.name,
                points,
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
