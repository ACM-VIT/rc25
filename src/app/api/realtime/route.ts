import { handle } from "@upstash/realtime";
import { isRealtimeAvailable, isRealtimeConfigured, realtime } from "@/lib/realtime";
import { auth } from "@/app/(auth)/auth";
import { getRedis } from "@/lib/redis";
import {
  REALTIME_LEADERBOARD_CHANNEL,
  REALTIME_SUBSCRIBABLE_CHANNELS,
} from "@/lib/realtime-channels";

const ALLOWED_CHANNELS = new Set(REALTIME_SUBSCRIBABLE_CHANNELS);
const STREAM_KEY_TYPE = "stream";
const redis = getRedis();

const isWrongTypeError = (error: unknown): boolean =>
  String(error).toUpperCase().includes("WRONGTYPE");

const ensureRealtimeKeyType = async () => {
  if (!redis) return;

  try {
    const keyType = String(await redis.type(REALTIME_LEADERBOARD_CHANNEL));
    if (keyType !== "none" && keyType !== STREAM_KEY_TYPE) {
      await redis.del(REALTIME_LEADERBOARD_CHANNEL);
      console.warn(
        `Deleted incompatible Redis key "${REALTIME_LEADERBOARD_CHANNEL}" (type: ${keyType})`,
      );
    }
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

  try {
    return (await realtimeHandler(request)) ?? new Response(null, { status: 204 });
  } catch (error: unknown) {
    if (redis && isWrongTypeError(error)) {
      try {
        await redis.del(REALTIME_LEADERBOARD_CHANNEL);
        await ensureRealtimeKeyType();
        return (
          (await realtimeHandler(request)) ?? new Response(null, { status: 204 })
        );
      } catch (retryError: unknown) {
        console.error(
          "Failed to recover realtime request after WRONGTYPE cleanup",
          retryError,
        );
      }
    }

    console.error("Failed to process realtime request", error);
    return new Response(null, { status: 204 });
  }
});
