import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

import { dbConfig as config } from "./configs.js";

const dbConfig: PoolConfig = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.name,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: config.ssl,
};

export const pool = new Pool(dbConfig);

export const connectDB = async () => {
    try {
        await pool.connect();
        console.log("✅ PostgreSQL connected successfully");

        // Test connection
        await pool.query("SELECT NOW()");
    } catch (error) {
        console.error("❌ PostgreSQL connection error:", error);
        process.exit(1);
    }
};
