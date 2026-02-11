import { db } from "@/db";
import { problems, rounds, testcases, type Difficulty } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

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
  round?: number;
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
type EffectiveSolvesByQuestionId = Record<string, number>;

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

function getRoundNumberFromProblem(problem: GhProblem): number | null {
  if (typeof problem.description === "object" && problem.description?.round) {
    return problem.description.round;
  }
  return null;
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

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

async function getQuestionEffectiveSolvesFromRedis(): Promise<EffectiveSolvesByQuestionId> {
  if (!redis) {
    return {};
  }

  const problemRows = await db.select({ id: problems.id }).from(problems);
  const entries = await Promise.all(
    problemRows.map(async ({ id }) => {
      const value = Number((await redis.get(id)) ?? 0);
      return [id, value] as const;
    }),
  );

  return Object.fromEntries(entries);
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
    const touchedProblemIds = new Set<string>();
    const deletedProblemIds = new Set<string>();

    await db.transaction(async (tx) => {
      const configuredRoundId = process.env.GHLINKAGE_ROUND_ID;
      const roundRows = await tx
        .select({ id: rounds.id, number: rounds.number })
        .from(rounds);
      const roundIdByNumber = new Map<number, string>();
      for (const round of roundRows) {
        roundIdByNumber.set(round.number, round.id);
      }

      const latestRoundId =
        roundRows.length > 0
          ? roundRows.reduce((latest, current) =>
              current.number > latest.number ? current : latest,
            ).id
          : null;
      const configuredRoundExists =
        !!configuredRoundId &&
        roundRows.some((round) => round.id === configuredRoundId);
      const cachedRoundId = configuredRoundExists
        ? configuredRoundId
        : latestRoundId;

      const getRoundIdForInsert = async (
        problem: GhProblem,
      ): Promise<string | null> => {
        // First, check if problem has a round number in its description
        const roundNumber = getRoundNumberFromProblem(problem);
        if (roundNumber !== null) {
          const roundId = roundIdByNumber.get(roundNumber);
          if (roundId) {
            return roundId;
          }
        }

        // Fall back to configured roundId if valid, otherwise latest round.
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

      const upsertByTitle = async (
        problem: GhProblem,
        matchTitle?: string,
      ): Promise<string> => {
        const titleToMatch = matchTitle ?? problem.title;

        const existingRows = await tx
          .select({ id: problems.id })
          .from(problems)
          .where(eq(problems.title, titleToMatch))
          .limit(1);

        const updateData: ProblemUpdate = buildProblemFields(problem);

        if (existingRows[0]?.id) {
          const existingId = existingRows[0].id;

          // Check if problem specifies a round number and get the roundId
          const roundNumber = getRoundNumberFromProblem(problem);
          if (roundNumber !== null) {
            const roundId = roundIdByNumber.get(roundNumber);
            if (roundId) {
              await tx
                .update(problems)
                .set({ ...updateData, roundId })
                .where(eq(problems.id, existingId));
              await syncProblemTestcases(existingId, problem);
              return existingId;
            }
          }

          // Update without changing roundId if no round number specified
          await tx
            .update(problems)
            .set(updateData)
            .where(eq(problems.id, existingId));
          await syncProblemTestcases(existingId, problem);
          return existingId;
        }

        const roundId = await getRoundIdForInsert(problem);
        if (!roundId) {
          throw new Error(
            "Cannot insert new problem because no round exists. Set GHLINKAGE_ROUND_ID or create a round.",
          );
        }

        const insertData: ProblemInsert = {
          ...buildProblemFields(problem),
          roundId,
          initial: 500,
          minimum: 50,
          decay: 25,
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
        return newProblemId;
      };

      for (const entry of created) {
        const upsertedId = await upsertByTitle(entry);
        touchedProblemIds.add(upsertedId);
        summary.created += 1;
      }

      for (const entry of modified) {
        const upsertedId = await upsertByTitle(entry.after, entry.before.title);
        touchedProblemIds.add(upsertedId);
        summary.modified += 1;
      }

      for (const entry of deleted) {
        const title = getDeletedTitle(entry);
        if (!title) {
          summary.skippedDeleted += 1;
          continue;
        }

        const rowsToDelete = await tx
          .select({ id: problems.id })
          .from(problems)
          .where(eq(problems.title, title));
        for (const row of rowsToDelete) {
          deletedProblemIds.add(row.id);
        }

        await tx.delete(problems).where(eq(problems.title, title));
        summary.deleted += 1;
      }
    });

    if (redis) {
      await Promise.all(
        Array.from(touchedProblemIds).map(async (problemId) => {
          const value = await redis.get(problemId);
          if (value === null || value === undefined) {
            await redis.set(problemId, 0);
          }
        }),
      );
      await Promise.all(
        Array.from(deletedProblemIds).map(async (problemId) => {
          await redis.del(problemId);
        }),
      );
    }

    const questionEffectiveSolves = await getQuestionEffectiveSolvesFromRedis();

    return NextResponse.json({
      status: "success",
      summary,
      questionEffectiveSolves,
    });
  } catch (error) {
    console.error("Error processing ghlinkage payload:", error);
    return NextResponse.json(
      { error: "Failed to process ghlinkage payload" },
      { status: 500 },
    );
  }
}
