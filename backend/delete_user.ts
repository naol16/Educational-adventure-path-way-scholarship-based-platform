import { sequelize } from "./src/config/sequelize.js";
import { User } from "./src/models/User.js";

async function deleteUser() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ attributes: ['email'] });
    console.log("Current users in DB:", users.map(u => u.email));
    
    const email = "lemesanaol16@gmail.com";
    const user = await User.findOne({ where: { email } });
    
    if (user) {
      await user.destroy();
      console.log(`User with email ${email} deleted successfully.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (err) {
    console.error("Error during deletion:", err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

deleteUser();
