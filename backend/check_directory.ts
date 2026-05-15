import { CounselorService } from './src/services/CounselorService.ts';
import { sequelize } from './src/config/sequelize.ts';

async function check() {
  try {
    await sequelize.authenticate();
    const result = await CounselorService.getPublicDirectory({ page: 1, limit: 10 }, 0);
    console.log('--- Public Directory Check ---');
    console.log('Total Count:', result.count);
    result.rows.forEach((c: any) => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, Status: ${c.verificationStatus}, Active: ${c.isActive}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
