import { pool } from "./database/database.js";
import { ScholarshipSource } from "./src/models/ScholarshipSource.js";
import { Scholarship } from "./src/models/Scholarship.js";
import { TrackedScholarship } from "./src/models/TrackedScholarship.js";

async function checkDB() {
  try {
    const sourceCount = await ScholarshipSource.count();
    console.log(`ScholarshipSources: ${sourceCount}`);

    const scholarshipCount = await Scholarship.count();
    console.log(`Scholarships: ${scholarshipCount}`);

    const trackedCount = await TrackedScholarship.count();
    console.log(`TrackedScholarships: ${trackedCount}`);

    if (scholarshipCount === 0) {
      console.log("\n⚠️  No actual scholarships found in database!");
      console.log("You seeded ScholarshipSources (115 websites), but not Scholarship records (actual listings).");
      console.log("\nScholarships must be scraped from sources or manually created.");
      console.log("\nAvailable options:");
      console.log("1. Run the scholarship discovery/scraping pipeline");
      console.log("2. Create a seed script for scholarships manually");
      console.log("3. Use admin tools to add scholarships via API");
    }
   } catch (err) {
     const error = err instanceof Error ? err : new Error(String(err));
     console.error("Error:", error.message);
   } finally {
    await pool.end();
  }
}

checkDB();
