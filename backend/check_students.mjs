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
    const res1 = await pool.query("SELECT COUNT(*) as count FROM students");
    console.log("Students count:", res1.rows[0].count);
    const res2 = await pool.query('SELECT id, user_id, is_onboarded, nationality, country_of_residence, field_of_study, preferred_degree_level FROM students');
    console.log("Students:", res2.rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
})();
