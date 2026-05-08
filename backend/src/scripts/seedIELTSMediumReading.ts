import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

const readingMediumData = [
  {
    "mission_name": "Synonym Mapping",
    "skill": "Reading",
    "level": "medium",
    "videos": [
      { "id": "iDgFyLz3fvw", "title": "One Strategy for Predicting Synonyms" },
      { "id": "5qAHsG5K5-Q", "title": "Paraphrasing in Listening and Reading" },
      { "id": "cWj4idwBSmQ", "title": "Box Matching Techniques" },
      { "id": "pelmvpv8IUs", "title": "Band 9 Keyword Mapping" },
      { "id": "3c8kH6r-g_s", "title": "Complex Academic Passage Strategy" }
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers.pdf",
      "https://www.cambridgeenglish.org/Images/734967-studies-in-language-testing-volume-25.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_academic_reading_sample_tasks.pdf"
    ]
  },
  {
    "mission_name": "Heading Mastery",
    "skill": "Reading",
    "level": "medium",
    "videos": [
      { "id": "zbIWiHP7KLY", "title": "Skimming vs. Detail-Oriented Reading" },
      { "id": "NI5c7-EDpNg", "title": "Eliminating Wrong Headings" },
      { "id": "KL2TyYplCcg", "title": "Band 7.5+ Heading Accuracy" },
      { "id": "3c8kH6r-g_s", "title": "Historical Passage Analysis" },
      { "id": "l85xSc1kn84", "title": "Heading Order Secrets" }
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers.pdf",
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf",
      "https://www.cambridgeenglish.org/Images/ielts-reading-sample-task-matching-features.pdf"
    ]
  },
  {
    "mission_name": "Summary Completion",
    "skill": "Reading",
    "level": "medium",
    "videos": [
      { "id": "KmKZG2XvKmA", "title": "Solving Real Cambridge Examples" },
      { "id": "0emYniTABKU", "title": "Predicting via Context & Grammar" },
      { "id": "FW-Q0roB6bU", "title": "Avoiding the Word Limit Trap" },
      { "id": "Lw2iEWrTLv8", "title": "The 5-Step Summary Method" },
      { "id": "Ub25UMR37wQ", "title": "Speed Reading for Summaries" }
    ],
    "pdfs": [
      "https://info.ielts.idp.com/rs/561-EIU-022/images/IELTSFocus-AcademicReading-StudentBook.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_reading_sample_task_tfng.pdf",
      "https://www.cambridgeenglish.org/Images/ielts-reading-sample-task-identifying-information.pdf"
    ]
  },
  {
    "mission_name": "Avoiding Examiner Traps",
    "skill": "Reading",
    "level": "medium",
    "videos": [
      { "id": "Set89aERUFo", "title": "T/F/NG and Multiple Choice Logic" },
      { "id": "BJxEN-w-4nE", "title": "Avoiding Keyword Repetition Traps" },
      { "id": "5qAHsG5K5-Q", "title": "Identifying Similar-Sounding Traps" },
      { "id": "3KDP8P-pvEw", "title": "Analyzing Logic Patterns" },
      { "id": "Kch2Tb_T2Pg", "title": "Multiple-Choice Nuance" }
    ],
    "pdfs": [
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers.pdf",
      "https://www.cambridgeenglish.org/Images/735098-studies-in-language-testing-volume-34.pdf"
    ]
  }
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");
        
        let videoCount = 0;
        let pdfCount = 0;

        for (const mission of readingMediumData) {
            console.log(`Processing mission: ${mission.mission_name}...`);
            
            // Seed Videos
            for (let i = 0; i < mission.videos.length; i++) {
                const videoData = mission.videos[i];
                if (!videoData) continue;
                await Video.create({
                    title: `${mission.mission_name}: ${videoData.title}`,
                    description: `Advanced strategy video for IELTS Reading: ${mission.mission_name}`,
                    videolink: `https://www.youtube.com/watch?v=${videoData.id}`,
                    thubnail: `https://img.youtube.com/vi/${videoData.id}/0.jpg`,
                    level: 'medium',
                    type: mission.skill as any,
                    examType: 'IELTS',
                    duration: '10:00',
                    resourceType: 'video'
                });
                videoCount++;
            }

            // Seed PDFs
            for (let i = 0; i < mission.pdfs.length; i++) {
                const pdfLink = mission.pdfs[i];
                await Pdf.create({
                    title: `${mission.mission_name} Study Resource ${i + 1}`,
                    description: `Academic resource for mastering ${mission.mission_name}`,
                    pdfLink: pdfLink,
                    level: 'medium',
                    type: mission.skill as any,
                    examType: 'IELTS'
                });
                pdfCount++;
            }
        }

        console.log(`✅ Successfully seeded ${videoCount} Medium level Reading videos and ${pdfCount} PDFs.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding Medium level Reading missions:", error);
        process.exit(1);
    }
}

seed();
