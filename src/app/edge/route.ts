import { Redis } from "@upstash/redis";
// import { getSubmission } from "../actions/submit-code";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get("submissionId") || "";
  // const token = searchParams.get("token") || "";

  if (!submissionId) {
    return new Response("No submission ID provided", { status: 400 });
  }

  // console.log("Submission ID:", submissionId);

  const redis = Redis.fromEnv();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("Checking submission status...\n"));

        while (true) {
          const submissions = await redis.lrange("done",0,-1);

          if (!submissions) {
            controller.enqueue(encoder.encode("No submission data found\n"));
            continue;
          }
          let found = false;
          for (const submission of submissions) {
            const [id, ] = submission.split(':');
            if (id === submissionId) {
              found = true;
              await new Promise((resolve) => setTimeout(resolve, 2000));
              break;
            }
          }

          if (found) {
            controller.enqueue(encoder.encode("Submission calculated found\n"));
            break;
          }
        }

        controller.enqueue(encoder.encode("Stream completed\n"));
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          encoder.encode(
            `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const runtime = "edge";
