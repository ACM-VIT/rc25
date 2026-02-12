import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

const getValidatedRedisUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
};

const validatedRedisUrl = getValidatedRedisUrl(redisUrl);

export const redis =
  validatedRedisUrl && redisToken
    ? new Redis({
        url: validatedRedisUrl,
        token: redisToken,
      })
    : null;

export const isRedisConfigured = redis !== null;

export const getRedis = () => redis;
