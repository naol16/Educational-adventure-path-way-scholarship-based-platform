import { pool } from "./database/database.js";

async function checkCounts() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 'scholarship_sources' as table_name, COUNT(*) as count FROM scholarship_sources
      UNION ALL
      SELECT 'scholarships', COUNT(*) FROM scholarships
      UNION ALL
      SELECT 'tracked_scholarships', COUNT(*) FROM tracked_scholarships
    `);
    console.log("Database counts:");
    res.rows.forEach((row: any) => {
      console.log(`  ${row.table_name}: ${row.count}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

checkCounts().catch(console.error);
