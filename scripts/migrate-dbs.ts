import "dotenv/config";
import { Pool, type PoolClient } from "pg";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Row = Record<string, unknown>;

const SOURCE_DATABASE_URL = process.env.OLD_DATABASE_URL;
const TARGET_DATABASE_URL = process.env.DATABASE_URL;

if (!SOURCE_DATABASE_URL || !TARGET_DATABASE_URL) {
  console.error("Missing OLD_DATABASE_URL or DATABASE_URL in env");
  process.exit(1);
}

const DRY_RUN = process.env.DRY_RUN === "true";
const REPLACE_EXISTING_TESTCASES =
  process.env.REPLACE_EXISTING_TESTCASES !== "false";
const FALLBACK_ROUND_ID =
  process.env.MIGRATE_ROUND_ID ?? process.env.DEFAULT_ROUND_ID ?? null;

const sourcePool = new Pool({ connectionString: SOURCE_DATABASE_URL });
const targetPool = new Pool({ connectionString: TARGET_DATABASE_URL });

const SOURCE_PROBLEM_TABLE_CANDIDATES = [
  "Problem",
  "Problems",
  "Question",
  "Questions",
  "problem",
  "problems",
  "question",
  "questions",
];

const SOURCE_TESTCASE_TABLE_CANDIDATES = [
  "Testcase",
  "Testcases",
  "TestCase",
  "TestCases",
  "testcase",
  "testcases",
  "test_case",
  "test_cases",
];

const TARGET_PROBLEM_TABLE = "Problem";
const TARGET_TESTCASE_TABLE = "Testcase";
const TARGET_ROUND_TABLE = "Round";

const quoteIdent = (identifier: string): string =>
  `"${identifier.replace(/"/g, `""`)}"`;

const normalize = (value: string): string => value.trim().toLowerCase();

const newId = (): string => crypto.randomUUID();

const toInt = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toStringValue = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  return null;
};

const toBool = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const lowered = normalize(value);
    if (["true", "t", "1", "yes", "y"].includes(lowered)) return true;
    if (["false", "f", "0", "no", "n"].includes(lowered)) return false;
  }
  return null;
};

const slugify = (text: string): string => {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, 80) || "untitled";
};

const toDifficulty = (value: unknown): Difficulty => {
  const maybeInt = toInt(value);
  if (maybeInt !== null) {
    if (maybeInt <= 1) return "EASY";
    if (maybeInt === 2) return "MEDIUM";
    return "HARD";
  }

  const text = normalize(toStringValue(value) ?? "");
  if (text.includes("easy") || text === "e") return "EASY";
  if (text.includes("hard") || text === "h") return "HARD";
  return "MEDIUM";
};

const getTables = async (pool: Pool): Promise<string[]> => {
  const res = await pool.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'`
  );
  return res.rows.map((row) => row.table_name);
};

const resolveTable = (
  existingTables: string[],
  candidates: string[],
): string | null => {
  for (const candidate of candidates) {
    const exact = existingTables.find((table) => table === candidate);
    if (exact) return exact;
  }
  for (const candidate of candidates) {
    const lowered = normalize(candidate);
    const insensitive = existingTables.find(
      (table) => normalize(table) === lowered,
    );
    if (insensitive) return insensitive;
  }
  return null;
};

