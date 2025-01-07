"use server";

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

export async function getSubmission(
  submissionId: string
): Promise<SubmissionResult> {
  const url = `https://judge0-ce.p.rapidapi.com/submissions/${submissionId}?base64_encoded=true&fields=*`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    return { status: { id: 0, description: "API Error" }, error };
  }
}

export async function submitSolution(
  code: string,
  problemId: string,
  language = "python",
  _expectedOutput = "hello",
  stdin = ""
) {
  const encodedCode = Buffer.from(code).toString("base64");
  const encodedExpectedOutput = Buffer.from(_expectedOutput).toString("base64");
  const encodedStdin = Buffer.from(stdin).toString("base64");
  const postUrl =
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*";

  const postOptions = {
    method: "POST",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language_id: SUPPORTED_LANGUAGES[language as SupportedLanguage].id,
      source_code: encodedCode,
      stdin: encodedStdin,
      expected_output: encodedExpectedOutput,
    }),
  };

  try {
    const postResponse = await fetch(postUrl, postOptions);
    const postResult = await postResponse.json();
    if (!postResult.token) {
      return { success: false, error: "No submission token received" };
    }

    let result: SubmissionResult;
    do {
      await new Promise((r) => setTimeout(r, 2000));
      result = await getSubmission(postResult.token);
    } while (
      result.status?.id === STATUS.IN_QUEUE ||
      result.status?.id === STATUS.PROCESSING
    );
    console.log(result);
    const decodedOutput = Buffer.from(result.stdout || "", "base64").toString(
      "utf-8"
    );
    console.log(decodedOutput);
    return {
      success: result.status?.id === STATUS.ACCEPTED,
      status: result.status,
      output: result.stdout,
      error: result.stderr || result.compile_output || result.message,
    };
  } catch (error) {
    return {
      success: false,
      error: `Submission failed: ${(error as Error).name}`,
    };
  }
}
