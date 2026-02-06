import { db } from "@/db";
import { problems, rounds, testcases, type Difficulty } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

type ExampleCase = {
  input: string;
  output: string;
};

type ProblemDescription = {
  name?: string;
  description?: string[];
  constraints?: string[];
  example?: ExampleCase[];
  author?: string;
};

type GhTestCase = {
  input: string;
  output: string;
  isEdge: boolean;
};

type GhProblem = {
  title: string;
  description: string | ProblemDescription;
  webCode: string;
  testCases: GhTestCase[];
  difficulty: Difficulty;
};

type GhModifiedProblem = {
  before: GhProblem;
  after: GhProblem;
};

type GhDeletedProblem =
  | string
  | { title?: string; before?: { title?: string }; after?: { title?: string } };

type GhPayload = {
  created?: GhProblem[];
  modified?: GhModifiedProblem[];
  deleted?: GhDeletedProblem[];
};

type ProblemInsert = typeof problems.$inferInsert;
type ProblemFields = Pick<
  ProblemInsert,
  | "title"
  | "nickname"
  | "description"
  | "difficulty"
  | "web_code"
  | "normal_cases"
  | "edge_cases"
>;
type ProblemUpdate = Partial<ProblemFields>;
type TestcaseInsert = typeof testcases.$inferInsert;

function getProvidedApiKey(req: NextRequest): string | null {
  const headerKey = req.headers.get("x-api-key");
  if (headerKey) return headerKey;
  return null;
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "EASY" || value === "MEDIUM" || value === "HARD";
}

function isGhTestCase(value: unknown): value is GhTestCase {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.input === "string" &&
    typeof obj.output === "string" &&
    typeof obj.isEdge === "boolean"
  );
}

function isProblemDescription(value: unknown): value is ProblemDescription {
  if (!value || typeof value !== "object") return false;
  return true;
}

function isGhProblem(value: unknown): value is GhProblem {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.title === "string" &&
    (typeof obj.description === "string" ||
      isProblemDescription(obj.description)) &&
    typeof obj.webCode === "string" &&
    Array.isArray(obj.testCases) &&
    obj.testCases.every(isGhTestCase) &&
    isDifficulty(obj.difficulty)
  );
}

function isGhModifiedProblem(value: unknown): value is GhModifiedProblem {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return isGhProblem(obj.before) && isGhProblem(obj.after);
}

function normalizePayload(body: unknown): GhPayload {
  if (Array.isArray(body)) {
    return body.length ? normalizePayload(body[0]) : {};
  }

  if (!body || typeof body !== "object") {
    return {};
  }

  const obj = body as Record<string, unknown>;

  if (
    obj.payload &&
    (typeof obj.payload === "object" || Array.isArray(obj.payload))
  ) {
    return normalizePayload(obj.payload);
  }

  const createdRaw = Array.isArray(obj.created) ? obj.created : [];
  const modifiedRaw = Array.isArray(obj.modified) ? obj.modified : [];
  const deletedRaw = Array.isArray(obj.deleted) ? obj.deleted : [];

  return {
    created: createdRaw.filter(isGhProblem),
    modified: modifiedRaw.filter(isGhModifiedProblem),
    deleted: deletedRaw,
  };
}

function getDeletedTitle(entry: GhDeletedProblem): string | null {
  if (typeof entry === "string") {
    return entry.trim() ? entry.trim() : null;
  }

  const title = entry.title ?? entry.before?.title ?? entry.after?.title;
  if (typeof title !== "string") return null;
  const trimmed = title.trim();
  return trimmed ? trimmed : null;
}

function toNickname(problem: GhProblem): string {
  if (typeof problem.description === "object" && problem.description?.name) {
    return problem.description.name;
  }
  return problem.title;
}

function toProblemDescriptionText(
  description: GhProblem["description"],
): string {
  if (typeof description === "string") {
    return description;
  }

  const lines: string[] = [];

  if (description.name) {
    lines.push(`# ${description.name}`);
    lines.push("");
  }

  if (
    Array.isArray(description.description) &&
    description.description.length
  ) {
    lines.push(...description.description);
    lines.push("");
  }

  if (
    Array.isArray(description.constraints) &&
    description.constraints.length
  ) {
    lines.push("## Constraints");
    for (const constraint of description.constraints) {
      lines.push(`- ${constraint}`);
    }
    lines.push("");
  }

  if (Array.isArray(description.example) && description.example.length) {
    lines.push("## Examples");
    for (const ex of description.example) {
      lines.push("### Input");
      lines.push("```");
      lines.push(ex.input);
      lines.push("```");
      lines.push("### Output");
      lines.push("```");
      lines.push(ex.output);
      lines.push("```");
    }
    lines.push("");
  }

  if (description.author) {
    lines.push(`Author: ${description.author}`);
  }

  return lines.join("\n").trim();
}

