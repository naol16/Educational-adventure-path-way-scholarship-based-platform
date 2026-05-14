import { UserService } from "../services/UserService.js";
import { connectSequelize } from "../config/sequelize.js";

async function test() {
  try {
    await connectSequelize();
    console.log("Testing UserService.getAllUsers...");
    const users = await UserService.getAllUsers(10, 0);
    console.log(`Success! Found ${users.length} users.`);
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
