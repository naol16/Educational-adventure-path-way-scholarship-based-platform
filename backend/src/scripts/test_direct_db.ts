import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "db.vxyibvhhdapzpezrslkh.supabase.co",
  port: 5432,
  username: "postgres.vxyibvhhdapzpezrslkh",
  password: process.env.DB_PASSWORD!,
  database: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

async function test() {
  try {
    console.log("Testing DIRECT connection to Supabase...");
    await sequelize.authenticate();
    console.log("✅ DIRECT connection successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ DIRECT connection failed:", error);
    process.exit(1);
  }
}
test();
