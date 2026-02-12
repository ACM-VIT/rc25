#!/usr/bin/env node
import "dotenv/config";
import { Client } from "pg";

const DEFAULT_JUDGE0_BASE_URLS = [
  "https://ce.judge0.com",
  "https://extra-ce.judge0.com",
];

const FINAL_STATUS_IDS = new Set([
  3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
]);

function parseArgs(argv) {
  const args = {
    limit: null,
    concurrency: 8,
    dryRun: false,
    callbackUrl:
      process.env.JUDGE0_CALLBACK_URL ||
      (process.env.HOST
        ? `https://${process.env.HOST}/judge0/submissions/callback`
        : "https://portal.acmvit.in/judge0/submissions/callback"),
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--limit") args.limit = Number(argv[++i] ?? "0");
    else if (arg === "--concurrency")
      args.concurrency = Number(argv[++i] ?? "8");
    else if (arg === "--callback-url") args.callbackUrl = argv[++i] ?? "";
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--help" || arg === "-h") {
      printHelpAndExit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      printHelpAndExit(1);
    }
  }

  return args;
}

function printHelpAndExit(code) {
  console.log(`Backfill Judge0 callbacks for pending submissions.

Usage:
  node scripts/backfill-judge0-callbacks.mjs [options]

Options:
  --limit <n>          Process only first n pending tokens
  --concurrency <n>    Parallel workers (default: 8)
  --callback-url <u>   Callback endpoint to replay results
  --dry-run            Fetch Judge0 statuses but do not call callback
  --help               Show this help
`);
  process.exit(code);
}

function normalizeBaseUrl(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

function getJudge0BaseUrls() {
  const configured = normalizeBaseUrl(process.env.JUDGE0_BASE_URL);
  return Array.from(
    new Set(
      [configured, ...DEFAULT_JUDGE0_BASE_URLS]
        .filter(Boolean)
        .map((value) => String(value)),
    ),
  );
}

function createJudge0Headers() {
  const rapidApiKey = process.env.RAPIDAPI_KEY?.trim();
  const rapidApiHost =
    process.env.RAPIDAPI_HOST?.trim() ||
    (normalizeBaseUrl(process.env.JUDGE0_BASE_URL)
      ? new URL(normalizeBaseUrl(process.env.JUDGE0_BASE_URL)).host
      : "judge0-ce.p.rapidapi.com");

  if (rapidApiKey) {
    return {
      Accept: "application/json",
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": rapidApiHost,
    };
  }

  const clientId = process.env.JUDGE0_CLIENT_ID?.trim();
  const clientSecret = process.env.JUDGE0_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Judge0 credentials. Set RAPIDAPI_KEY (+RAPIDAPI_HOST) or JUDGE0_CLIENT_ID + JUDGE0_CLIENT_SECRET.",
    );
  }

  return {
    Accept: "application/json",
    "X-Judge0-Client-ID": clientId,
    "X-Judge0-Client-Secret": clientSecret,
  };
}

