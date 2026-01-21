import "dotenv/config";
import { db, pool } from "../src/db";
import { flags, teams } from "../src/db/schema";
import { FLAGS } from "../src/types/flags";

const DEFAULT_FLAGS = {
  [FLAGS.SCOREBOARD_VISIBLE]: true,
  [FLAGS.MAINTENANCE_MODE]: false,
} as const;

async function main() {
  const adminTeamId = process.env.ADMIN_TEAM_ID;
  if (!adminTeamId) {
    throw new Error("ADMIN_TEAM_ID environment variable is required");
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(teams)
      .values({
        id: adminTeamId,
        name: "ADMIN TEAM",
        shortCode: adminTeamId,
        checkedIn: true,
      })
      .onConflictDoNothing();

    await tx.delete(flags);
    await tx
      .insert(flags)
      .values(
        Object.entries(DEFAULT_FLAGS).map(([name, value]) => ({
          name,
          value,
        }))
      )
      .onConflictDoNothing();
  });
}

main()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
