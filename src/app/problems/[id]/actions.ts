'use server'
import { db } from "@/db";
import { problems, submissions, users } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export async function getTeamId(userId: string) {
    const userRows = await db
      .select({ teamId: users.teamId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return userRows[0]?.teamId
}

export async function getTeamSubmissions(userId: string, problemId: string) {
  // Get user's team
  const userRows = await db
    .select({ teamId: users.teamId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const user = userRows[0];

  if (!user?.teamId) return [];

  // Get all team members
  const teamMembers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.teamId, user.teamId));

  const userIds = teamMembers.map(member => member.id);

  // Get all submissions
  // Get latest and best submissions
  // const latest = submissions[0] || null;
  // const best = submissions.reduce((best, current) => {
  //   const currentPassed = current.testcasespassed.filter(Boolean).length;
  //   const bestPassed = best ? best.testcasespassed.filter(Boolean).length : -1;
  //   return currentPassed > bestPassed ? current : best;
  // }, submissions[0] || null);

  const submissionRows = await db
    .select({ submission: submissions, user: users })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .where(
      and(inArray(submissions.userId, userIds), eq(submissions.problemId, problemId))
    )
    .orderBy(desc(submissions.createdAt));

  const problemRows = await db
    .select({ normalCases: problems.normal_cases, edgeCases: problems.edge_cases })
    .from(problems)
    .where(eq(problems.id, problemId))
    .limit(1);
  const normalCases = problemRows[0]?.normalCases ?? 0;
  const edgeCases = problemRows[0]?.edgeCases ?? 0;
  const totalTestcases = normalCases + edgeCases;

  return submissionRows.map((row) => ({
    ...row.submission,
    totalTestcases,
    evaluationStatus: null,
    user: row.user,
  }));
}
