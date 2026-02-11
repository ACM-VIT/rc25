"use server";

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
        return {status: {id: 0, description: "API Error"}, error};
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
