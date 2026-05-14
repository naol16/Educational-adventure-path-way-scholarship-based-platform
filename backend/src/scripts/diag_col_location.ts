import { sequelize } from "../config/sequelize.js";

async function diag() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT table_schema, table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE column_name = 'recommendation_letters_url'
    `);
    console.log("Tables containing 'recommendation_letters_url':");
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
diag();
