"use server";

import { createHash } from "node:crypto";
import { start } from "workflow/api";
import {
  submissionWorkflow,
  type SubmissionInput,
} from "@/workflows/submission";
import { db } from "@/db";
import { problems, rounds, submissions, teams, users } from "@/db/schema";
import { getRedis } from "@/lib/redis";
import { and, desc, eq, gt } from "drizzle-orm";
import type { SupportedLanguage } from "@/utils/judge0-langs";

const SUBMISSION_DEDUPE_WINDOW_SECONDS = 15;
const SUBMISSION_DEDUPE_WINDOW_MS = SUBMISSION_DEDUPE_WINDOW_SECONDS * 1000;

type OptimisticSubmission = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  evaluated: boolean;
  testcasesPassed: number;
  totalTestcases: number;
  user: { name: string | null };
};

const buildOptimisticSubmission = ({
  id,
  totalTestcases,
  userName,
  createdAt = new Date(),
  updatedAt = new Date(),
  evaluated = false,
  testcasesPassed = 0,
}: {
  id: string;
  totalTestcases: number;
  userName: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  evaluated?: boolean;
  testcasesPassed?: number;
}): OptimisticSubmission => ({
  id,
  createdAt,
  updatedAt,
  evaluated,
  testcasesPassed,
  totalTestcases,
  user: { name: userName },
});

const buildSubmissionDedupeKey = ({
  userId,
  problemId,
  language,
  code,
}: {
  userId: string;
  problemId: string;
  language: SupportedLanguage;
  code: string;
}) => {
  const hash = createHash("sha256")
    .update(`${userId}:${problemId}:${language}:${code}`)
    .digest("hex");

  return `submission:dedupe:${hash}`;
};

export default async function createSubmission(data: {
  code: string;
  problemId: string;
  userId: string;
  language: SupportedLanguage;
}) {
  const redis = getRedis();
  let dedupeKey: string | null = null;
  let dedupeLockHeld = false;

  try {
    // Quick validation for immediate UI feedback – the workflow's step 1
    // performs the same checks, but doing them here lets us return errors
    // synchronously to the client without starting a workflow run.
    const problemRows = await db
      .select({ problem: problems, round: rounds })
      .from(problems)
      .leftJoin(rounds, eq(problems.roundId, rounds.id))
      .where(eq(problems.id, data.problemId))
      .limit(1);

    const problem = problemRows[0]?.problem ?? null;
    const round = problemRows[0]?.round ?? null;

    if (!problem || !round) {
      throw new Error("Problem not found");
    }

    const userRows = await db
      .select({ user: users, team: teams })
      .from(users)
      .leftJoin(teams, eq(users.teamId, teams.id))
      .where(eq(users.id, data.userId))
      .limit(1);

    const user = userRows[0]?.user ?? null;
    const userTeam = userRows[0]?.team ?? null;

    if (!userTeam) {
      throw new Error("User is not part of any team");
    }

    if (userTeam.disqualify) {
      throw new Error("User's team has been disqualified");
    }

    if (userTeam.id !== process.env.ADMIN_TEAM_ID) {
      const now = new Date();
      if (now < round.start) {
        throw new Error("Round has not started yet");
      }
      if (now > round.end) {
        throw new Error("Round has ended");
      }
    }

    const totalTestcases = problem.normal_cases + problem.edge_cases;
    const duplicateCutoff = new Date(Date.now() - SUBMISSION_DEDUPE_WINDOW_MS);

    const findRecentDuplicate = async () => {
      const recentDuplicateRows = await db
        .select({
          id: submissions.id,
          createdAt: submissions.createdAt,
          updatedAt: submissions.updatedAt,
          evaluated: submissions.evaluated,
          testcasesPassed: submissions.testcasesPassed,
        })
        .from(submissions)
        .where(
          and(
            eq(submissions.userId, data.userId),
            eq(submissions.problemId, data.problemId),
            eq(submissions.teamId, userTeam.id),
            eq(submissions.language, data.language),
            eq(submissions.code, data.code),
            eq(submissions.evaluated, false),
            gt(submissions.createdAt, duplicateCutoff),
          ),
        )
        .orderBy(desc(submissions.createdAt))
        .limit(1);

      return recentDuplicateRows[0] ?? null;
    };

    const recentDuplicate = await findRecentDuplicate();
    if (recentDuplicate) {
      return {
        success: true,
        submission: buildOptimisticSubmission({
          id: recentDuplicate.id,
          createdAt: recentDuplicate.createdAt,
          updatedAt: recentDuplicate.updatedAt,
          evaluated: recentDuplicate.evaluated,
          testcasesPassed: recentDuplicate.testcasesPassed,
          totalTestcases,
          userName: user?.name ?? null,
        }),
      };
    }

    dedupeKey = buildSubmissionDedupeKey({
      userId: data.userId,
      problemId: data.problemId,
      language: data.language,
      code: data.code,
    });

    if (redis) {
      try {
        const lockResult = await redis.set(dedupeKey, "1", {
          nx: true,
          ex: SUBMISSION_DEDUPE_WINDOW_SECONDS,
        });

        if (lockResult !== "OK") {
          const lockedDuplicate = await findRecentDuplicate();
          if (lockedDuplicate) {
            return {
              success: true,
              submission: buildOptimisticSubmission({
                id: lockedDuplicate.id,
                createdAt: lockedDuplicate.createdAt,
                updatedAt: lockedDuplicate.updatedAt,
                evaluated: lockedDuplicate.evaluated,
                testcasesPassed: lockedDuplicate.testcasesPassed,
                totalTestcases,
                userName: user?.name ?? null,
              }),
            };
          }

          return {
            success: false,
            error:
              "A matching submission is already being processed. Please wait a few seconds and retry.",
          };
        }

        dedupeLockHeld = true;
      } catch (redisError) {
        console.error("Submission dedupe lock unavailable, continuing", redisError);
      }
    }

    // Start the submission workflow – it runs asynchronously through:
    //   Step 1: fetch data + create DB records
    //   Webhook creation + Step 2: send to Judge0
    //   Webhook await: suspend until all Judge0 callbacks arrive
    //   Step 3: evaluate results + update leaderboard
    const submissionId = crypto.randomUUID();
    const workflowInput: SubmissionInput = {
      submissionId,
      code: data.code,
      problemId: data.problemId,
      userId: data.userId,
      language: data.language,
    };

    await start(submissionWorkflow, [workflowInput]);

    // Return an optimistic response to the UI. The actual submission record
    // is created inside the workflow's step 1; the UI tracks completion via
    // Firestore listeners (submissions.created → submissions.processed).
    return {
      success: true,
      submission: buildOptimisticSubmission({
        id: submissionId,
        totalTestcases,
        userName: user?.name ?? null,
      }),
    };
  } catch (error: unknown) {
    if (dedupeLockHeld && dedupeKey && redis) {
      try {
        await redis.del(dedupeKey);
      } catch (redisError) {
        console.error("Failed to release submission dedupe lock", redisError);
      }
    }

    console.error(
      "Error creating submission:",
      error instanceof Error ? error : String(error),
    );

    return {
      success: false,
      error: `Submission creation failed: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
    };
  }
}
