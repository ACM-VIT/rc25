"use server";

import { start } from "workflow/api";
import { prisma } from "@/utils/prisma";
import type { SupportedLanguage } from "@/utils/judge0-langs";
import { submissionWorkflow } from "@/workflows/submission";

export default async function createSubmission(data: {
    code: string;
    problemId: string;
    userId: string;
    language: SupportedLanguage;
}) {
    try {
        // Quick validation before starting the workflow so the user gets
        // immediate feedback for obvious errors (wrong problem, no team, etc.)
        const problem = await prisma.problem.findUnique({
            relationLoadStrategy: "join",
            where: { id: data.problemId },
            include: {
                round: {
                    select: { start: true, end: true, number: true },
                },
            },
        });

        if (!problem) {
            throw new Error("Problem not found");
        }

        const user = await prisma.user.findUnique({
            relationLoadStrategy: "join",
            where: { id: data.userId },
            include: { Team: true },
        });

        const userTeam = user?.Team;

        if (!userTeam) {
            throw new Error("User is not part of any team");
        }

        if (userTeam.disqualify) {
            throw new Error("User's team has been disqualified");
        }

        if (userTeam.id !== process.env.ADMIN_TEAM_ID) {
            const currentTime = new Date();
            if (currentTime < problem.round.start) {
                throw new Error("Round has not started yet");
            }
            if (currentTime > problem.round.end) {
                throw new Error("Round has ended");
            }
        }

        // Pre-generate the submission ID so we can return it to the frontend
        // for Firebase real-time subscription before the workflow creates it.
        const submissionId = crypto.randomUUID();

        // Start the durable workflow — it will handle testcase selection,
        // submission creation, Judge0 submissions, and evaluation.
        await start(submissionWorkflow, [
            { ...data, submissionId },
        ]);

        // Return a response with the known submission ID. The frontend uses
        // this to subscribe to Firebase for real-time evaluation updates.
        return {
            success: true,
            submission: {
                id: submissionId,
                code: data.code,
                problemId: data.problemId,
                userId: data.userId,
                score: 0,
                testcasespassed: [] as boolean[],
                evaluated: false,
                evaluationStatus: null,
                token: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: { name: user.name },
            },
        };
    } catch (error: unknown) {
        console.error(
            "Error creating submission:",
            error instanceof Error ? error : String(error)
        );

        return {
            success: false,
            error: `Submission creation failed: ${
                error instanceof Error ? error.message : "Unknown error occurred"
            }`,
        };
    }
}
