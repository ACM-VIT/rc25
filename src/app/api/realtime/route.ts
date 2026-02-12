import { handle } from "@upstash/realtime";
import { isRealtimeAvailable, isRealtimeConfigured, realtime } from "@/lib/realtime";
import { auth } from "@/app/(auth)/auth";

const ALLOWED_CHANNELS = new Set(["leaderboard"]);

const realtimeHandler = handle({
  realtime,
  middleware({ channels }) {
    if (channels.some((channel) => !ALLOWED_CHANNELS.has(channel))) {
      return new Response("Forbidden", { status: 403 });
    }
  },
});

export const GET = auth(async (request) => {
  if (!request.auth?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isRealtimeConfigured || !(await isRealtimeAvailable())) {
    return new Response(null, { status: 204 });
  }

  return (await realtimeHandler(request)) ?? new Response(null, { status: 204 });
});
