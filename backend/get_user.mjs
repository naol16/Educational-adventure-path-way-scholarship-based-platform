import { Pool } from "pg";
const pool = new Pool({
  host: "localhost", port: 5432, user: "postgres", password: "password123", database: "EAPSRFINAL",
});
(async () => {
  const res = await pool.query('SELECT u.id, u.email, u.name FROM users u JOIN students s ON u.id = s.user_id WHERE s.id = 1');
  console.log(res.rows[0]);
  await pool.end();
})();
