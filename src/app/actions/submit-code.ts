"use server";

import {
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from "@/utils/judge0-langs";
import { firestoreService } from "@/lib/firebase-admin-service";

// Define the expected structure for the Judge0 submission result
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

// // Helper function to remove duplicate import statements from code
// function removeDuplicateImports(code: string, language: SupportedLanguage): string {
//   const importPatterns: Partial<Record<SupportedLanguage, RegExp[]>> = {
//     cpp: [/#include\s*<[^>]+>/g],
//     java: [/import\s+[^;]+;/g],
//     python: [/^from\s+[\w.]+\s+import\s+.*$/gm, /^import\s+.*$/gm],
//     go: [/^import\s*\([^)]*\)/gm, /^import\s+".*?"$/gm],
//     rust: [
//       /^use\s+[^;]+;/gm,
//       /^use\s+[^{]+\{[^}]+\};/gm,
//       /^use\s+[^:]+::[^;]+;/gm,
//     ],
//   };

//   if (!importPatterns[language]) return code;

//   const patterns = importPatterns[language] || [];
//   const allImports = new Set<string>();
//   let cleanCode = code;

//   for (const pattern of patterns) {
//     const matches = cleanCode.match(pattern) || [];
//     for (const match of matches) {
//       allImports.add(match.trim());
//     }
//     cleanCode = cleanCode.replace(pattern, "");
//   }

//   let importSection = "";
//   if (language === "go" && allImports.size > 0) {
//     importSection = `import (\n  ${Array.from(allImports).join("\n  ")}\n)\n`;
//   } else if (allImports.size > 0) {
//     importSection = `${Array.from(allImports).join("\n")}\n`;
//   }

//   return importSection + cleanCode.trim();
// }

export async function judgeSolution(
    code: string,
    language: SupportedLanguage,
    stdin: string,
    submissionId: string
) {
    // Ensure that the required environment variables are set.
    if (!process.env.SULU_KEY) {
        throw new Error("SULU_KEY is not defined in environment variables.");
    }
    if (!process.env.HOST) {
        throw new Error("HOST is not defined in environment variables.");
    }

    // Default to empty string if code or stdin is nullish.
    const encodedCode = Buffer.from(code ?? "", "utf-8").toString("base64");
    const encodedStdin = Buffer.from(stdin ?? "", "utf-8").toString("base64");

    const postUrl =
        "https://judge0-ce.p.sulu.sh/submissions?base64_encoded=true&wait=false&fields=*";
    const callback_url = `https://${process.env.HOST}/judge0/submissions/callback`;

    const postOptions = {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${process.env.SULU_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            language_id: SUPPORTED_LANGUAGES[language].id,
            source_code: encodedCode,
            stdin: encodedStdin,
            callback_url,
            cpu_time_limit: "15",
            cpu_extra_time: "5",
            wall_time_limit: "20",
        }),
    };

    try {
        const postResponse = await fetch(postUrl, postOptions);
        const postResult: SubmissionResult = await postResponse.json();
        if (!postResult.token) {
            return { success: false, error: "No submission token received" };
        }

        // Mark the submission as created in Firestore.
        await firestoreService.submissions.created(submissionId);

        return {
            success: true,
            token: postResult.token,
        };
    } catch (error) {
        console.error("Submission error:", error);
        return {
            success: false,
            error: `Submission failed: ${
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
            }`,
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

export async function getSubmission(
    submissionId: string
): Promise<SubmissionResult> {
    const url = `https://judge0-ce.p.sulu.sh/submissions/${submissionId}?base64_encoded=true&fields=*`;
    const options = {
        method: "GET",
        headers: {
            Accept: "application/json",
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
