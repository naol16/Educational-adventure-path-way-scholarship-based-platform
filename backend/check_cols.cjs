const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkCols() {
  const client = new Client({
    host: process.env.DB_HOST || '108.128.216.176',
    port: parseInt(process.env.DB_PORT || '6543'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'refresh_tokens'
    `);
    console.log(res.rows);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkCols();
