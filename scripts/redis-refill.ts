import "dotenv/config";
import { Redis } from "@upstash/redis";
import { db, pool } from "../src/db";
import { calculateEffectiveSolves } from "../src/db/scoring";
import { problems, solve } from "../src/db/schema";

type SolveContributionRow = {
  problemId: string;
  testcasesPassed: number;
};

async function main() {
  const redis = Redis.fromEnv();

  const [problemRows, solveRows] = await Promise.all([
    db.select({ id: problems.id }).from(problems),
    db
      .select({
        problemId: solve.problemId,
        testcasesPassed: solve.testcasesPassed,
      })
      .from(solve),
  ]);

  if (!problemRows.length) {
    console.log("No problems found. Nothing to refill.");
    return;
  }

  const solvesByProblem = new Map<string, SolveContributionRow[]>();

  for (const row of solveRows) {
    const entries = solvesByProblem.get(row.problemId) ?? [];
    entries.push(row);
    solvesByProblem.set(row.problemId, entries);
  }

  const pipeline = redis.pipeline();
  let nonZeroProblemCount = 0;

  for (const problem of problemRows) {
    const effectiveSolves = calculateEffectiveSolves(
      solvesByProblem.get(problem.id) ?? [],
    );

    if (effectiveSolves > 0) {
      nonZeroProblemCount++;
    }

    pipeline.set(problem.id, effectiveSolves);
  }

  await pipeline.exec();

  console.log(
    `Refilled Redis effective solves for ${problemRows.length} problems (${nonZeroProblemCount} with non-zero values).`,
  );
}

main()
  .catch((error) => {
    console.error("Redis refill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
