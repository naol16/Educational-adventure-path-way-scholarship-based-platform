import { sequelize, connectSequelize } from "./src/config/sequelize.js";

async function fixDatabase() {
    console.log("Connecting to database...");
    await connectSequelize();
    
    try {
        console.log("Checking for 'avatar_url' column in 'conversations' table...");
        
        // Add the column if it doesn't exist
        await sequelize.query(`
            ALTER TABLE conversations 
            ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
        `);
        
        console.log("✅ Successfully added 'avatar_url' column to 'conversations' table.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to update database:", error);
        process.exit(1);
    }
}

fixDatabase();
