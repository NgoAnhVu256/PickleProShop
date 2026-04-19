import IORedis from "ioredis";

let redis: IORedis | null = null;

export function getRedis(): IORedis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!redis) {
    try {
      redis = new IORedis(url, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 3) return null; // Stop retrying after 3 attempts
          return Math.min(times * 500, 2000);
        },
      });
      redis.connect().catch((err) => {
        console.error("[Redis] Connection failed:", err.message);
        redis = null;
      });
    } catch {
      redis = null;
    }
  }

  return redis;
}
