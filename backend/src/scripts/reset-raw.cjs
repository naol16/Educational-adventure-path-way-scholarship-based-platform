const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function reset() {
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

    const email = 'josefdagne5@gmail.com';
    const password = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const res = await client.query('UPDATE users SET password = $1, is_active = true WHERE email = $2', [hash, email]);
    
    if (res.rowCount > 0) {
      console.log(`Successfully reset password for ${email} to ${password}`);
    } else {
      console.log(`User ${email} not found in database`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

reset();
