import "dotenv/config";
import { Client } from "pg";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/utils/judge0-langs";
import {
  pythonFunction,
  cFunction,
  cppFunction,
  javaFunction,
  jsFunction,
  goFunction,
  rustFunction,
} from "@/utils/funcconvert";

type CliArgs = {
  limit: number | null;
  concurrency: number;
  callbackUrl: string;
};

const DEFAULT_JUDGE0_BASE_URLS = [
  "https://ce.judge0.com",
  "https://extra-ce.judge0.com",
];

const parseArgs = (argv: string[]): CliArgs => {
  const args: CliArgs = {
    limit: null,
    concurrency: 3,
    callbackUrl:
      process.env.JUDGE0_CALLBACK_URL ||
      "https://portal.acmvit.in/judge0/submissions/callback",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--limit") args.limit = Number(argv[++i] ?? "0");
    else if (arg === "--concurrency") args.concurrency = Number(argv[++i] ?? "3");
    else if (arg === "--callback-url") args.callbackUrl = argv[++i] ?? args.callbackUrl;
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
      [configured, ...DEFAULT_JUDGE0_BASE_URLS]
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
      "Content-Type": "application/json",
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": rapidApiHost,
    };
  }

  const clientId = process.env.JUDGE0_CLIENT_ID?.trim();
  const clientSecret = process.env.JUDGE0_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Missing Judge0 credentials");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Judge0-Client-ID": clientId,
    "X-Judge0-Client-Secret": clientSecret,
  };
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
        `Judge0 request failed ${response.status} ${response.statusText} (${baseUrl})`,
      );
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Judge0 request failed");
};

const languageTemplates: Record<SupportedLanguage, (code: string) => string> = {
  python: pythonFunction,
  c: cFunction,
  cpp: cppFunction,
  java: javaFunction,
  javascript: jsFunction,
  go: goFunction,
  rust: rustFunction,
};

const removeDuplicateImports = (
  code: string,
  language: SupportedLanguage,
): string => {
  const importPatterns: Partial<Record<SupportedLanguage, RegExp[]>> = {
    cpp: [/#include\s*<[^>]+>/g],
    java: [/import\s+[^;]+;/g],
    python: [/^from\s+[\w.]+\s+import\s+.*$/gm, /^import\s+.*$/gm],
    go: [/^import\s*\([^)]*\)/gm, /^import\s+".*?"$/gm],
    rust: [
      /^use\s+[^;]+;/gm,
      /^use\s+[^{]+\{[^}]+\};/gm,
      /^use\s+[^:]+::[^;]+;/gm,
    ],
  };

  if (!importPatterns[language]) return code;

  const patterns = importPatterns[language] || [];
  const allImports = new Set<string>();

  let cleanCode = code;
  for (const pattern of patterns) {
    const matches = cleanCode.match(pattern) || [];
    for (const match of matches) allImports.add(match.trim());
    cleanCode = cleanCode.replace(pattern, "");
  }

  let importSection = "";
  if (language === "go" && allImports.size > 0) {
    importSection = `import (\n  ${Array.from(allImports).join("\n  ")}\n)\n`;
  } else if (allImports.size > 0) {
    importSection = `${Array.from(allImports).join("\n")}\n`;
  }

  return importSection + cleanCode.trim();
};

type PlaceholderSubmission = {
  id: string;
  code: string;
  language: SupportedLanguage;
};

type SubmissionTestcase = {
  submissionTestcaseId: string;
  input: string;
  orderIndex: number;
};

const fetchPlaceholderSubmissions = async (
  client: Client,
  limit: number | null,
): Promise<PlaceholderSubmission[]> => {
  const sql = `
    SELECT s.id, s.code, s.language
    FROM "Submission" s
    JOIN "SubmissionTestcase" st ON st."submissionId" = s.id
    WHERE s.evaluated = false
    GROUP BY s.id, s.code, s.language
    HAVING BOOL_AND(st.token LIKE 'pending_%')
    ORDER BY s."createdAt"
    ${limit ? "LIMIT $1" : ""}
  `;

  const result = limit ? await client.query(sql, [limit]) : await client.query(sql);
  return result.rows as PlaceholderSubmission[];
};

const fetchSubmissionTestcases = async (
  client: Client,
  submissionId: string,
): Promise<SubmissionTestcase[]> => {
  const result = await client.query(
    `
      SELECT
        st.id AS "submissionTestcaseId",
        tc.input,
        tc."orderIndex"
      FROM "SubmissionTestcase" st
      JOIN "Testcase" tc ON tc.id = st."testcaseId"
      WHERE st."submissionId" = $1
      ORDER BY tc."orderIndex" ASC
    `,
    [submissionId],
  );

  return result.rows as SubmissionTestcase[];
};

