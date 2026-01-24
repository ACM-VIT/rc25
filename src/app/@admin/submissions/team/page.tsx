import { db } from "@/db";
import { problems, solve, submissions, teams, users } from "@/db/schema";
import TeamSubmissionClient from "../TeamSubmissionClient";
import type { GroupedTeamSubmissions } from "../types";
import { calculateCurrentPoints, calculateSolveContribution } from "@/db/scoring";
import { desc, eq, inArray } from "drizzle-orm";

async function getSubmissionsByTeam(): Promise<GroupedTeamSubmissions> {
  try {
    const submissionRows = await db
      .select({
        id: submissions.id,
        code: submissions.code,
        createdAt: submissions.createdAt,
        testcasesPassed: submissions.testcasesPassed,
        problemTitle: problems.title,
        problemId: problems.id,
        initial: problems.initial,
        minimum: problems.minimum,
        decay: problems.decay,
        normalCases: problems.normal_cases,
        edgeCases: problems.edge_cases,
        teamName: teams.name,
        teamShortCode: teams.shortCode,
      })
      .from(submissions)
      .innerJoin(problems, eq(submissions.problemId, problems.id))
      .innerJoin(users, eq(submissions.userId, users.id))
      .leftJoin(teams, eq(users.teamId, teams.id))
      .orderBy(desc(submissions.createdAt));

    const problemIds = [
      ...new Set(submissionRows.map((row) => row.problemId)),
    ];
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
    for (const row of submissionRows) {
      if (currentPointsByProblem.has(row.problemId)) continue;
      const effectiveSolves = effectiveSolvesByProblem.get(row.problemId) ?? 0;
      currentPointsByProblem.set(
        row.problemId,
        calculateCurrentPoints({
          initial: row.initial,
          minimum: row.minimum,
          decay: row.decay,
          effectiveSolves,
        })
      );
    }

    return submissionRows.reduce<GroupedTeamSubmissions>((acc, row) => {
      const teamName = row.teamName || "No Team";
      if (!acc[teamName]) {
        acc[teamName] = [];
      }
      const currentPoints = currentPointsByProblem.get(row.problemId) ?? 0;
      const score = Math.round(
        currentPoints * (row.testcasesPassed / 10)
      );
      acc[teamName].push({
        id: row.id,
        code: row.code,
        score,
        createdAt: row.createdAt,
        testcasesPassed: row.testcasesPassed,
        totalTestcases: (row.normalCases ?? 0) + (row.edgeCases ?? 0),
        problem: { title: row.problemTitle },
        user: {
          Team: row.teamName
            ? { name: row.teamName, shortCode: row.teamShortCode ?? "" }
            : null,
        },
      });
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching team submissions:", error);
    return {};
  }
}

export default async function TeamPage() {
  const submissionsByTeam = await getSubmissionsByTeam();
  return <TeamSubmissionClient initialSubmissions={submissionsByTeam} />;
}
