import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import {
  User,
  RefreshToken,
  PasswordResetToken,
  Student,
  Counselor,
  AvailabilitySlot,
  Payment,
  Booking,
  CounselorReview,
  Document,
  CounselorMessage,
  ScholarshipSource,
  Scholarship,
  AssessmentResult,
  Consultation,
  Notification,
  Video,
  LearningPath,
  LearningPathProgress,
  Conversation,
  ConversationParticipant,
  ChatMessage,
  TrackedScholarship,
  ScholarshipMilestone,
  VisaGuideline,
  VisaMockInterview,
  Pdf,
  CounselorPayout,
  CounselorWalletTransaction,
  AIChatMessage,
  MarketingTestimonial,
  MarketingFaq,
  MarketingStat,
  UserWarning,
  MessageReport,
} from "../models/index.js";
import configs from "./configs.js";

const dbOptions: SequelizeOptions = {
  host: configs.DB_HOST,
  port: configs.DB_PORT,
  username: configs.DB_USER,
  password: configs.DB_PASSWORD,
  database: configs.DB_NAME,
  // Keep SQL logs off by default; enable only when DB_LOGGING=true.
  logging: configs.DB_LOGGING ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000, // Maximum time (ms) to try getting a connection before throwing error
    idle: 10000, // Maximum time (ms) a connection can be idle before being released
  },

  dialectOptions:
    configs.DB_HOST === "localhost" || configs.DB_HOST === "127.0.0.1"
      ? configs.DB_SSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
};
const globalForSequelize = global as unknown as { sequelize: Sequelize };
export const sequelize = new Sequelize({
  dialect: "postgres",
  ...dbOptions,
  timezone: "+00:00", // Force UTC to avoid timezone issues
  models: [
    User,
    RefreshToken,
    PasswordResetToken,
    Student,
    Counselor,
    AvailabilitySlot,
    Payment,
    Booking,
    CounselorReview,
    Document,
    CounselorMessage,
    ScholarshipSource,
    Scholarship,
    AssessmentResult,
    Consultation,
    Notification,
    Video,
    LearningPath,
    LearningPathProgress,
    Conversation,
    ConversationParticipant,
    ChatMessage,
    TrackedScholarship,
    ScholarshipMilestone,
    VisaGuideline,
    VisaMockInterview,
    Pdf,
    CounselorPayout,
    CounselorWalletTransaction,
    AIChatMessage,
    MarketingTestimonial,
    MarketingFaq,
    MarketingStat,
    UserWarning,
    MessageReport,
  ], // Add all models here
} as SequelizeOptions);

export let hasVectorExtension = false;

export const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database authentication successful");

    // Enable pgvector extension
    try {
      await sequelize.query("CREATE EXTENSION IF NOT EXISTS vector;");

      hasVectorExtension = true;
      console.log("✅ pgvector extension is available");
    } catch (extensionError) {
      console.warn(
        "⚠️ Warning: Failed to enable pgvector extension. Ensure it is installed on your PostgreSQL system.",
      );
      hasVectorExtension = false;
    }

    // Sync models with database (creates tables if missing, updates columns if alter is true)
    if (configs.DB_SYNC) {
      console.log(
        "🔧 DB_SYNC is enabled: synchronizing models now. This may slow startup.",
      );
      await sequelize.sync({ alter: true });
      console.log("✅ Database models synchronized (alter: true)");
    } else {
      console.log(
        "⏭️ Database sync disabled (DB_SYNC is false). Startup will be faster.",
      );
    }
  } catch (error) {
    console.error("Sequelize connection error:", error);
    process.exit(1);
  }
};
