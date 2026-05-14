import { sequelize } from "../config/sequelize.js";

async function checkAdmins() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT email, role, is_verified, is_active FROM users WHERE role = 'admin' OR email = 'josefdagne5@gmail.com'");
    console.log("Potential Admin Users:");
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkAdmins();
