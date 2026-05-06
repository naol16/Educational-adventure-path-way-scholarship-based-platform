import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password123",
  database: "EAPSRFINAL",
});

(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT table_name, COUNT(*) as count
      FROM (
        SELECT 'scholarship_sources' as table_name, COUNT(*) as cnt FROM scholarship_sources
        UNION ALL
        SELECT 'scholarships', COUNT(*) FROM scholarships
        UNION ALL
        SELECT 'tracked_scholarships', COUNT(*) FROM tracked_scholarships
      ) t
      GROUP BY table_name
    `);
    console.log("Table counts:");
    res.rows.forEach(r => console.log(`  ${r.table_name}: ${r.cnt}`));
    client.release();
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
