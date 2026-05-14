import { CounselorService } from "../services/CounselorService.js";
import { connectSequelize } from "../config/sequelize.js";

async function test() {
  try {
    await connectSequelize();
    console.log("Testing CounselorService.adminList...");
    const counselors = await CounselorService.adminList();
    console.log(`Success! Found ${counselors.length} counselors.`);
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
