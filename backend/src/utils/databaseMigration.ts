import { sequelize } from "../config/sequelize.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTables = async () => {
  try {
    // Read schema.sql file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    // Execute raw SQL through Sequelize
    await sequelize.query(schemaSql);
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

export const seedAdminUser = async () => {
  try {
    const adminPassword = await bcrypt.hash("Dagne@12@21@27", 10);
    const naolPassword = await bcrypt.hash("Naol123@", 10);

    const yosephEmails = [
      "yosephdagne2721@gmail.com",
      "yosephdagne2721@gmail.com",
      "josefdagne5@gmail.com"
    ];

    for (const email of yosephEmails) {
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        await UserRepository.update(existingUser.id, {
          role: UserRole.ADMIN,
          password: adminPassword,
          isVerified: true,
          isActive: true
        });
        console.log(`[SeedAdmin] Updated existing user ${email} to ADMIN with requested password.`);
      } else {
        await UserRepository.create({
          name: "Yoseph Dagne",
          email,
          password: adminPassword,
          role: UserRole.ADMIN,
          isActive: true,
          isVerified: true
        });
        console.log(`[SeedAdmin] Created new ADMIN user ${email}.`);
      }
    }

    // Seed Naol Admin
    const naolEmail = "lemesanaol16@gmail.com";
    const existingNaol = await UserRepository.findByEmail(naolEmail);
    if (existingNaol) {
      await UserRepository.update(existingNaol.id, {
        role: UserRole.ADMIN,
        isVerified: true,
        isActive: true
      });
    } else {
      await UserRepository.create({
        name: "Naol",
        email: naolEmail,
        password: naolPassword,
        role: UserRole.ADMIN,
        isActive: true,
        isVerified: true
      });
    }
    // Clean stale counselor/student sub-records for ALL admin users
    // (prevents 403 errors caused by old pending counselor rows)
    await sequelize.query(`
      DELETE FROM counselors WHERE user_id IN (SELECT id FROM users WHERE role = 'admin')
    `);
    await sequelize.query(`
      DELETE FROM students WHERE user_id IN (SELECT id FROM users WHERE role = 'admin')
    `);
    console.log("[SeedAdmin] Cleaned stale sub-role records for all admin users.");
  } catch (error) {
    console.error("Error seeding admin users:", error);
  }
};
