import { Pdf } from "./src/models/Pdf.js";
import { Video } from "./src/models/Video.js";
import { sequelize } from "./src/config/sequelize.js";

async function check() {
  try {
    await sequelize.authenticate();
    const pdfCount = await Pdf.count();
    const videoCount = await Video.count();
    console.log(`PDF Count: ${pdfCount}`);
    console.log(`Video Count: ${videoCount}`);
    
    if (pdfCount > 0) {
        const pdfs = await Pdf.findAll({ limit: 5 });
        console.log("Sample PDFs:", JSON.stringify(pdfs, null, 2));
    }
    
    if (videoCount > 0) {
        const videos = await Video.findAll({ limit: 5 });
        console.log("Sample Videos:", JSON.stringify(videos, null, 2));
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