const getColumns = async (pool: Pool, table: string): Promise<string[]> => {
  const res = await pool.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1`,
    [table],
  );
  return res.rows.map((row) => row.column_name);
};

const buildColumnLookup = (columns: string[]): Map<string, string> => {
  const lookup = new Map<string, string>();
  for (const col of columns) {
    lookup.set(normalize(col), col);
  }
  return lookup;
};

const pickColumn = (
  lookup: Map<string, string>,
  candidates: string[],
): string | null => {
  for (const candidate of candidates) {
    const found = lookup.get(normalize(candidate));
    if (found) return found;
  }
  return null;
};

const pickValue = (
  row: Row,
  lookup: Map<string, string>,
  candidates: string[],
): unknown => {
  const column = pickColumn(lookup, candidates);
  if (!column) return undefined;
  return row[column];
};

const insertSql = (table: string, payload: Record<string, unknown>): {
  sql: string;
  values: unknown[];
} => {
  const entries = Object.entries(payload).filter(
    ([, value]) => value !== undefined,
  );
  if (entries.length === 0) {
    throw new Error(`No values available to insert into ${table}`);
  }

  const columns = entries.map(([key]) => quoteIdent(key)).join(", ");
  const placeholders = entries.map((_, idx) => `$${idx + 1}`).join(", ");
  const values = entries.map(([, value]) => value);
  const sql = `INSERT INTO ${quoteIdent(table)} (${columns}) VALUES (${placeholders})`;
  return { sql, values };
};

const updateSql = (
  table: string,
  payload: Record<string, unknown>,
  whereClause: string,
  whereValues: unknown[],
): { sql: string; values: unknown[] } => {
  const entries = Object.entries(payload).filter(
    ([, value]) => value !== undefined,
  );
  if (entries.length === 0) {
    throw new Error(`No values available to update ${table}`);
  }

  const setClause = entries
    .map(([key], idx) => `${quoteIdent(key)} = $${idx + 1}`)
    .join(", ");
  const values = [...entries.map(([, value]) => value), ...whereValues];
  const sql = `UPDATE ${quoteIdent(table)} SET ${setClause} ${whereClause}`;
  return { sql, values };
};

const getFallbackRoundId = async (
  client: PoolClient,
  knownRoundIds: Set<string>,
): Promise<string> => {
  if (FALLBACK_ROUND_ID) {
    return FALLBACK_ROUND_ID;
  }

  const res = await client.query<{ id: string }>(
    `SELECT ${quoteIdent("id")} AS id
     FROM ${quoteIdent(TARGET_ROUND_TABLE)}
     ORDER BY ${quoteIdent("number")} ASC
     LIMIT 1`,
  );

  const id = res.rows[0]?.id;
  if (!id) {
    throw new Error(
      `No fallback round available. Set MIGRATE_ROUND_ID or insert at least one row in "${TARGET_ROUND_TABLE}".`,
    );
  }
  knownRoundIds.add(id);
  return id;
};

async function main() {
  const sourceTables = await getTables(sourcePool);
  const targetTables = await getTables(targetPool);

  const sourceProblemTable = resolveTable(
    sourceTables,
    SOURCE_PROBLEM_TABLE_CANDIDATES,
  );
  const sourceTestcaseTable = resolveTable(
    sourceTables,
    SOURCE_TESTCASE_TABLE_CANDIDATES,
  );

  if (!sourceProblemTable) {
    throw new Error(
      `Could not find source problem table. Tried: ${SOURCE_PROBLEM_TABLE_CANDIDATES.join(", ")}`,
    );
  }

  if (!sourceTestcaseTable) {
    throw new Error(
      `Could not find source testcase table. Tried: ${SOURCE_TESTCASE_TABLE_CANDIDATES.join(", ")}`,
    );
  }

  if (
    !targetTables.includes(TARGET_PROBLEM_TABLE) ||
    !targetTables.includes(TARGET_TESTCASE_TABLE)
  ) {
    throw new Error(
      `Target DB must contain "${TARGET_PROBLEM_TABLE}" and "${TARGET_TESTCASE_TABLE}" tables.`,
    );
  }

  const sourceProblemColumns = await getColumns(sourcePool, sourceProblemTable);
  const sourceProblemLookup = buildColumnLookup(sourceProblemColumns);
  const sourceTestcaseColumns = await getColumns(sourcePool, sourceTestcaseTable);
  const sourceTestcaseLookup = buildColumnLookup(sourceTestcaseColumns);

  const targetProblemColumns = await getColumns(targetPool, TARGET_PROBLEM_TABLE);
  const targetProblemColumnSet = new Set(targetProblemColumns);
  const targetTestcaseColumns = await getColumns(targetPool, TARGET_TESTCASE_TABLE);
  const targetTestcaseColumnSet = new Set(targetTestcaseColumns);

  const sourceProblemIdColumn =
    pickColumn(sourceProblemLookup, ["id", "problemId", "questionId"]) ?? "id";
  const sourceTestcaseProblemIdColumn = pickColumn(sourceTestcaseLookup, [
    "problemId",
    "questionId",
    "problem_id",
    "question_id",
    "problem",
    "question",
  ]);

  if (!sourceTestcaseProblemIdColumn) {
    throw new Error(
      `Could not identify testcase->problem relation column in source "${sourceTestcaseTable}".`,
    );
  }

  const sourceProblemOrderBy = sourceProblemColumns.includes(sourceProblemIdColumn)
    ? ` ORDER BY ${quoteIdent(sourceProblemIdColumn)}`
    : "";
  const sourceTestcaseOrderBy = sourceTestcaseColumns.includes(
    sourceTestcaseProblemIdColumn,
  )
    ? ` ORDER BY ${quoteIdent(sourceTestcaseProblemIdColumn)}`
    : "";

  const sourceProblemRowsRes = await sourcePool.query<Row>(
    `SELECT * FROM ${quoteIdent(sourceProblemTable)}${sourceProblemOrderBy}`,
  );
  const sourceTestcaseRowsRes = await sourcePool.query<Row>(
    `SELECT * FROM ${quoteIdent(sourceTestcaseTable)}${sourceTestcaseOrderBy}`,
  );

  const targetClient = await targetPool.connect();
  try {
    await targetClient.query("BEGIN");

    const roundRows = await targetClient.query<{ id: string; number: number }>(
      `SELECT ${quoteIdent("id")} AS id, ${quoteIdent("number")} AS number
       FROM ${quoteIdent(TARGET_ROUND_TABLE)}`,
    );
    const roundIdSet = new Set(roundRows.rows.map((row) => row.id));
    const roundNumberMap = new Map<number, string>(
      roundRows.rows.map((row) => [row.number, row.id]),
    );

    const fallbackRoundId = await getFallbackRoundId(targetClient, roundIdSet);

    const sourceProblemIdToTargetProblemId = new Map<string, string>();
    const fallbackCaseCountsBySourceProblemId = new Map<
      string,
      { normal: number | null; edge: number | null }
    >();

    let createdProblems = 0;
    let updatedProblems = 0;
    let skippedProblems = 0;

    for (const row of sourceProblemRowsRes.rows) {
      const sourceProblemId = toStringValue(row[sourceProblemIdColumn]);
      if (!sourceProblemId) {
        skippedProblems += 1;
        continue;
      }

      const title =
        toStringValue(
          pickValue(row, sourceProblemLookup, [
            "title",
            "name",
            "question",
            "questionTitle",
          ]),
        ) ?? "";

      if (!title) {
        skippedProblems += 1;
        continue;
      }

      const nickname =
        toStringValue(
          pickValue(row, sourceProblemLookup, [
            "nickname",
            "slug",
            "shortTitle",
          ]),
        ) ?? slugify(title);

      const description =
        toStringValue(
          pickValue(row, sourceProblemLookup, [
            "description",
            "statement",
            "body",
            "content",
          ]),
        ) ?? "";

      const difficulty = toDifficulty(
        pickValue(row, sourceProblemLookup, ["difficulty", "level"]),
      );

      const initial =
        toInt(
          pickValue(row, sourceProblemLookup, [
            "initial",
            "points",
            "score",
            "baseScore",
          ]),
        ) ?? 0;
      const minimum =
        toInt(
          pickValue(row, sourceProblemLookup, [
            "minimum",
            "minPoints",
            "floorScore",
          ]),
        ) ?? 0;
      const decay =
        toInt(
          pickValue(row, sourceProblemLookup, [
            "decay",
            "solveDecay",
            "decayCount",
          ]),
        ) ?? 1;

      const webCode =
        toStringValue(
          pickValue(row, sourceProblemLookup, [
            "web_code",
            "webCode",
            "starterCode",
            "template",
            "boilerplate",
          ]),
        ) ?? "";

      const sourceNormalCases = toInt(
        pickValue(row, sourceProblemLookup, [
          "normal_cases",
          "normalCases",
          "publicCases",
          "basicCases",
        ]),
      );
      const sourceEdgeCases = toInt(
        pickValue(row, sourceProblemLookup, [
          "edge_cases",
          "edgeCases",
          "hiddenCases",
          "advancedCases",
        ]),
      );

      const roundIdCandidate = toStringValue(
        pickValue(row, sourceProblemLookup, ["roundId", "round_id"]),
      );
      const roundNumberCandidate = toInt(
        pickValue(row, sourceProblemLookup, ["round", "roundNumber"]),
      );

      const resolvedRoundId =
        (roundIdCandidate && roundIdSet.has(roundIdCandidate)
          ? roundIdCandidate
          : null) ??
        (roundNumberCandidate !== null
          ? roundNumberMap.get(roundNumberCandidate) ?? null
          : null) ??
        fallbackRoundId;

      const isHidden =
        toBool(pickValue(row, sourceProblemLookup, ["isHidden", "hidden"])) ??
        false;

      const problemPayload: Record<string, unknown> = {
        title,
        nickname,
        description,
        difficulty,
        initial,
        minimum,
        decay: Math.max(1, decay),
        web_code: webCode,
        roundId: resolvedRoundId,
        normal_cases: sourceNormalCases ?? 0,
        edge_cases: sourceEdgeCases ?? 0,
      };

      if (targetProblemColumnSet.has("isHidden")) {
        problemPayload.isHidden = isHidden;
      }

      const existing = await targetClient.query<{ id: string }>(
        `SELECT ${quoteIdent("id")} AS id
         FROM ${quoteIdent(TARGET_PROBLEM_TABLE)}
         WHERE ${quoteIdent("title")} = $1
           AND ${quoteIdent("roundId")} = $2
         LIMIT 1`,
        [title, resolvedRoundId],
      );

      let targetProblemId: string;
      if (existing.rows.length > 0) {
        targetProblemId = existing.rows[0].id;
        const update = updateSql(
          TARGET_PROBLEM_TABLE,
          problemPayload,
          `WHERE ${quoteIdent("id")} = $${Object.keys(problemPayload).length + 1}`,
          [targetProblemId],
        );
        await targetClient.query(update.sql, update.values);
        updatedProblems += 1;
      } else {
        const problemInsertPayload = {
          ...(targetProblemColumnSet.has("id") ? { id: newId() } : {}),
          ...problemPayload,
        };
        const insert = insertSql(TARGET_PROBLEM_TABLE, problemInsertPayload);
        const insertRes = await targetClient.query<{ id: string }>(
          `${insert.sql} RETURNING ${quoteIdent("id")} AS id`,
          insert.values,
        );
        const insertedId = insertRes.rows[0]?.id;
        if (!insertedId) {
          throw new Error(`Failed to insert target problem for source ${sourceProblemId}`);
        }
        targetProblemId = insertedId;
        createdProblems += 1;
      }

      sourceProblemIdToTargetProblemId.set(sourceProblemId, targetProblemId);
      fallbackCaseCountsBySourceProblemId.set(sourceProblemId, {
        normal: sourceNormalCases,
        edge: sourceEdgeCases,
      });
    }

    let deletedTestcasesForProblems = 0;
    const clearedProblems = new Set<string>();
    const insertedCaseCountsByTargetProblemId = new Map<
      string,
      { normal: number; edge: number }
    >();
    const nextOrderIndexByTargetProblemId = new Map<string, number>();

    let insertedTestcases = 0;
    let skippedTestcases = 0;

    for (const row of sourceTestcaseRowsRes.rows) {
      const sourceProblemId = toStringValue(row[sourceTestcaseProblemIdColumn]);
      if (!sourceProblemId) {
        skippedTestcases += 1;
        continue;
      }

      const targetProblemId = sourceProblemIdToTargetProblemId.get(sourceProblemId);
      if (!targetProblemId) {
        skippedTestcases += 1;
        continue;
      }

      if (REPLACE_EXISTING_TESTCASES && !clearedProblems.has(targetProblemId)) {
        await targetClient.query(
          `DELETE FROM ${quoteIdent(TARGET_TESTCASE_TABLE)}
           WHERE ${quoteIdent("problemId")} = $1`,
          [targetProblemId],
        );
        clearedProblems.add(targetProblemId);
        deletedTestcasesForProblems += 1;
      }

      const input =
        toStringValue(
          pickValue(row, sourceTestcaseLookup, [
            "input",
            "stdin",
            "inputData",
            "testInput",
          ]),
        ) ?? "";
      const output =
        toStringValue(
          pickValue(row, sourceTestcaseLookup, [
            "output",
            "expectedOutput",
            "expected",
            "stdout",
            "answer",
          ]),
        ) ?? "";

      if (!input && !output) {
        skippedTestcases += 1;
        continue;
      }

      const parsedWeight = toInt(
        pickValue(row, sourceTestcaseLookup, ["weight", "points", "score"]),
      );
      const weight = parsedWeight !== null && parsedWeight > 0 ? parsedWeight : 1;

      const isEdge =
        toBool(
          pickValue(row, sourceTestcaseLookup, [
            "isEdge",
            "edge",
            "is_edge",
            "edgeCase",
          ]),
        ) ?? false;

      const isHidden =
        toBool(
          pickValue(row, sourceTestcaseLookup, ["isHidden", "hidden", "is_hidden"]),
        ) ?? false;

      const explicitOrderIndex = toInt(
        pickValue(row, sourceTestcaseLookup, [
          "orderIndex",
          "order",
          "position",
          "sortOrder",
        ]),
      );
      const generatedOrderIndex =
        nextOrderIndexByTargetProblemId.get(targetProblemId) ?? 0;
      const orderIndex =
        explicitOrderIndex !== null ? explicitOrderIndex : generatedOrderIndex;

      nextOrderIndexByTargetProblemId.set(targetProblemId, orderIndex + 1);

      const testcasePayload: Record<string, unknown> = {
        ...(targetTestcaseColumnSet.has("id") ? { id: newId() } : {}),
        problemId: targetProblemId,
        input,
        output,
      };

      if (targetTestcaseColumnSet.has("weight")) {
        testcasePayload.weight = weight;
      }
      if (targetTestcaseColumnSet.has("isEdge")) {
        testcasePayload.isEdge = isEdge;
      }
      if (targetTestcaseColumnSet.has("isHidden")) {
        testcasePayload.isHidden = isHidden;
      }
      if (targetTestcaseColumnSet.has("orderIndex")) {
        testcasePayload.orderIndex = orderIndex;
      }

      const insert = insertSql(TARGET_TESTCASE_TABLE, testcasePayload);
      await targetClient.query(insert.sql, insert.values);

      const counts = insertedCaseCountsByTargetProblemId.get(targetProblemId) ?? {
        normal: 0,
        edge: 0,
      };
      if (isEdge) {
        counts.edge += 1;
      } else {
        counts.normal += 1;
      }
      insertedCaseCountsByTargetProblemId.set(targetProblemId, counts);
      insertedTestcases += 1;
    }

    for (const [sourceProblemId, targetProblemId] of Array.from(
      sourceProblemIdToTargetProblemId.entries(),
    )) {
      const insertedCounts = insertedCaseCountsByTargetProblemId.get(targetProblemId);
      const fallbackCounts = fallbackCaseCountsBySourceProblemId.get(sourceProblemId);

      const normal =
        insertedCounts?.normal ??
        fallbackCounts?.normal ??
        null;
      const edge =
        insertedCounts?.edge ??
        fallbackCounts?.edge ??
        null;

      if (normal === null && edge === null) {
        continue;
      }

      const payload: Record<string, unknown> = {};
      if (normal !== null && targetProblemColumnSet.has("normal_cases")) {
        payload.normal_cases = Math.max(0, normal);
      }
      if (edge !== null && targetProblemColumnSet.has("edge_cases")) {
        payload.edge_cases = Math.max(0, edge);
      }
      if (Object.keys(payload).length === 0) {
        continue;
      }

      const update = updateSql(
        TARGET_PROBLEM_TABLE,
        payload,
        `WHERE ${quoteIdent("id")} = $${Object.keys(payload).length + 1}`,
        [targetProblemId],
      );
      await targetClient.query(update.sql, update.values);
    }

    if (DRY_RUN) {
      await targetClient.query("ROLLBACK");
      console.log("[DRY_RUN] Rolled back all changes.");
    } else {
      await targetClient.query("COMMIT");
    }

    console.log(`Source problem table: ${sourceProblemTable}`);
    console.log(`Source testcase table: ${sourceTestcaseTable}`);
    console.log(`Created problems: ${createdProblems}`);
    console.log(`Updated problems: ${updatedProblems}`);
    console.log(`Skipped problems: ${skippedProblems}`);
    console.log(`Inserted testcases: ${insertedTestcases}`);
    console.log(`Skipped testcases: ${skippedTestcases}`);
    if (REPLACE_EXISTING_TESTCASES) {
      console.log(
        `Replaced existing testcases for problems: ${deletedTestcasesForProblems}`,
      );
    }
  } catch (error) {
    await targetClient.query("ROLLBACK");
    throw error;
  } finally {
    targetClient.release();
  }
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([sourcePool.end(), targetPool.end()]);
  });
