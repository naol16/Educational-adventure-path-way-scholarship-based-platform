import { sequelize } from "../config/sequelize.js";

async function diag() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students'
    `);
    console.log("Columns in 'students' table:");
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
diag();
