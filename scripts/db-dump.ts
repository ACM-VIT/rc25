import "dotenv/config";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getTableColumns, getTableName } from "drizzle-orm";
import { pool } from "../src/db";
import { calculateCurrentPoints, calculateSolveContribution } from "../src/db/scoring";
import {
  problems,
  rounds,
  solve,
  submissionTestcases,
  submissions,
  teams,
  testcases,
  users,
} from "../src/db/schema";

type DrizzleTable = Parameters<typeof getTableColumns>[0];

type DumpTarget = {
  fileName: string;
  table: DrizzleTable;
};

type RoundRow = {
  id: string;
  number: number;
};

type TeamRow = {
  id: string;
};

type ProblemConfigRow = {
  id: string;
  initial: number;
  minimum: number;
  decay: number;
};

type SolveRow = {
  teamId: string;
  problemId: string;
  testcasesPassed: number;
};

type LeaderboardEntry = {
  rank: number;
  teamId: string;
  totalScore: number;
};

const OUTPUT_DIR =
  process.env.DB_DUMP_DIR ?? path.join(process.cwd(), "tmp", "db-dump");

const DUMP_TARGETS: DumpTarget[] = [
  { fileName: "user.csv", table: users },
  { fileName: "team.csv", table: teams },
  { fileName: "submission.csv", table: submissions },
  { fileName: "problem.csv", table: problems },
  { fileName: "testcase.csv", table: testcases },
  { fileName: "submissiontest.csv", table: submissionTestcases },
];

const LEADERBOARD_COLUMNS = [
  "rank",
  "teamId",
  "totalScore",
] as const;

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, "\"\"")}"`;
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function rowsToCsv(
  rows: Record<string, unknown>[],
  columns: readonly string[],
): string {
  const header = columns.join(",");
  if (rows.length === 0) {
    return `${header}\n`;
  }

  const lines = rows.map((row) =>
    columns
      .map((column) => escapeCsvValue(normalizeValue(row[column])))
      .join(","),
  );

  return `${header}\n${lines.join("\n")}\n`;
}

function getColumnsForTable(table: DrizzleTable): string[] {
  const columns = Object.values(getTableColumns(table));
  return columns.map((column) => column.name);
}

async function dumpTableCsv(target: DumpTarget): Promise<number> {
  const tableName = getTableName(target.table);
  const columns = getColumnsForTable(target.table);

  const selectList = columns.map((column) => quoteIdentifier(column)).join(", ");
  const hasIdColumn = columns.includes("id");
  const orderBy = hasIdColumn ? ` ORDER BY ${quoteIdentifier("id")} ASC` : "";

  const query = `SELECT ${selectList} FROM ${quoteIdentifier(tableName)}${orderBy}`;
  const { rows } = await pool.query<Record<string, unknown>>(query);

  const csv = rowsToCsv(rows, columns);
  await fs.writeFile(path.join(OUTPUT_DIR, target.fileName), csv, "utf8");

  return rows.length;
}

async function dumpRequestedTables() {
  for (const target of DUMP_TARGETS) {
    const count = await dumpTableCsv(target);
    console.log(`Wrote ${target.fileName} (${count} rows)`);
  }
}

function rankAndSortScores(scoreByTeam: Map<string, number>): LeaderboardEntry[] {
  return Array.from(scoreByTeam.entries())
    .filter(([, totalScore]) => totalScore > 0)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .map(([teamId, totalScore], index) => ({
      rank: index + 1,
      teamId,
      totalScore,
    }));
}

async function calculateRoundLeaderboard(
  roundId: string,
  eligibleTeamIds: Set<string>,
): Promise<LeaderboardEntry[]> {
  const problemTableName = quoteIdentifier(getTableName(problems));
  const solveTableName = quoteIdentifier(getTableName(solve));

  const problemResult = await pool.query<ProblemConfigRow>(
    `SELECT id, initial, minimum, decay
     FROM ${problemTableName}
     WHERE "roundId" = $1`,
    [roundId],
  );

  if (problemResult.rows.length === 0) {
    return [];
  }

  const solveResult = await pool.query<SolveRow>(
    `SELECT s."teamId", s."problemId", s."testcasesPassed"
     FROM ${solveTableName} s
     JOIN ${problemTableName} p ON p.id = s."problemId"
     WHERE p."roundId" = $1`,
    [roundId],
  );

  const effectiveSolvesByProblem = new Map<string, number>();
  for (const solveRow of solveResult.rows) {
    const contribution = calculateSolveContribution(solveRow.testcasesPassed);
    effectiveSolvesByProblem.set(
      solveRow.problemId,
      (effectiveSolvesByProblem.get(solveRow.problemId) ?? 0) + contribution,
    );
  }

  const currentPointsByProblem = new Map<string, number>();
  for (const problem of problemResult.rows) {
    const effectiveSolves = effectiveSolvesByProblem.get(problem.id) ?? 0;
    const currentPoints = calculateCurrentPoints({
      initial: problem.initial,
      minimum: problem.minimum,
      decay: problem.decay,
      effectiveSolves,
    });
    currentPointsByProblem.set(problem.id, currentPoints);
  }

  const scoreByTeam = new Map<string, number>();
  for (const solveRow of solveResult.rows) {
    if (!eligibleTeamIds.has(solveRow.teamId)) continue;

    const currentPoints = currentPointsByProblem.get(solveRow.problemId) ?? 0;
    const submissionScore = Math.round(
      currentPoints * calculateSolveContribution(solveRow.testcasesPassed),
    );
    scoreByTeam.set(
      solveRow.teamId,
      (scoreByTeam.get(solveRow.teamId) ?? 0) + submissionScore,
    );
  }

  return rankAndSortScores(scoreByTeam);
}

async function dumpLeaderboards() {
  const teamTableName = quoteIdentifier(getTableName(teams));
  const roundsTableName = quoteIdentifier(getTableName(rounds));
  const teamsResult = await pool.query<TeamRow>(
    `SELECT id FROM ${teamTableName} WHERE hidden = false AND disqualify = false`,
  );
  const eligibleTeamIds = new Set(teamsResult.rows.map((row) => row.id));

  const roundsResult = await pool.query<RoundRow>(
    `SELECT id, number FROM ${roundsTableName} ORDER BY number ASC`,
  );

  const overallScoreByTeam = new Map<string, number>();

  for (const round of roundsResult.rows) {
    const roundLeaderboard = await calculateRoundLeaderboard(
      round.id,
      eligibleTeamIds,
    );
    for (const row of roundLeaderboard) {
      overallScoreByTeam.set(
        row.teamId,
        (overallScoreByTeam.get(row.teamId) ?? 0) + row.totalScore,
      );
    }

    const perRoundCsv = rowsToCsv(roundLeaderboard, LEADERBOARD_COLUMNS);
    const perRoundFile = `leaderboard_round_${round.number}.csv`;
    await fs.writeFile(path.join(OUTPUT_DIR, perRoundFile), perRoundCsv, "utf8");
    console.log(`Wrote ${perRoundFile} (${roundLeaderboard.length} rows)`);
  }

  const overallLeaderboard = rankAndSortScores(overallScoreByTeam);
  const overallCsv = rowsToCsv(overallLeaderboard, LEADERBOARD_COLUMNS);
  await fs.writeFile(path.join(OUTPUT_DIR, "leaderboard.csv"), overallCsv, "utf8");
  console.log(`Wrote leaderboard.csv (${overallLeaderboard.length} rows)`);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Dump directory: ${OUTPUT_DIR}`);

  await dumpRequestedTables();
  await dumpLeaderboards();
}

main()
  .catch((error) => {
    console.error("db-dump failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
