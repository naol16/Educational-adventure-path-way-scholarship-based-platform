import { connectSequelize } from "./config/sequelize.js";
import { ScholarshipDiscoveryService } from "./services/ScholarshipDiscoveryService.js";

async function runDiscovery() {
  try {
    await connectSequelize();
    console.log("Database connected. Starting discovery...");
    
    await ScholarshipDiscoveryService.discoverAll();
    
    console.log("Discovery completed.");
    process.exit(0);
  } catch (error) {
    console.error("Discovery error:", error);
    process.exit(1);
  }
}

runDiscovery();
