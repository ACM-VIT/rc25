"use server";

import { start } from "workflow/api";
import {
  submissionWorkflow,
  type SubmissionInput,
} from "@/workflows/submission";
import { db } from "@/db";
import { problems, rounds, teams, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SupportedLanguage } from "@/utils/judge0-langs";

export default async function createSubmission(data: {
  code: string;
  problemId: string;
  userId: string;
  language: SupportedLanguage;
}) {
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

    // Start the submission workflow – it runs asynchronously through:
    //   Step 1: fetch data + create DB records
    //   Webhook creation + Step 2: send to Judge0
    //   Webhook await: suspend until all Judge0 callbacks arrive
    //   Step 3: evaluate results + update leaderboard
    const workflowInput: SubmissionInput = {
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
      submission: {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        evaluated: false,
        testcasesPassed: 0,
        totalTestcases,
        user: { name: user?.name ?? null },
      },
    };
  } catch (error: unknown) {
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
