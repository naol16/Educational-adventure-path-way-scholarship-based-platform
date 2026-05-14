import { sequelize } from "../config/sequelize.js";

async function fixSchema() {
  try {
    await sequelize.authenticate();
    console.log("Adding missing columns to 'students' table...");
    
    const queries = [
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS recommendation_letters_url VARCHAR(255);",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS sop_url VARCHAR(255);",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS research_proposal_url VARCHAR(255);",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS publications_url VARCHAR(255);"
    ];

    for (const query of queries) {
      await sequelize.query(query);
      console.log(`Executed: ${query}`);
    }
    
    console.log("✅ Database schema synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update schema:", error);
    process.exit(1);
  }
}
fixSchema();
