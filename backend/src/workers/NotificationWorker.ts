import { Worker } from "bullmq";
import { redisOptions } from "../config/redis.js";
import { EmailService } from "../services/EmailService.js";

/**
 * NotificationWorker handles asynchronous notifications (Emails, Push, etc.)
 */
export const notificationWorker = new Worker(
  "notification-queue",
  async (job) => {
    console.log(`[NotificationWorker] 🔔 Processing job ${job.id} of type: ${job.name}`);

    try {
      switch (job.name) {
        case "send-session-invite":
          await EmailService.sendSessionInviteEmail(job.data);
          console.log(`✅ Session invite email sent to ${job.data.to}`);
          break;
        
        // Add more notification types here in the future
        
        default:
          console.warn(`⚠️ Unknown job type in NotificationWorker: ${job.name}`);
      }
    } catch (error: any) {
      console.error(`❌ Notification job ${job.id} failed:`, error.message);
      throw error; // Rethrow to allow BullMQ to handle retries
    }
  },
  {
    connection: redisOptions,
    concurrency: 5, // Process up to 5 emails at a time
    removeOnComplete: { count: 100 }, // Keep last 100 successful jobs in logs
    removeOnFail: { count: 500 }, // Keep failed jobs for debugging
  }
);

console.log("🚀 NotificationWorker initialized and listening to 'notification-queue'.");

notificationWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
