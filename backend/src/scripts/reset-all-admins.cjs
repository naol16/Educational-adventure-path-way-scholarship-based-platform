const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function resetAllAdmins() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const password = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const res = await client.query("UPDATE users SET password = $1, is_active = true WHERE role = 'admin'", [hash]);
    
    console.log(`Successfully reset password for ${res.rowCount} admin users to ${password}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

resetAllAdmins();
