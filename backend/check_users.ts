import { User } from './src/models/User.js';
import { sequelize } from './src/config/sequelize.js';
import { Op } from 'sequelize';

async function checkUnverifiedUsers() {
  try {
    await sequelize.authenticate();
    const user = await User.findOne({
      where: { isVerified: false },
      order: [['updatedAt', 'DESC']],
      attributes: ['email', 'isVerified', 'isActive', 'verificationCode', 'updatedAt']
    });
    console.log('Latest Unverified User:');
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUnverifiedUsers();
