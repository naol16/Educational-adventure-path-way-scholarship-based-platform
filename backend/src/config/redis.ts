import { Queue, ConnectionOptions } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import configs from "./configs.js";

// Standard options for ioredis (used by the Express app)
const standardRedisOptions: RedisOptions = {
  host: configs.REDIS_HOST,
  port: configs.REDIS_PORT,
  password: configs.REDIS_PASSWORD || undefined,
  family: 4, // Enforce IPv4 to avoid IPv6 timeout bugs on Node 18+ with cloud redis
  maxRetriesPerRequest: 0, // Fail fast for standard connections to avoid blocking
  connectTimeout: 5000,
  retryStrategy(times) {
    if (times > 2) {
      return null; // stop retrying after 2 attempts
    }
    return Math.min(times * 500, 2000);
  },
};

let redisAvailable = false;

export const redisConnection = new Redis(standardRedisOptions);

// Use a separate connection for the queue as BullMQ requires maxRetriesPerRequest to be null
export const redisOptions: ConnectionOptions = {
  ...standardRedisOptions,
  maxRetriesPerRequest: null,
};

redisConnection.on("connect", () => {
  redisAvailable = true;
  console.log("✅ Redis connected successfully");
});

redisConnection.on("error", (err) => {
  redisAvailable = false;
  if (err.message.includes("ECONNREFUSED") || err.message.includes("ETIMEDOUT")) {
    // Only log once to avoid flooding
    if (configs.NODE_ENV === "development") {
        console.warn(`⚠️ Redis unavailable at ${configs.REDIS_HOST}:${configs.REDIS_PORT}. Redis-dependent features will be disabled.`);
    }
  } else {
    console.error("❌ Redis connection error:", err.message);
  }
});

// Only initialize queue if possible, otherwise we handle it in services
export const assessmentQueue = new Queue("assessment-queue", {
  connection: redisOptions,
});

export const notificationQueue = new Queue("notification-queue", {
  connection: redisOptions,
});

export const isRedisAvailable = () => redisAvailable;
