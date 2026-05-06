import { Pool } from "pg";
const pool = new Pool({ host: "localhost", port: 5432, user: "postgres", password: "password123", database: "EAPSRFINAL" });
(async () => {
  const res = await pool.query("SELECT COUNT(*) as cnt FROM scholarships");
  console.log("Scholarships in DB:", res.rows[0].cnt);
  await pool.end();
})();
