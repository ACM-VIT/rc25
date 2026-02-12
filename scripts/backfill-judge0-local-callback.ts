import "dotenv/config";
import { Client } from "pg";
import { PUT as localCallbackPut } from "@/app/judge0/submissions/callback/route";

const DEFAULT_JUDGE0_BASE_URLS = [
  "https://ce.judge0.com",
  "https://extra-ce.judge0.com",
];
const usePublicJudge0Fallback = process.env.JUDGE0_USE_PUBLIC_FALLBACK === "true";

const FINAL_STATUS_IDS = new Set([
  3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
]);

type CliArgs = {
  limit: number | null;
  concurrency: number;
};

const parseArgs = (argv: string[]): CliArgs => {
  const args: CliArgs = { limit: null, concurrency: 4 };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--limit") args.limit = Number(argv[++i] ?? "0");
    else if (arg === "--concurrency") args.concurrency = Number(argv[++i] ?? "4");
  }

  return args;
};

const normalizeBaseUrl = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
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
};

const getJudge0BaseUrls = () => {
  const configured = normalizeBaseUrl(process.env.JUDGE0_BASE_URL);
  return Array.from(
    new Set(
      [
        configured,
        ...(configured && !usePublicJudge0Fallback
          ? []
          : DEFAULT_JUDGE0_BASE_URLS),
      ]
        .filter(Boolean)
        .map((value) => String(value)),
    ),
  );
};

const createJudge0Headers = (): Record<string, string> => {
  const rapidApiKey = process.env.RAPIDAPI_KEY?.trim();
  const rapidApiHost =
    process.env.RAPIDAPI_HOST?.trim() || "judge0-ce.p.rapidapi.com";

  if (rapidApiKey) {
    return {
      Accept: "application/json",
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": rapidApiHost,
    };
  }

  const clientId = process.env.JUDGE0_CLIENT_ID?.trim();
  const clientSecret = process.env.JUDGE0_CLIENT_SECRET?.trim();
  if ((clientId && !clientSecret) || (!clientId && clientSecret)) {
    throw new Error(
      "Set both JUDGE0_CLIENT_ID and JUDGE0_CLIENT_SECRET, or set neither.",
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (clientId && clientSecret) {
    headers["X-Judge0-Client-ID"] = clientId;
    headers["X-Judge0-Client-Secret"] = clientSecret;
  }

  return headers;
};

const requestWithFallback = async (
  path: string,
  init: RequestInit,
): Promise<Response> => {
  let lastError: unknown = null;
  for (const baseUrl of getJudge0BaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}${path}`, init);
      if (response.ok || response.status < 500) return response;
      lastError = new Error(
        `Judge0 request failed ${response.status} ${response.statusText} at ${baseUrl}`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Judge0 request failed");
};

const fetchPendingTokens = async (
  client: Client,
  limit: number | null,
): Promise<string[]> => {
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
  const result = limit ? await client.query(sql, [limit]) : await client.query(sql);
  return result.rows.map((row) => String(row.token));
};

const runWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array(items.length) as R[];
  let nextIndex = 0;

  const runOne = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, () => runOne()),
  );
  return results;
};

const processToken = async (token: string, headers: Record<string, string>) => {
  try {
    const judge0Response = await requestWithFallback(
      `/submissions/${token}?base64_encoded=true&fields=stdout,time,memory,stderr,token,compile_output,message,status`,
      { method: "GET", headers },
    );

    if (!judge0Response.ok) {
      return {
        token,
        state: "poll_error",
        detail: `${judge0Response.status} ${await judge0Response.text()}`,
      };
    }

    const payload = await judge0Response.json();
    const statusId = Number(payload?.status?.id ?? 0);
    if (!FINAL_STATUS_IDS.has(statusId)) {
      return {
        token,
        state: "not_final",
        statusId,
        detail: payload?.status?.description ?? "Unknown",
      };
    }

    const request = new Request("http://local/judge0/submissions/callback", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const callbackResponse = await localCallbackPut(request as never);
    const callbackText = await callbackResponse.text();
    if (!callbackResponse.ok) {
      return {
        token,
        state: "callback_error",
        detail: `${callbackResponse.status} ${callbackText}`,
      };
    }

    return { token, state: "replayed", detail: callbackText.slice(0, 120) };
  } catch (error) {
    return {
      token,
      state: "worker_error",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const headers = createJudge0Headers();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const before = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM "SubmissionTestcase" st
    JOIN "Submission" s ON s.id = st."submissionId"
    WHERE s.evaluated=false AND st.evaluated=false AND st.token NOT LIKE 'pending_%'
  `);
  const beforeCount = Number(before.rows[0]?.count ?? 0);
  console.log(`Pending tokenized testcases before local replay: ${beforeCount}`);

  const tokens = await fetchPendingTokens(client, args.limit);
  console.log(`Tokens to process locally: ${tokens.length}`);

  let processed = 0;
  const results = await runWithConcurrency(tokens, args.concurrency, async (token) => {
    const result = await processToken(token, headers);
    processed += 1;
    if (processed % 20 === 0 || processed === tokens.length) {
      console.log(`Progress: ${processed}/${tokens.length}`);
    }
    return result;
  });

  const summary = {
    replayed: 0,
    not_final: 0,
    poll_error: 0,
    callback_error: 0,
    worker_error: 0,
  };

  for (const result of results) {
    if (result.state in summary) {
      summary[result.state as keyof typeof summary] += 1;
    }
  }

  console.log("Summary:");
  console.log(JSON.stringify(summary, null, 2));

  const failures = results.filter((result) => result.state !== "replayed");
  if (failures.length) {
    console.log("Sample failures:");
    for (const failure of failures.slice(0, 10)) {
      console.log(`${failure.token} | ${failure.state} | ${failure.detail ?? ""}`);
    }
  }

  const after = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM "SubmissionTestcase" st
    JOIN "Submission" s ON s.id = st."submissionId"
    WHERE s.evaluated=false AND st.evaluated=false AND st.token NOT LIKE 'pending_%'
  `);
  const afterCount = Number(after.rows[0]?.count ?? 0);

  console.log(`Pending tokenized testcases after local replay: ${afterCount}`);
  console.log(`Delta: ${beforeCount - afterCount}`);

  await client.end();
};

main().catch((error) => {
  console.error("Local replay failed:", error);
  process.exit(1);
});
