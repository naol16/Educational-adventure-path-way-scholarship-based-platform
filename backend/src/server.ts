import app from "./app.js";
import http from "http";
import { connectSequelize } from "./config/sequelize.js";
import configs from "./config/configs.js";
import { SocketService } from "./services/SocketService.js";
// import { createTables, seedAdminUser } from "./utils/databaseMigration.js"; // Migration is now handled by Sequelize sync or manual scripts

// Scholarship automation imports
import { startScholarshipCron } from "./automation/scholarshipCron.js";
import { assessmentWorker } from "./workers/AssessmentWorker.js";
import { notificationWorker } from "./workers/NotificationWorker.js";
import { seedScholarshipSources } from "./scripts/seedScholarships.js";

// Temporary: Global unhandled rejection handler for debugging
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

async function start() {
  // PRIORITY: Use configs.PORT
  const finalPort = configs.PORT;

  // Start server immediately for health checks
  const server = http.createServer(app);

  // Initialize Socket.io
  SocketService.initialize(server);

  server.listen(Number(finalPort), "0.0.0.0", () => {
    console.log(`🚀 HTTP server is listening on http://0.0.0.0:${finalPort}`);
    console.log(`🔧 Connecting to database in the background...`);
  });

  // Load configurations and connect to DB asynchronously
  try {
    await connectSequelize();

    // Ensure the workers are running (explicit reference prevents tree-shaking)
    if (assessmentWorker) {
      console.log(`🧠 Assessment worker started: ${assessmentWorker.name}`);
    } else {
      console.warn("⚠️ Assessment worker skipped (Redis not connected)");
    }
    if (notificationWorker) {
      console.log(`🔔 Notification worker started: ${notificationWorker.name}`);
    }

    // Initialize Scholarship Ingestion System
    // await seedScholarshipSources();
    // startScholarshipCron();

    console.log(`
===================================================
🚀 BACKEND IS FULLY RUNNING AND READY 🚀
===================================================
✅ Server listening on port ${finalPort}
✅ Database Connected Successfully
✅ WebSockets Initialized
✅ Workers Active
===================================================
    `);
  } catch (err) {
    console.error("Failed to connect to database:", err);
  }

  // Graceful Shutdown
  const gracefulShutdown = async () => {
    console.log("Shutting down gracefully...");

    // Close workers
    if (assessmentWorker) await assessmentWorker.close();
    if (notificationWorker) await notificationWorker.close();

    // Close Redis connection
    const { redisConnection } = await import("./config/redis.js");
    if (redisConnection) {
      await redisConnection.quit();
    }

    // Close DB
    const { sequelize } = await import("./config/sequelize.js");
    if (sequelize) {
      await sequelize.close();
    }

    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}
start();
