import { db } from "@/db";
import { problems, submissions, teams, users } from "@/db/schema";
import TeamSubmissionClient from "../TeamSubmissionClient";
import type { GroupedTeamSubmissions } from "../types";
import { desc, eq } from "drizzle-orm";

async function getSubmissionsByTeam(): Promise<GroupedTeamSubmissions> {
  try {
    const submissionRows = await db
      .select({
        id: submissions.id,
        code: submissions.code,
        score: submissions.score,
        createdAt: submissions.createdAt,
        testcasespassed: submissions.testcasespassed,
        problemTitle: problems.title,
        teamName: teams.name,
        teamShortCode: teams.shortCode,
      })
      .from(submissions)
      .innerJoin(problems, eq(submissions.problemId, problems.id))
      .innerJoin(users, eq(submissions.userId, users.id))
      .leftJoin(teams, eq(users.teamId, teams.id))
      .orderBy(desc(submissions.createdAt));

    return submissionRows.reduce<GroupedTeamSubmissions>((acc, row) => {
      const teamName = row.teamName || "No Team";
      if (!acc[teamName]) {
        acc[teamName] = [];
      }
      acc[teamName].push({
        id: row.id,
        code: row.code,
        score: row.score,
        createdAt: row.createdAt,
        testcasespassed: row.testcasespassed,
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
