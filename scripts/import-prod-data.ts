import { Pool } from "pg";

const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL;
const DATABASE_URL = process.env.DATABASE_URL;

if (!PROD_DATABASE_URL || !DATABASE_URL) {
  console.error("Missing PROD_DATABASE_URL or DATABASE_URL in env");
  process.exit(1);
}

const DEFAULT_TABLES = [
  "Round",
  "Problem",
  "Testcase",
  "Flags",
  "News",
  "Team",
  "User",
  "TeamRound",
  "Submission",
  "TestcaseSubmission",
  "TeamTestcaseSolve",
  "UniReg",
  "Admin",
];

const tables = (process.env.TABLES || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const tablesToCopy = tables.length ? tables : DEFAULT_TABLES;
const batchSize = Number.parseInt(process.env.BATCH_SIZE || "1000", 10);
const cleanTarget = process.env.CLEAN_TARGET === "true";
const cleanMode = process.env.CLEAN_TARGET_MODE === "truncate" ? "truncate" : "delete";

const prodPool = new Pool({ connectionString: PROD_DATABASE_URL });
const targetPool = new Pool({ connectionString: DATABASE_URL });

const getColumns = async (pool: Pool, table: string) => {
  const res = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  return res.rows.map((row) => row.column_name as string);
};

const insertRows = async (
  pool: Pool,
  table: string,
  columns: string[],
  rows: Record<string, unknown>[]
) => {
  if (!rows.length) return;
  const values: unknown[] = [];
  const placeholders: string[] = [];

  rows.forEach((row, rowIndex) => {
    const offset = rowIndex * columns.length;
    const rowPlaceholders = columns.map((_, colIndex) => `$${offset + colIndex + 1}`);
    placeholders.push(`(${rowPlaceholders.join(", ")})`);
    columns.forEach((col) => {
      const value = row[col];
      values.push(value === undefined ? null : value);
    });
  });

  const columnList = columns.map((c) => `"${c}"`).join(", ");
  const sql = `INSERT INTO "${table}" (${columnList}) VALUES ${placeholders.join(", ")}`;
  await pool.query(sql, values);
};

const copyTable = async (table: string) => {
  const sourceColumns = await getColumns(prodPool, table);
  const targetColumns = await getColumns(targetPool, table);
  const targetSet = new Set(targetColumns);
  const columns = sourceColumns.filter((col) => targetSet.has(col));
  if (!columns.length) {
    console.warn(`Skipping ${table}: no columns found`);
    return;
  }

  if (cleanTarget) {
    if (cleanMode === "truncate") {
      await targetPool.query(`TRUNCATE TABLE "${table}"`);
    } else {
      await targetPool.query(`DELETE FROM "${table}"`);
    }
  }

  let offset = 0;
  while (true) {
    const selectList = columns.map((col) => `"${col}"`).join(", ");
    const res = await prodPool.query(
      `SELECT ${selectList} FROM "${table}" LIMIT $1 OFFSET $2`,
      [batchSize, offset]
    );
    if (res.rows.length === 0) break;

    await insertRows(targetPool, table, columns, res.rows);
    offset += res.rows.length;

    if (res.rows.length < batchSize) break;
  }
};

(async () => {
  try {
    console.log(`Copying tables: ${tablesToCopy.join(", ")}`);
    console.log(`Batch size: ${batchSize}`);
    if (cleanTarget) console.log("Cleaning target tables before import");

    for (const table of tablesToCopy) {
      console.log(`→ ${table}`);
      await copyTable(table);
    }

    console.log("Done.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prodPool.end();
    await targetPool.end();
  }
})();
