import { Realtime, InferRealtimeEvents } from "@upstash/realtime";
import { redis } from "./redis";
import z from "zod/v4";

const leaderboardEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
});

const questionSchema = z.object({
  id: z.string(),
  problem: z.string(),
  points: z.number().int().nonnegative(),
});

const schema = {
  notification: {
    alert: z.string(),
  },
  leaderboard: z.array(leaderboardEntrySchema),
  question: questionSchema,
};

export const realtime = new Realtime({ schema, redis: redis ?? undefined });
export const isRealtimeConfigured = redis !== null;

let realtimeAvailabilityCache: { available: boolean; checkedAt: number } | null =
  null;
const REALTIME_HEALTH_CACHE_TTL_MS = 30_000;
const REALTIME_HEALTH_TIMEOUT_MS = 1_500;

export const isRealtimeAvailable = async (): Promise<boolean> => {
  if (!redis) return false;

  const now = Date.now();
  if (
    realtimeAvailabilityCache &&
    now - realtimeAvailabilityCache.checkedAt < REALTIME_HEALTH_CACHE_TTL_MS
  ) {
    return realtimeAvailabilityCache.available;
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    await Promise.race([
      redis.ping(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Redis health check timed out")),
          REALTIME_HEALTH_TIMEOUT_MS,
        );
      }),
    ]);

    realtimeAvailabilityCache = { available: true, checkedAt: now };
    return true;
  } catch {
    realtimeAvailabilityCache = { available: false, checkedAt: now };
    return false;
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
};

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
export type LeaderboardEvent = z.infer<typeof schema.leaderboard>;
export type QuestionEvent = z.infer<typeof schema.question>;
