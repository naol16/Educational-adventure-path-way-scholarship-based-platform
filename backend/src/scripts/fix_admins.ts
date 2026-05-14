import { sequelize } from "../config/sequelize.js";
import bcrypt from "bcryptjs";

async function fixAdmins() {
  try {
    await sequelize.authenticate();
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Update both admins to have password 'admin123'
    await sequelize.query(`
      UPDATE users 
      SET password = '${hashedPassword}', is_verified = true, is_active = true 
      WHERE email IN ('admin@educationalpathway.com', 'lemesanaol16@gmail.com')
    `);
    
    console.log("✅ Admin passwords reset to 'admin123'");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
fixAdmins();