const requeueSubmission = async (
  client: Client,
  submission: PlaceholderSubmission,
  callbackUrl: string,
  headers: Record<string, string>,
) => {
  const tcRows = await fetchSubmissionTestcases(client, submission.id);
  if (!tcRows.length) {
    return { submissionId: submission.id, state: "skipped", detail: "No testcases" };
  }

  const language = submission.language;
  const languageConfig = SUPPORTED_LANGUAGES[language];
  if (!languageConfig) {
    return {
      submissionId: submission.id,
      state: "error",
      detail: `Unsupported language ${language}`,
    };
  }

  const templateFunction = languageTemplates[language];
  const transformedCode = removeDuplicateImports(
    templateFunction(submission.code),
    language,
  );
  const encodedCode = Buffer.from(transformedCode, "utf-8").toString("base64");

  const judge0Submissions = tcRows.map((tc) => ({
    language_id: languageConfig.id,
    source_code: encodedCode,
    stdin: Buffer.from(tc.input ?? "", "utf-8").toString("base64"),
    callback_url: callbackUrl,
  }));

  const response = await requestWithFallback("/submissions/batch?base64_encoded=true", {
    method: "POST",
    headers,
    body: JSON.stringify({ submissions: judge0Submissions }),
  });

  if (!response.ok) {
    return {
      submissionId: submission.id,
      state: "error",
      detail: `${response.status} ${await response.text()}`,
    };
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length !== tcRows.length) {
    return {
      submissionId: submission.id,
      state: "error",
      detail: `Token count mismatch: expected ${tcRows.length}, got ${Array.isArray(payload) ? payload.length : "invalid payload"}`,
    };
  }

  const tokens = payload
    .map((item: { token?: string }) => item?.token)
    .filter((token): token is string => Boolean(token));

  if (tokens.length !== tcRows.length) {
    return {
      submissionId: submission.id,
      state: "error",
      detail: `Missing tokens: expected ${tcRows.length}, got ${tokens.length}`,
    };
  }

  await client.query("BEGIN");
  try {
    for (let i = 0; i < tcRows.length; i++) {
      await client.query(
        `UPDATE "SubmissionTestcase" SET token = $1 WHERE id = $2`,
        [tokens[i], tcRows[i].submissionTestcaseId],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }

  return {
    submissionId: submission.id,
    state: "requeued",
    detail: `${tokens.length} tokens assigned`,
  };
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
    WHERE s.evaluated=false AND st.evaluated=false AND st.token LIKE 'pending_%'
  `);
  const beforeCount = Number(before.rows[0]?.count ?? 0);
  console.log(`Placeholder pending testcases before requeue: ${beforeCount}`);

  const submissions = await fetchPlaceholderSubmissions(client, args.limit);
  console.log(`Placeholder submissions to requeue: ${submissions.length}`);
  console.log(`Callback URL: ${args.callbackUrl}`);

  let processed = 0;
  const results = await runWithConcurrency(
    submissions,
    args.concurrency,
    async (submission) => {
      try {
        const result = await requeueSubmission(
          client,
          submission,
          args.callbackUrl,
          headers,
        );
        processed += 1;
        if (processed % 10 === 0 || processed === submissions.length) {
          console.log(`Progress: ${processed}/${submissions.length}`);
        }
        return result;
      } catch (error) {
        processed += 1;
        return {
          submissionId: submission.id,
          state: "error",
          detail: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );

  const summary = {
    requeued: 0,
    skipped: 0,
    error: 0,
  };

  for (const result of results) {
    if (result.state in summary) {
      summary[result.state as keyof typeof summary] += 1;
    }
  }

  console.log("Summary:");
  console.log(JSON.stringify(summary, null, 2));

  const errors = results.filter((result) => result.state === "error");
  if (errors.length) {
    console.log("Sample errors:");
    for (const error of errors.slice(0, 10)) {
      console.log(`${error.submissionId} | ${error.detail}`);
    }
  }

  const after = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM "SubmissionTestcase" st
    JOIN "Submission" s ON s.id = st."submissionId"
    WHERE s.evaluated=false AND st.evaluated=false AND st.token LIKE 'pending_%'
  `);
  const afterCount = Number(after.rows[0]?.count ?? 0);
  console.log(`Placeholder pending testcases after requeue: ${afterCount}`);
  console.log(`Delta: ${beforeCount - afterCount}`);

  await client.end();
};

main().catch((error) => {
  console.error("Requeue failed:", error);
  process.exit(1);
});
