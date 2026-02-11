import { createWebhook } from "workflow";
import {
    initializeSubmission,
    submitTestcaseToJudge0,
    evaluateAndStore,
    type SubmissionInput,
    type Judge0WebhookResult,
} from "./steps";

/**
 * Submission workflow: orchestrates the full lifecycle of a code submission.
 *
 * Step 1 (initializeSubmission): Fetches problem data, validates user/team,
 *   selects testcases, creates the submission record, and serializes all
 *   context needed for evaluation.
 *
 * Step 2 (per-testcase Judge0 submission): For each testcase, creates a
 *   webhook endpoint and submits the code to Judge0 with that webhook as the
 *   callback URL. All webhooks are awaited in parallel via Promise.all.
 *
 * Step 3 (evaluateAndStore): Using the serialized context from step 1 and
 *   the Judge0 results from step 2, compares outputs, calculates scores,
 *   updates the submission and team records, and notifies Firebase — with no
 *   repeated database reads for problem/testcase data.
 */
export async function submissionWorkflow(data: SubmissionInput) {
    "use workflow";

    // Step 1: Fetch all data, validate, create submission, serialize context
    const context = await initializeSubmission(data);

    // Step 2: Create webhooks and submit each testcase to Judge0 in parallel
    const results = await Promise.all(
        context.testcases.map(async (tc) => {
            // Create a webhook that auto-responds to Judge0's PUT callback
            const webhook = createWebhook({
                respondWith: Response.json({ success: true }),
            });

            // Submit this testcase to Judge0 with the webhook URL as callback
            await submitTestcaseToJudge0({
                transformedCode: context.transformedCode,
                languageId: context.languageId,
                input: tc.input,
                webhookUrl: webhook.url,
            });

            // Suspend until Judge0 calls back with the result
            const callbackRequest = await webhook;
            const body: Judge0WebhookResult = await callbackRequest.json();
            return body;
        })
    );

    // Step 3: Evaluate results and store scores (no repeated DB reads)
    await evaluateAndStore({ context, results });
}
