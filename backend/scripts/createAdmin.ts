import dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";
import { User } from "./src/models/User.js";
import { RefreshToken } from "./src/models/RefreshToken.js";
import { PasswordResetToken } from "./src/models/PasswordResetToken.js";
import { Student } from "./src/models/Student.js";
import { Counselor } from "./src/models/Counselor.js";
import { Consultation } from "./src/models/Consultation.js";
import { AvailabilitySlot } from "./src/models/AvailabilitySlot.js";
import { Payment } from "./src/models/Payment.js";
import { Booking } from "./src/models/Booking.js";
import { CounselorReview } from "./src/models/CounselorReview.js";
import { Document } from "./src/models/Document.js";
import { CounselorMessage } from "./src/models/CounselorMessage.js";
import { ScholarshipSource } from "./src/models/ScholarshipSource.js";
import { Scholarship } from "./src/models/Scholarship.js";
import { AssessmentResult } from "./src/models/AssessmentResult.js";
import { Notification } from "./src/models/Notification.js";
import { Video } from "./src/models/Video.js";
import { LearningPath } from "./src/models/LearningPath.js";
import { LearningPathProgress } from "./src/models/LearningPathProgress.js";
import { Conversation } from "./src/models/Conversation.js";
import { ConversationParticipant } from "./src/models/ConversationParticipant.js";
import { ChatMessage } from "./src/models/ChatMessage.js";
import { TrackedScholarship } from "./src/models/TrackedScholarship.js";
import { ScholarshipMilestone } from "./src/models/ScholarshipMilestone.js";
import { VisaGuideline } from "./src/models/VisaGuideline.js";
import { VisaMockInterview } from "./src/models/VisaMockInterview.js";
import { Pdf } from "./src/models/Pdf.js";
import { CounselorPayout } from "./src/models/CounselorPayout.js";
import { CounselorWalletTransaction } from "./src/models/CounselorWalletTransaction.js";
import { UserWarning } from "./src/models/UserWarning.js";
import { AIChatMessage } from "./src/models/AIChatMessage.js";
import bcrypt from "bcryptjs";
import configs from "./src/config/configs.js";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: configs.DB_HOST,
  port: configs.DB_PORT,
  username: configs.DB_USER,
  password: configs.DB_PASSWORD,
  database: configs.DB_NAME,
  logging: configs.DB_LOGGING ? console.log : false,
  models: [
    User,
    RefreshToken,
    PasswordResetToken,
    Student,
    Counselor,
    Consultation,
    AvailabilitySlot,
    Payment,
    Booking,
    CounselorReview,
    Document,
    CounselorMessage,
    ScholarshipSource,
    Scholarship,
    AssessmentResult,
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
    UserWarning,
    AIChatMessage,
  ],
  timezone: "+00:00",
});

async function createAdmin() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Database connection established.");

    const email = "adminscholarship10@gmail.com";
    const passwordPlain = "Admin12345@Scholarship";
    const name = "Admin Scholarship";
    const role = "admin";

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      console.log("User already exists with ID:", existingUser.id);
      if (existingUser.role !== role) {
        await existingUser.update({ role });
        console.log("Updated user role to 'admin'");
      }
      console.log("Admin user ready:", { id: existingUser.id, email: existingUser.email, role: existingUser.role });
    } else {
      const hashedPassword = await bcrypt.hash(passwordPlain, 10);
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      });
      console.log("Admin user created:", { id: newUser.id, email: newUser.email, role: newUser.role });
    }
    
    await sequelize.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    await sequelize.close();
    process.exit(1);
  }
}

createAdmin();
