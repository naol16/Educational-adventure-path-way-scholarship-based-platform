import fs from 'fs';
import path from 'path';
import { sequelize } from '../config/sequelize.js';
import { Video } from '../models/Video.js';
import { Pdf } from '../models/Pdf.js';

const jsonPath = path.resolve(process.cwd(), '../toefl resources.txt');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const dataRaw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(dataRaw);

    for (const levelData of data.levels) {
      const level = levelData.level.toLowerCase(); // 'easy', 'medium', 'hard'
      console.log(`Processing level: ${level}`);

      for (const mission of levelData.missions) {
        const skill = mission.skill.charAt(0).toUpperCase() + mission.skill.slice(1); // 'Reading', 'Listening', 'Writing', 'Speaking'
        
        console.log(`  Mission: ${mission.focus_area} (${skill})`);

        // Insert videos
        if (mission.videos && Array.isArray(mission.videos)) {
          for (let i = 0; i < mission.videos.length; i++) {
            const videoId = mission.videos[i];
            const title = `${mission.focus_area} - Part ${i + 1}`;
            const description = mission.objective;
            const videolink = `https://www.youtube.com/watch?v=${videoId}`;
            const thubnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;

            const [video, created] = await Video.findOrCreate({
              where: { videolink, examType: 'TOEFL' },
              defaults: {
                title,
                description,
                videolink,
                thubnail,
                level,
                type: skill as 'Writing' | 'Speaking' | 'Reading' | 'Listening',
                examType: 'TOEFL',
                duration: '10:00', // Default
                resourceType: 'video'
              }
            });
            if (!created && video.level !== level) {
              await video.update({ level, title, description });
              console.log(`    * Updated Video: ${title} (level corrected to ${level})`);
            } else if (created) {
              console.log(`    + Inserted Video: ${title}`);
            }
          }
        }

        // Insert pdfs
        if (mission.pdfs && Array.isArray(mission.pdfs)) {
          for (let i = 0; i < mission.pdfs.length; i++) {
            const pdfLink = mission.pdfs[i];
            const title = `${mission.focus_area} - Resource ${i + 1}`;
            const description = mission.objective;

            const [pdf, created] = await Pdf.findOrCreate({
              where: { pdfLink, examType: 'TOEFL' },
              defaults: {
                title,
                description,
                pdfLink,
                level,
                type: skill as 'Writing' | 'Speaking' | 'Reading' | 'Listening',
                examType: 'TOEFL'
              }
            });
            if (!created && pdf.level !== level) {
              await pdf.update({ level, title, description });
              console.log(`    * Updated PDF: ${title} (level corrected to ${level})`);
            } else if (created) {
              console.log(`    + Inserted PDF: ${title}`);
            }
          }
        }
      }
    }

    console.log('TOEFL seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed:', err);
    process.exit(1);
  }
}

seed();
