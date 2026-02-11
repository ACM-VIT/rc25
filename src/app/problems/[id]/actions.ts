'use server'
import { db } from "@/db";
import { problems, submissions, submissionTestcases, users } from "@/db/schema";
import type { EvalEnum } from "@/db/schema";
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

  // Derive evaluation status for each evaluated submission
  const results = await Promise.all(
    submissionRows.map(async (row) => {
      let evaluationStatus: EvalEnum | null = null;

      if (row.submission.evaluated) {
        const testcaseRows = await db
          .select({ evaluationStatus: submissionTestcases.evaluationStatus })
          .from(submissionTestcases)
          .where(eq(submissionTestcases.submissionId, row.submission.id));

        const statuses = testcaseRows.map((r) => r.evaluationStatus).filter(Boolean);
        if (statuses.some((s) => s === "COMPILATION_ERROR")) {
          evaluationStatus = "COMPILATION_ERROR";
        } else if (statuses.some((s) => s?.startsWith("RUNTIME_ERROR"))) {
          evaluationStatus = (statuses.find((s) => s?.startsWith("RUNTIME_ERROR")) as EvalEnum) ?? "RUNTIME_ERROR";
        } else if (row.submission.testcasesPassed === totalTestcases) {
          evaluationStatus = "ACCEPTED";
        } else {
          evaluationStatus = "WRONG_ANSWER";
        }
      }

      return {
        ...row.submission,
        totalTestcases,
        evaluationStatus,
        user: row.user,
      };
    })
  );

  return results;
}