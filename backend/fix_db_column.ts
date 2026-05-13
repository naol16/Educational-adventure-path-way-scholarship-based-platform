import { sequelize } from "./src/config/sequelize.js";

async function fix() {
    console.log("Connecting...");
    try {
        await sequelize.authenticate();
        console.log("Auth success. Running query...");
        await sequelize.query("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);");
        console.log("✅ Column fixed!");
    } catch (e) {
        console.error("Failed:", e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

fix();
