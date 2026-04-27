import configs from "../config/configs.js";
import { redisConnection, isRedisAvailable } from "../config/redis.js";
import { connectSequelize } from "../config/sequelize.js";
import { User } from "../models/User.js";

async function test() {
  console.log("--- Environment Check ---");
  console.log("NODE_ENV:", configs.NODE_ENV);
  console.log("PORT:", configs.PORT);
  console.log("GOOGLE_CLIENT_ID:", configs.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING");
  console.log("GOOGLE_AUTH_AUDIENCES:", configs.GOOGLE_AUTH_AUDIENCES);
  
  try {
    await connectSequelize();
    const userCount = await User.count();
    console.log("DB Connection: OK");
    console.log("User Count:", userCount);
  } catch (err: any) {
    console.error("DB Connection: FAILED", err.message);
  }

  console.log("Checking Redis...");
  // Give it a moment
  setTimeout(() => {
      console.log("Redis Available:", isRedisAvailable());
      process.exit(0);
  }, 2000);
}

test();
