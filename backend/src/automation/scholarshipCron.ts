import cron from "node-cron";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { DeadlineReminderService } from "../services/DeadlineReminderService.js";
import { SettlementService } from "../services/SettlementService.js";

export const startScholarshipCron = () => {
  // Schedule task to run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log(`[CRON] ${new Date().toISOString()} - Starting scholarship discovery...`);
      await ScholarshipDiscoveryService.discoverAll();
    } catch (err) {
      console.error("[CRON] Scholarship discovery failed:", err);
    }
    
    try {
      console.log("Running scheduled escrow auto-release check...");
      await SettlementService.autoReleaseEscrow();
    } catch (err) {
      console.error("Escrow auto-release failed:", err);
    }
  });

  // Schedule deadline reminders to run every hour
  cron.schedule("0 * * * *", async () => {
      console.log("Running scheduled deadline reminder check...");
      await DeadlineReminderService.checkAndSendReminders();
  });

  console.log("Scholarship discovery job and deadline reminders scheduled.");
};
