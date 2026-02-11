import "dotenv/config";
import { Redis } from "@upstash/redis";
import { db, pool } from "../src/db";
import { problems } from "../src/db/schema";

async function main() {
  const redis = Redis.fromEnv();

  const allProblems = await db.select({ id: problems.id }).from(problems);

  if (allProblems.length === 0) {
    console.log("No problems found. Nothing to seed.");
    return;
  }

  const pipeline = redis.pipeline();
  for (const problem of allProblems) {
    pipeline.set(problem.id, 0);
  }

  await pipeline.exec();
  console.log(
    `Seeded ${allProblems.length} problem keys in Redis to 0 effective solve.`,
  );
}

main()
  .catch((error) => {
    console.error("Redis seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
