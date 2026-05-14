import { UserService } from "../services/UserService.js";
import { connectSequelize } from "../config/sequelize.js";

async function test() {
  try {
    await connectSequelize();
    console.log("Testing UserService.getAdminStats...");
    const stats = await UserService.getAdminStats();
    console.log("Success! Stats:", stats);
    process.exit(0);
  } catch (error: any) {
    console.error("FAILED with error:");
    console.error(error);
    if (error.original) {
      console.error("Original SQL error:");
      console.error(error.original);
    }
    process.exit(1);
  }
}
test();
