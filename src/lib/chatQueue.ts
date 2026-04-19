import { Queue } from "bullmq";
import { getRedis } from "./redis";

let chatQueue: Queue | null = null;

export function getChatQueue(): Queue | null {
  const connection = getRedis();
  if (!connection) return null;

  if (!chatQueue) {
    chatQueue = new Queue("gemini-chat", {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }

  return chatQueue;
}
