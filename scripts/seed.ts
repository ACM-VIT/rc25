import "dotenv/config";
import { db, pool } from "../src/db";
import { flags, rounds, teamRounds, teams } from "../src/db/schema";
import { FLAGS } from "../src/types/flags";

const DEFAULT_FLAGS = {
  [FLAGS.SCOREBOARD_VISIBLE]: true,
  [FLAGS.MAINTENANCE_MODE]: false,
} as const;

const DEFAULT_ROUNDS = [
  {
    number: 1,
    start: new Date(1770863400000), // 2026-02-12T02:30:00Z
    end: new Date(1770883200000), // 2026-02-12T08:00:00Z
    result: new Date(1770885000000), // 2026-02-12T08:30:00Z
  },
  {
    number: 2,
    start: new Date(1770886800000), // 2026-02-12T09:00:00Z
    end: new Date(1770906600000), // 2026-02-12T14:30:00Z
    result: new Date(1770908400000), // 2026-02-12T15:00:00Z
  },
  {
    number: 0,
    start: new Date(1770912000000), // Later than round 2
    end: new Date(1770933600000),
    result: new Date(1770935400000),
  },
] as const;

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

    for (const round of DEFAULT_ROUNDS) {
      await tx
        .insert(rounds)
        .values(round)
        .onConflictDoUpdate({
          target: rounds.number,
          set: {
            start: round.start,
            end: round.end,
            result: round.result,
          },
        });
    }

    const allRounds = await tx
      .select({
        id: rounds.id,
      })
      .from(rounds);

    if (allRounds.length > 0) {
      await tx
        .insert(teamRounds)
        .values(
          allRounds.map((round) => ({
            teamId: adminTeamId,
            roundId: round.id,
          })),
        )
        .onConflictDoNothing();
    }

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
