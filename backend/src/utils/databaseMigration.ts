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
    const admin1Password = await bcrypt.hash("Admin@123", 10);
    const admin2Password = await bcrypt.hash("Naol123@", 10);

    // Seed Yoseph
    await UserRepository.createIfNotExists({
      name: "Yoseph",
      email: "josefdagne5@gmail.com",
      password: admin1Password,
      role: UserRole.ADMIN,
      is_active: true
    });

    // Seed Naol
    await UserRepository.createIfNotExists({
      name: "Naol",
      email: "lemesanaol16@gmail.com",
      password: admin2Password,
      role: UserRole.ADMIN,
      is_active: true
    });
  } catch (error) {
    console.error("Error seeding admin users:", error);
  }
};
