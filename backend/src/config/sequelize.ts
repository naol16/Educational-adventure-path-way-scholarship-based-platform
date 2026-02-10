import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";

dotenv.config();

import { dbConfig } from "./configs.js";

// Determine connection options based on environment
const dbOptions: SequelizeOptions = {
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.name,
    logging: false, // Set to console.log to see SQL queries

    // Handle SSL for production
    ...(dbConfig.ssl && { dialectOptions: { ssl: dbConfig.ssl } }),
};

export const sequelize = new Sequelize({
    dialect: "postgres",
    ...dbOptions,
    models: [User, RefreshToken, PasswordResetToken], // Add all models here
} as SequelizeOptions);

export const connectSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Sequelize connected successfully");

        // Sync models with database (alter: true updates tables if they exist)
        // Be careful with alter: true in production!
        // await sequelize.sync({ alter: true }); 
        // console.log("✅ Models synchronized");

    } catch (error) {
        console.error("❌ Sequelize connection error:", error);
        process.exit(1);
    }
};
