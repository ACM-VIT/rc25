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

type ColumnInfo = {
  name: string;
  isNullable: boolean;
  hasDefault: boolean;
  isIdentity: boolean;
  isGenerated: boolean;
};

const getColumnInfo = async (pool: Pool, table: string): Promise<ColumnInfo[]> => {
  const res = await pool.query(
    `SELECT column_name
          , is_nullable
          , column_default
          , is_identity
          , is_generated
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1`,
    [table]
  );
  return res.rows.map((row) => ({
    name: row.column_name as string,
    isNullable: row.is_nullable === "YES",
    hasDefault: row.column_default !== null,
    isIdentity: row.is_identity === "YES",
    isGenerated: row.is_generated !== "NEVER",
  }));
};

const getForeignKeyReferences = async (
  pool: Pool,
  table: string
): Promise<string[]> => {
  const res = await pool.query(
    `SELECT ccu.table_name AS referenced_table
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND tc.table_name = $1`,
    [table]
  );
  return res.rows.map((row) => row.referenced_table as string);
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

const copyTable = async (table: string, skippedTables: Set<string>) => {
  const sourceColumns = await getColumns(prodPool, table);
  const targetColumns = await getColumns(targetPool, table);
  const targetSet = new Set(targetColumns);
  const columns = sourceColumns.filter((col) => targetSet.has(col));
  if (!columns.length) {
    console.warn(`Skipping ${table}: no columns found`);
    return;
  }
  const columnInfo = await getColumnInfo(targetPool, table);
  const requiredColumns = columnInfo
    .filter(
      (col) =>
        !col.isNullable && !col.hasDefault && !col.isIdentity && !col.isGenerated
    )
    .map((col) => col.name);
  const requiredInInsert = requiredColumns.filter((col) => columns.includes(col));
  const missingRequired = requiredColumns.filter((col) => !columns.includes(col));
  if (missingRequired.length) {
    console.warn(
      `Skipping ${table}: missing required columns (${missingRequired.join(", ")})`
    );
    skippedTables.add(table);
    return;
  }

  if (cleanTarget) {
    if (cleanMode === "truncate") {
      await targetPool.query(`TRUNCATE TABLE "${table}" CASCADE`);
    } else {
      try {
        await targetPool.query(`DELETE FROM "${table}"`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("violates foreign key constraint")) {
          console.warn(
            `Delete failed for ${table} due to FK constraints; falling back to TRUNCATE CASCADE`
          );
          await targetPool.query(`TRUNCATE TABLE "${table}" CASCADE`);
        } else {
          throw error;
        }
      }
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

    let rows = res.rows;
    if (requiredInInsert.length) {
      const before = rows.length;
      rows = rows.filter((row) =>
        requiredInInsert.every((col) => row[col] !== null && row[col] !== undefined)
      );
      const skipped = before - rows.length;
      if (skipped > 0) {
        console.warn(`Skipped ${skipped} ${table} rows missing non-nullable fields`);
      }
    }

    await insertRows(targetPool, table, columns, rows);
    offset += res.rows.length;

    if (res.rows.length < batchSize) break;
  }
};

(async () => {
  try {
    console.log(`Copying tables: ${tablesToCopy.join(", ")}`);
    console.log(`Batch size: ${batchSize}`);
    if (cleanTarget) console.log("Cleaning target tables before import");

    const skippedTables = new Set<string>();
    const fkCache = new Map<string, string[]>();

    for (const table of tablesToCopy) {
      console.log(`→ ${table}`);
      let referencedTables = fkCache.get(table);
      if (!referencedTables) {
        referencedTables = await getForeignKeyReferences(targetPool, table);
        fkCache.set(table, referencedTables);
      }
      const blockedBy = referencedTables.filter((ref) => skippedTables.has(ref));
      if (blockedBy.length) {
        console.warn(
          `Skipping ${table}: depends on skipped table(s) (${blockedBy.join(", ")})`
        );
        skippedTables.add(table);
        continue;
      }
      await copyTable(table, skippedTables);
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
