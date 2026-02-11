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

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
export type LeaderboardEvent = z.infer<typeof schema.leaderboard>;
export type QuestionEvent = z.infer<typeof schema.question>;