function buildProblemFields(problem: GhProblem): ProblemFields {
  const normalCases = problem.testCases.filter((t) => !t.isEdge).length;
  const edgeCases = problem.testCases.filter((t) => t.isEdge).length;

  return {
    title: problem.title,
    nickname: toNickname(problem),
    description: toProblemDescriptionText(problem.description),
    difficulty: problem.difficulty,
    web_code: problem.webCode,
    normal_cases: normalCases,
    edge_cases: edgeCases,
  };
}

function buildTestcaseRows(
  problemId: string,
  cases: GhTestCase[],
): TestcaseInsert[] {
  return cases.map((t, index) => ({
    problemId,
    input: t.input,
    output: t.output,
    isEdge: t.isEdge,
    weight: 1,
    orderIndex: index,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const expectedApiKey = process.env.GHLINKAGE_API_KEY ?? process.env.API_KEY;
    if (!expectedApiKey) {
      return NextResponse.json(
        { error: "Server API key is not configured" },
        { status: 500 },
      );
    }

    const providedApiKey = getProvidedApiKey(req);
    if (!providedApiKey || providedApiKey !== expectedApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const payload = normalizePayload(body);

    const created = payload.created ?? [];
    const modified = payload.modified ?? [];
    const deleted = payload.deleted ?? [];

    if (!created.length && !modified.length && !deleted.length) {
      return NextResponse.json(
        { error: "No valid created/modified/deleted entries found" },
        { status: 400 },
      );
    }

    const summary = {
      created: 0,
      modified: 0,
      deleted: 0,
      skippedDeleted: 0,
    };

    await db.transaction(async (tx) => {
      const configuredRoundId = process.env.GHLINKAGE_ROUND_ID;
      let cachedRoundId: string | null | undefined;

      const getRoundIdForInsert = async (): Promise<string | null> => {
        if (cachedRoundId !== undefined) return cachedRoundId;

        if (configuredRoundId) {
          const configuredRoundRows = await tx
            .select({ id: rounds.id })
            .from(rounds)
            .where(eq(rounds.id, configuredRoundId))
            .limit(1);
          if (configuredRoundRows[0]?.id) {
            cachedRoundId = configuredRoundRows[0].id;
            return cachedRoundId;
          }
        }

        const latestRoundRows = await tx
          .select({ id: rounds.id })
          .from(rounds)
          .orderBy(desc(rounds.number))
          .limit(1);

        cachedRoundId = latestRoundRows[0]?.id ?? null;
        return cachedRoundId;
      };

      const syncProblemTestcases = async (
        problemId: string,
        problem: GhProblem,
      ) => {
        await tx.delete(testcases).where(eq(testcases.problemId, problemId));
        if (!problem.testCases.length) {
          return;
        }

        await tx
          .insert(testcases)
          .values(buildTestcaseRows(problemId, problem.testCases));
      };

      const upsertByTitle = async (problem: GhProblem, matchTitle?: string) => {
        const titleToMatch = matchTitle ?? problem.title;

        const existingRows = await tx
          .select({ id: problems.id })
          .from(problems)
          .where(eq(problems.title, titleToMatch))
          .limit(1);

        const updateData: ProblemUpdate = buildProblemFields(problem);

        if (existingRows[0]?.id) {
          const existingId = existingRows[0].id;
          await tx
            .update(problems)
            .set(updateData)
            .where(eq(problems.id, existingId));
          await syncProblemTestcases(existingId, problem);
          return;
        }

        const roundId = await getRoundIdForInsert();
        if (!roundId) {
          throw new Error(
            "Cannot insert new problem because no round exists. Set GHLINKAGE_ROUND_ID or create a round.",
          );
        }

        const insertData: ProblemInsert = {
          ...buildProblemFields(problem),
          roundId,
          initial: 0,
          minimum: 0,
          decay: 1,
        };

        const inserted = await tx
          .insert(problems)
          .values(insertData)
          .returning({ id: problems.id });
        const newProblemId = inserted[0]?.id;

        if (!newProblemId) {
          throw new Error(`Failed to insert problem: ${problem.title}`);
        }

        await syncProblemTestcases(newProblemId, problem);
      };

      for (const entry of created) {
        await upsertByTitle(entry);
        summary.created += 1;
      }

      for (const entry of modified) {
        await upsertByTitle(entry.after, entry.before.title);
        summary.modified += 1;
      }

      for (const entry of deleted) {
        const title = getDeletedTitle(entry);
        if (!title) {
          summary.skippedDeleted += 1;
          continue;
        }

        await tx.delete(problems).where(eq(problems.title, title));
        summary.deleted += 1;
      }
    });

    return NextResponse.json({ status: "success", summary });
  } catch (error) {
    console.error("Error processing ghlinkage payload:", error);
    return NextResponse.json(
      { error: "Failed to process ghlinkage payload" },
      { status: 500 },
    );
  }
}