async function requestWithFallback(path, init) {
  const baseUrls = getJudge0BaseUrls();
  let lastError = null;

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}${path}`, init);
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(
        `Judge0 request failed: ${response.status} ${response.statusText} (${baseUrl})`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Judge0 request failed on all base URLs");
}

async function fetchPendingTokens(client, limit) {
  const sql = `
    SELECT DISTINCT st.token
    FROM "SubmissionTestcase" st
    JOIN "Submission" s ON s.id = st."submissionId"
    WHERE s.evaluated = false
      AND st.evaluated = false
      AND st.token NOT LIKE 'pending_%'
    ORDER BY st.token
    ${limit ? "LIMIT $1" : ""}
  `;
  const result = limit
    ? await client.query(sql, [limit])
    : await client.query(sql);
  return result.rows.map((row) => row.token).filter(Boolean);
}

async function processToken(token, callbackUrl, dryRun, headers) {
  const pollResponse = await requestWithFallback(
    `/submissions/${token}?base64_encoded=true&fields=stdout,time,memory,stderr,token,compile_output,message,status`,
    {
      method: "GET",
      headers,
    },
  );

  if (!pollResponse.ok) {
    const body = await pollResponse.text();
    return { token, state: "poll_error", detail: `${pollResponse.status} ${body}` };
  }

  const payload = await pollResponse.json();
  const statusId = Number(payload?.status?.id ?? 0);
  const statusDescription = payload?.status?.description ?? "Unknown";

  if (!FINAL_STATUS_IDS.has(statusId)) {
    return { token, state: "not_final", statusId, statusDescription };
  }

  if (dryRun) {
    return { token, state: "dry_run_final", statusId, statusDescription };
  }

  const cbResponse = await fetch(callbackUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const cbText = await cbResponse.text();
  if (!cbResponse.ok) {
    return {
      token,
      state: "callback_error",
      statusId,
      statusDescription,
      detail: `${cbResponse.status} ${cbText}`,
    };
  }

  return {
    token,
    state: "replayed",
    statusId,
    statusDescription,
    detail: cbText.slice(0, 120),
  };
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runOne() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        results[index] = {
          token: items[index],
          state: "worker_error",
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.max(1, concurrency); i++) workers.push(runOne());
  await Promise.all(workers);
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const headers = createJudge0Headers();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }

  const dbClient = new Client({ connectionString: process.env.DATABASE_URL });
  await dbClient.connect();

  const before = await dbClient.query(`
    SELECT
      COUNT(*) FILTER (WHERE s.evaluated = false AND st.evaluated = false AND st.token NOT LIKE 'pending_%') AS tokenized_pending_testcases
    FROM "Submission" s
    JOIN "SubmissionTestcase" st ON st."submissionId" = s.id
  `);

  const pendingBefore = Number(before.rows[0]?.tokenized_pending_testcases ?? 0);
  console.log(
    `Pending tokenized testcases before backfill: ${pendingBefore.toLocaleString()}`,
  );

  const tokens = await fetchPendingTokens(dbClient, args.limit);
  console.log(`Tokens to inspect: ${tokens.length.toLocaleString()}`);
  console.log(`Callback URL: ${args.callbackUrl}`);
  console.log(`Dry run: ${args.dryRun ? "yes" : "no"}`);
  console.log(`Concurrency: ${args.concurrency}`);

  let processed = 0;
  const summary = {
    replayed: 0,
    dry_run_final: 0,
    not_final: 0,
    poll_error: 0,
    callback_error: 0,
    worker_error: 0,
  };

  const results = await runWithConcurrency(
    tokens,
    async (token) => {
      const result = await processToken(
        token,
        args.callbackUrl,
        args.dryRun,
        headers,
      );
      processed += 1;
      if (processed % 100 === 0 || processed === tokens.length) {
        console.log(`Progress: ${processed}/${tokens.length}`);
      }
      return result;
    },
    args.concurrency,
  );

  for (const result of results) {
    if (!result) continue;
    if (result.state in summary) summary[result.state] += 1;
  }

  const failures = results.filter(
    (result) =>
      result?.state === "poll_error" ||
      result?.state === "callback_error" ||
      result?.state === "worker_error",
  );

  console.log("Summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (failures.length > 0) {
    console.log("Sample failures:");
    for (const failure of failures.slice(0, 10)) {
      console.log(
        `${failure.token} | ${failure.state} | ${failure.detail ?? "no detail"}`,
      );
    }
  }

  const after = await dbClient.query(`
    SELECT
      COUNT(*) FILTER (WHERE s.evaluated = false AND st.evaluated = false AND st.token NOT LIKE 'pending_%') AS tokenized_pending_testcases
    FROM "Submission" s
    JOIN "SubmissionTestcase" st ON st."submissionId" = s.id
  `);

  const pendingAfter = Number(after.rows[0]?.tokenized_pending_testcases ?? 0);
  console.log(
    `Pending tokenized testcases after backfill: ${pendingAfter.toLocaleString()}`,
  );
  console.log(
    `Delta: ${(pendingBefore - pendingAfter).toLocaleString()} testcase rows resolved`,
  );

  await dbClient.end();
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
