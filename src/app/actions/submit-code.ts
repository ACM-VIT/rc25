"use server";

import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/utils/judge0-langs";
import { firestoreService } from "@/lib/firebase-admin-service";
import { Judge0StatusEnum } from "@/utils/judge0-status";
import {
  Judge0Error,
  Judge0Response,
} from "../@landing/judge0/submissions/callback/route";

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

export async function getSubmission(
  submissionId: string,
): Promise<Judge0Response | Judge0Error> {
  const path = `/submissions/${submissionId}?base64_encoded=true&fields=*`;
  const options = {
    method: "GET",
    headers: {
      ...createJudge0Headers(),
    },
  };
  try {
    const response = await requestWithFallback(path, options);
    return await response.json();
  } catch (error) {
    return {
      Judg,
    };
  }
}

export async function judgeSolution(
  code: string,
  language: SupportedLanguage,
  stdin: string,
  submissionId: string,
) {
  if (!process.env.HOST) {
    throw new Error("HOST is not defined in environment variables.");
  }

  const encodedCode = Buffer.from(code ?? "", "utf-8").toString("base64");
  const encodedStdin = Buffer.from(stdin ?? "", "utf-8").toString("base64");
  const submissionsPath =
    "/submissions/batch?base64_encoded=true&wait=false&fields=*";

  const postOptions = {
    method: "POST",
    headers: {
      ...createJudge0Headers(true),
    },
    body: JSON.stringify({
      language_id: SUPPORTED_LANGUAGES[language as SupportedLanguage].id,
      source_code: encodedCode,
      stdin: encodedStdin,
      callback_url: `https://${process.env.HOST}/judge0/submissions/callback`,
    }),
  };

  // console.log(language)

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
    // console.log("postResult: ", postResult)
    if (!postResult.token) {
      return { success: false, error: "No submission token received" };
    }

    // console.log("postResultWithToken: ", postResult)

    await firestoreService.submissions.created(submissionId);
    return {
      success: true,
      token: postResult.token,
    };
  } catch (error) {
    console.error("Submission error:", error);
    return {
      success: false,
      error: `Submission failed: ${(error as Error).message}`,
    };
  }
}

export async function checkSubmissionStatus(token: string) {
  try {
    const result = await getSubmission(token);
    return {
      success: result.status?.id === Judge0StatusEnum.Accepted,
      status: result.status,
      output: result.stdout,
      error: result.stderr || result.compile_output || result.message,
    };
  } catch (error) {
    return {
      success: false,
      error: `Status check failed: ${(error as Error).name}`,
    };
  }
}
