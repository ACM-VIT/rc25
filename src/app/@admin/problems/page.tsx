import ProblemsClient from "./ProblemsClient";
import { db } from "@/db";
import { problems, rounds, testcases } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";

async function getProblems() {
  try {
    const problemRows = await db
      .select({ problem: problems, roundNumber: rounds.number })
      .from(problems)
      .innerJoin(rounds, eq(problems.roundId, rounds.id))
      .orderBy(asc(problems.roundId));

    const problemIds = problemRows.map((row) => row.problem.id);
    const testcaseRows = problemIds.length
      ? await db
          .select()
          .from(testcases)
          .where(inArray(testcases.problemId, problemIds))
      : [];

    const testcasesByProblem = new Map<string, typeof testcaseRows>();
    for (const testcase of testcaseRows) {
      const list = testcasesByProblem.get(testcase.problemId) ?? [];
      list.push(testcase);
      testcasesByProblem.set(testcase.problemId, list);
    }

    return problemRows.map((row) => ({
      ...row.problem,
      Testcase: testcasesByProblem.get(row.problem.id) ?? [],
      roundNumber: row.roundNumber,
    }));
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}

async function getRounds() {
  try {
    return await db.select().from(rounds).orderBy(asc(rounds.number));
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return [];
  }
}

export default async function Page() {
  const [problems, rounds] = await Promise.all([getProblems(), getRounds()]);
  return <ProblemsClient problems={problems} rounds={rounds} />;
}
