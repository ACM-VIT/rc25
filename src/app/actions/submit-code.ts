"use server";

import { Redis } from "@upstash/redis";

// Add error handling for Redis initialization
let redis: Redis;
try {
  redis = Redis.fromEnv();
} catch (error) {
  console.error("Redis initialization error:", error);
  throw new Error("Failed to initialize Redis connection");
}

const SUBMISSION_TOKENS_KEY = "submission"; // Prefix for submission IDs

import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/utils/judge0-langs";

interface SubmissionResult {
  status?: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  token?: string;
  [key: string]: unknown;
}

const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILATION_ERROR: 6,
};

async function storeSubmissionToken(submissionId: string, token: string) {
  try {
    const isConnected = await redis.ping();
    console.log("Redis detailed status:", {
      connected: isConnected === "PONG",
      url: process.env.UPSTASH_REDIS_REST_URL ? "Set" : "Missing",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ? "Set" : "Missing"
    });

    // Store as list item
    const submissionData = `${submissionId}:${token}`;
    const pushResult = await redis.rpush(SUBMISSION_TOKENS_KEY, submissionData);
    console.log("Redis push result:", pushResult);

    // Optional: Trim list to keep last N items
    await redis.ltrim(SUBMISSION_TOKENS_KEY, -1000, -1);
    
    return true;
  } catch (error) {
    console.error("Redis operation failed:", error);
    return false;
  }
}

// // Add helper function to get submissions
// async function getSubmissionTokens() {
//   try {
//     const submissions = await redis.lrange(SUBMISSION_TOKENS_KEY, 0, -1);
//     return submissions.map(item => {
//       const [id, token] = item.split(':');
//       return { id, token };
//     });
//   } catch (error) {
//     console.error("Failed to get submissions:", error);
//     return [];
//   }
// }

export async function getSubmission(
  submissionId: string
): Promise<SubmissionResult> {
  const url = `https://judge0-ce.p.sulu.sh/submissions/${submissionId}?base64_encoded=true&fields=*`;
  const options = {
    method: "GET",
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SULU_KEY}`,
    },
  };
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    return { status: { id: 0, description: "API Error" }, error };
  }
}

export async function judgeSolution(
  code: string,
  language: SupportedLanguage,
  stdin: string,
  submissionId: string
) {
  const encodedCode = Buffer.from(code).toString("base64");
  const encodedStdin = Buffer.from(stdin).toString("base64");
  const postUrl =
    "https://judge0-ce.p.sulu.sh/submissions?base64_encoded=true&wait=false&fields=*";

  const postOptions = {
    method: "POST",
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.SULU_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language_id: SUPPORTED_LANGUAGES[language as SupportedLanguage].id,
      source_code: encodedCode,
      stdin: encodedStdin,
    }),
  };

  console.log(language)

  try {
    const postResponse = await fetch(postUrl, postOptions);
    const postResult = await postResponse.json();
    console.log("postResult: ",postResult)
    if (!postResult.token) {
      return { success: false, error: "No submission token received" };
    }

    console.log("postResultWithToken: ",postResult)

    const redisSuccess = await storeSubmissionToken(submissionId, postResult.token);
    if (!redisSuccess) {
      return { success: false, error: "Failed to store submission in Redis" };
    }

    return {
      success: true,
      token: postResult.token
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
      success: result.status?.id === STATUS.ACCEPTED,
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
