import { connectSequelize } from "./config/sequelize.js";
import { ScholarshipDiscoveryService } from "./services/ScholarshipDiscoveryService.js";

async function runDiscovery() {
  await connectSequelize();
  console.log("DB connected - Starting discovery run #2");
  await ScholarshipDiscoveryService.discoverAll();
  console.log("Discovery run #2 complete");
  process.exit(0);
}

runDiscovery().catch(e => { console.error(e); process.exit(1); });
