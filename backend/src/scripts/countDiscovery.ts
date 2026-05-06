import { connectSequelize } from "./config/sequelize.js";
import { ScholarshipDiscoveryService } from "./services/ScholarshipDiscoveryService.js";
import { Scholarship } from "./models/Scholarship.js";

async function runDiscoveryWithCount() {
  await connectSequelize();
  const before = await Scholarship.count();
  console.log(`Before: ${before} scholarships`);
  
  await ScholarshipDiscoveryService.discoverAll();
  
  const after = await Scholarship.count();
  console.log(`After: ${after} scholarships (added ${after - before})`);
  process.exit(0);
}

runDiscoveryWithCount().catch(e => { console.error(e); process.exit(1); });
