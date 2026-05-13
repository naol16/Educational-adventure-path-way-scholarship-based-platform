import { sequelize, connectSequelize } from "./src/config/sequelize.js";
import configs from "./src/config/configs.js";

async function runSync() {
    console.log("Starting forced sync...");
    // Manually override config to force sync
    (configs as any).DB_SYNC = true;
    
    await connectSequelize();
    console.log("✅ Database sync finished.");
    process.exit(0);
}

runSync().catch(err => {
    console.error("❌ Sync failed:", err);
    process.exit(1);
});
