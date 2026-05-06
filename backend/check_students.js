const { Pool } = require("pg");
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password123",
  database: "EAPSRFINAL",
});

(async () => {
  try {
    const res1 = await pool.query("SELECT COUNT(*) FROM students");
    console.log("Students count:", res1.rows[0].count);
    const res2 = await pool.query("SELECT id, \"userId\", isOnboarded FROM students");
    console.log("Students:", res2.rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
