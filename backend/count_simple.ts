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
    const res1 = await client.query("SELECT COUNT(*) as c FROM scholarship_sources");
    const res2 = await client.query("SELECT COUNT(*) as c FROM scholarships");
    const res3 = await client.query("SELECT COUNT(*) as c FROM tracked_scholarships");
    console.log("Table counts:");
    console.log(`  scholarship_sources: ${res1.rows[0].c}`);
    console.log(`  scholarships: ${res2.rows[0].c}`);
    console.log(`  tracked_scholarships: ${res3.rows[0].c}`);
    client.release();
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
