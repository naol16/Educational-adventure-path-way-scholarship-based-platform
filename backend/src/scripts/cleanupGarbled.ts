import { Scholarship } from "../models/Scholarship.js";
import { sequelize } from "../config/sequelize.js";
import { Op } from "sequelize";

async function cleanup() {
    console.log("Starting cleanup of garbled scholarships...");
    await sequelize.authenticate();
    console.log("Connected to database.");

    // Find scholarships where title contains the replacement character 
    const garbled = await Scholarship.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.like]: '%\uFFFD%' } },
                { description: { [Op.like]: '%\uFFFD%' } }
            ]
        }
    });

    console.log(`Found ${garbled.length} garbled scholarships.`);

    for (const s of garbled) {
        console.log(`Deleting: ${s.title}`);
        await s.destroy();
    }

    console.log("Cleanup completed.");
    process.exit(0);
}

cleanup().catch(err => {
    console.error("Cleanup failed:", err);
    process.exit(1);
});
