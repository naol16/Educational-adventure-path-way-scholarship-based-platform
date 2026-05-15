import { Counselor } from './src/models/Counselor.ts';
import { sequelize } from './src/config/sequelize.ts';

async function check() {
  try {
    await sequelize.authenticate();
    const counselors = await Counselor.findAll();
    
    console.log('--- Counselor Embedding Check ---');
    counselors.forEach(c => {
      console.log(`- ID: ${c.id}, Status: ${c.verificationStatus}, Active: ${c.isActive}, Embedding: ${c.embedding ? 'YES' : 'NO'}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
