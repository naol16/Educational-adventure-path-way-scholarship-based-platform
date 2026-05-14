import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { connectSequelize, sequelize } from "../config/sequelize.js";

const seed = async () => {
  try {
    await connectSequelize();
    console.log("Seeding resources...");

    const skills: ('Reading' | 'Listening' | 'Writing' | 'Speaking')[] = ['Reading', 'Listening', 'Writing', 'Speaking'];
    const levels: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    const examTypes: ('IELTS' | 'TOEFL')[] = ['IELTS', 'TOEFL'];

    const videoPlaceholders = [
      { link: "https://www.youtube.com/watch?v=7e90gBu4pas", thumb: "https://img.youtube.com/vi/7e90gBu4pas/0.jpg" },
      { link: "https://www.youtube.com/watch?v=0v9v76YjRyk", thumb: "https://img.youtube.com/vi/0v9v76YjRyk/0.jpg" },
      { link: "https://www.youtube.com/watch?v=sK3tS0fN_8I", thumb: "https://img.youtube.com/vi/sK3tS0fN_8I/0.jpg" },
      { link: "https://www.youtube.com/watch?v=NXzL-H6Sre0", thumb: "https://img.youtube.com/vi/NXzL-H6Sre0/0.jpg" },
      { link: "https://www.youtube.com/watch?v=JmYvY_7LshU", thumb: "https://img.youtube.com/vi/JmYvY_7LshU/0.jpg" }
    ];

    for (const exam of examTypes) {
      for (const level of levels) {
        for (const skill of skills) {
          // 1. Seed Videos (5 per skill/level)
          const count = await Video.count({ where: { level, type: skill, examType: exam } });
          if (count === 0) {
            console.log(`Seeding 5 videos for ${exam} ${skill} ${level}...`);
            const videos = videoPlaceholders.map((p, idx) => ({
              title: `${exam} ${skill} ${level.toUpperCase()} - Strategy ${idx + 1}`,
              description: `Master the essential ${skill} techniques for the ${exam} ${level} level.`,
              videolink: p.link,
              thubnail: p.thumb,
              level: level,
              type: skill,
              examType: exam,
              duration: "10:00",
              resourceType: 'video'
            }));
            await Video.bulkCreate(videos);
          }

          // 2. Refresh PDFs to ensure we have 12 (3 per mission)
          await Pdf.destroy({ where: { level, type: skill, examType: exam } });
          
          console.log(`Seeding 12 PDFs for ${exam} ${skill} ${level}... (3 per mission)`);
          const pdfs = [];
          for (let m = 1; m <= 4; m++) {
            pdfs.push(
              { title: `${skill} Phase ${m} - Strategy Guide`, pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", level, type: skill, examType: exam },
              { title: `${skill} Phase ${m} - Vocabulary List`, pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", level, type: skill, examType: exam },
              { title: `${skill} Phase ${m} - Practice Drills`, pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", level, type: skill, examType: exam }
            );
          }
          await Pdf.bulkCreate(pdfs as any);
        }
      }
    }

    console.log("✅ Resources seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
