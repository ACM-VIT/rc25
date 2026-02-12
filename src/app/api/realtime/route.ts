import { handle } from "@upstash/realtime";
import { isRealtimeAvailable, isRealtimeConfigured, realtime } from "@/lib/realtime";
import { auth } from "@/app/(auth)/auth";
import { getRedis } from "@/lib/redis";

const ALLOWED_CHANNELS = new Set(["leaderboard"]);
const REALTIME_LEADERBOARD_CHANNEL = "leaderboard";
const LEGACY_REALTIME_BLOCKING_TYPES = new Set([
  "string",
  "set",
  "list",
  "zset",
  "hash",
]);
const redis = getRedis();
let isRealtimeKeyChecked = false;

const ensureRealtimeKeyType = async () => {
  if (!redis || isRealtimeKeyChecked) return;

  try {
    const keyType = await redis.type(REALTIME_LEADERBOARD_CHANNEL);
    if (
      typeof keyType === "string" &&
      LEGACY_REALTIME_BLOCKING_TYPES.has(keyType)
    ) {
      await redis.del(REALTIME_LEADERBOARD_CHANNEL);
      console.warn(
        `Deleted incompatible Redis key "${REALTIME_LEADERBOARD_CHANNEL}" (type: ${keyType})`,
      );
    }
    isRealtimeKeyChecked = true;
  } catch (error: unknown) {
    console.error("Failed to validate realtime channel key type", error);
  }
};

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

  await ensureRealtimeKeyType();

  return (await realtimeHandler(request)) ?? new Response(null, { status: 204 });
});
