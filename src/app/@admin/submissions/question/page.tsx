import { db } from "@/db";
import { problems, submissions, teams, users } from "@/db/schema";
import QuestionSubmissionClient from "../QuestionSubmissionClient";
import type { GroupedQuestionSubmissions, SubmissionType } from "../types";
import { desc, eq } from "drizzle-orm";

async function getSubmissionsByQuestion(): Promise<GroupedQuestionSubmissions> {
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

    return submissionRows.reduce<GroupedQuestionSubmissions>((acc, row) => {
      const problemTitle = row.problemTitle;
      if (!acc[problemTitle]) {
        acc[problemTitle] = [];
      }
      acc[problemTitle].push({
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
      } as SubmissionType);
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching question submissions:", error);
    return {};
  }
}

export default async function QuestionPage() {
  const submissionsByQuestion = await getSubmissionsByQuestion();
  return <QuestionSubmissionClient initialSubmissions={submissionsByQuestion} />;
}
