import { sequelize } from './src/config/sequelize.js';
import { ChatMessage } from './src/models/ChatMessage.js';

async function check() {
  await sequelize.sync();
  const msgs = await ChatMessage.findAll();
  console.log('ALL MESSAGES:', msgs.map(m => m.toJSON()));
  process.exit(0);
}

check();
