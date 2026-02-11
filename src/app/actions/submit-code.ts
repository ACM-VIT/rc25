"use server";

import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/utils/judge0-langs";
import { firestoreService } from "@/lib/firebase-admin-service";

const DEFAULT_JUDGE0_BASE_URLS = [
  "https://ce.judge0.com",
  "https://extra-ce.judge0.com",
];

const JUDGE0_BASE_URLS = Array.from(
  new Set(
    [
      process.env.JUDGE0_BASE_URL?.replace(/\/$/, ""),
      ...DEFAULT_JUDGE0_BASE_URLS,
    ]
      .filter(Boolean)
      .map(String),
  ),
);

function createJudge0Headers(
  includeContentType = false,
): Record<string, string> {
  const clientId = process.env.JUDGE0_CLIENT_ID;
  const clientSecret = process.env.JUDGE0_CLIENT_SECRET;

  if (!clientId) {
    throw new Error(
      "JUDGE0_CLIENT_ID is not defined in environment variables.",
    );
  }

  if (!clientSecret) {
    throw new Error(
      "JUDGE0_CLIENT_SECRET is not defined in environment variables.",
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Judge0-Client-ID": clientId,
    "X-Judge0-Client-Secret": clientSecret,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function requestWithFallback(
  path: string,
  init: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (const baseUrl of JUDGE0_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, init);

      if (response.ok || response.status < 500) {
        return response;
      }

      lastError = new Error(
        `Judge0 request failed with status ${response.status} (${response.statusText})`,
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to reach Judge0 endpoints");
}

export async function judgeSolution(
  code: string,
  language: SupportedLanguage,
  stdin: string[],
  submissionId: string,
  callbackUrls?: string[],
) {
  if (!process.env.HOST) {
    throw new Error("HOST is not defined in environment variables.");
  }

  if (callbackUrls && callbackUrls.length !== stdin.length) {
    return {
      success: false,
      error: "Callback URL count does not match number of stdin entries",
    };
  }

  const encodedCode = Buffer.from(code ?? "", "utf-8").toString("base64");
  const submissionsPath = "/submissions/batch?base64_encoded=true";
  const defaultCallbackUrl = `https://${process.env.HOST}/judge0/submissions/callback`;
  const submissions = (stdin ?? []).map((input, index) => ({
    language_id: SUPPORTED_LANGUAGES[language as SupportedLanguage].id,
    source_code: encodedCode,
    stdin: Buffer.from(input ?? "", "utf-8").toString("base64"),
    callback_url: callbackUrls?.[index] ?? defaultCallbackUrl,
  }));

  if (submissions.length === 0) {
    return { success: false, error: "No stdin entries provided" };
  }

  const postOptions = {
    method: "POST",
    headers: {
      ...createJudge0Headers(true),
    },
    body: JSON.stringify({
      submissions,
    }),
  };

  try {
    const postResponse = await requestWithFallback(
      submissionsPath,
      postOptions,
    );
    if (!postResponse.ok) {
      const errorPayload = await postResponse.text();
      throw new Error(
        `Judge0 submission failed with status ${postResponse.status}: ${errorPayload}`,
      );
    }
    const postResult = await postResponse.json();
    if (!Array.isArray(postResult) || postResult.length === 0) {
      return { success: false, error: "No submission tokens received" };
    }

    const tokens = postResult
      .map((item) => item?.token)
      .filter((token): token is string => Boolean(token));

    if (tokens.length === 0) {
      return { success: false, error: "No submission tokens received" };
    }

    await firestoreService.submissions.created(submissionId);
    return {
      success: true,
      tokens,
    };
  } catch (error) {
    console.error("Submission error:", error);
    return {
      success: false,
      error: `Submission failed: ${(error as Error).message}`,
    };
  }
}
