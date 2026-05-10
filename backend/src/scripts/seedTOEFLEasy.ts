import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

const toeflEasyData = {
  "level": "1",
  "label": "TOEFL Foundations – Easy",
  "missions": [
    {
      "id": "T_R_E_01",
      "skill": "reading",
      "focus_area": "Academic Word Bank",
      "objective": "Master the 570 Academic Word List families grouped by TOEFL frequency.",
      "videos": [
        "fUNcr9l8MjA",
        "fE0W18Yz9hM",
        "Xe9XmGYEXaY",
        "nG1V5lj4kEU",
        "I5nrDNi7bsI"
      ],
      "pdfs": [
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "http://ielpmarianna.pbworks.com/w/file/fetch/101175910/AWL_sublists1-10_alpha_col_pink.pdf",
        "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf"
      ]
    },
    {
      "id": "T_R_E_02",
      "skill": "reading",
      "focus_area": "Sentence Decoder",
      "objective": "Break down 30–50-word TOEFL sentences into core ideas using a 3-step routine.",
      "videos": [
        "UNtWyqDPV0Y",
        "TEO-Wsh7bhw",
        "VFQDqZwzJjc",
        "HbD-KTMr9G0",
        "2rWfwKB-Wxg"
      ],
      "pdfs": [
        "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://www.scribd.com/document/512960562/570-Academic-Words-List"
      ]
    },
    {
      "id": "T_R_E_03",
      "skill": "reading",
      "focus_area": "Main Idea Hunter",
      "objective": "Identify paragraph functions and topic sentences (Prose Summary foundation).",
      "videos": [
        "UNtWyqDPV0Y",
        "fUNcr9l8MjA",
        "fE0W18Yz9hM",
        "SXNvRcJtoPA",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://niec.edu.np/wp-content/uploads/2026/01/toefl-reading.pdf",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/"
      ]
    },
    {
      "id": "T_R_E_04",
      "skill": "reading",
      "focus_area": "Question Type Map",
      "objective": "Learn all 10 official TOEFL Reading question types and their specific traps.",
      "videos": [
        "TEO-Wsh7bhw",
        "UNtWyqDPV0Y",
        "VFQDqZwzJjc",
        "fE0W18Yz9hM",
        "Xe9XmGYEXaY"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://www.scribd.com/document/222211816/TOEFL-Questions-Types",
        "https://www.scribd.com/document/456400864/10-Types-of-TOEFL-Reading-Exercises-You-docx"
      ]
    },
    {
      "id": "T_R_E_05",
      "skill": "reading",
      "focus_area": "Untimed Full Passage",
      "objective": "Complete a 700-word passage with no time pressure to build confidence.",
      "videos": [
        "UNtWyqDPV0Y",
        "SXNvRcJtoPA",
        "VFQDqZwzJjc",
        "TEO-Wsh7bhw",
        "fUNcr9l8MjA"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://niec.edu.np/wp-content/uploads/2026/01/toefl-reading.pdf",
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf"
      ]
    },
    {
      "id": "T_L_E_01",
      "skill": "listening",
      "focus_area": "Sound Recognition",
      "objective": "Train your ear on reduced sounds, linking, and content-word stress.",
      "videos": [
        "HbD-KTMr9G0",
        "2rWfwKB-Wxg",
        "AB-mNTTekE0",
        "OJLmWsWC0L4",
        "7B7ulnX3A0U"
      ],
      "pdfs": [
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/"
      ]
    },
    {
      "id": "T_L_E_02",
      "skill": "listening",
      "focus_area": "Note-Taking Basics",
      "objective": "Build a personal abbreviation system and a 2-column note format.",
      "videos": [
        "TEO-Wsh7bhw",
        "HbD-KTMr9G0",
        "2rWfwKB-Wxg",
        "VFQDqZwzJjc",
        "AB-mNTTekE0"
      ],
      "pdfs": [
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf"
      ]
    },
    {
      "id": "T_L_E_03",
      "skill": "listening",
      "focus_area": "Lecture Signpost Words",
      "objective": "Memorize 50+ professor signposts as note-taking anchors.",
      "videos": [
        "AB-mNTTekE0",
        "OJLmWsWC0L4",
        "7B7ulnX3A0U",
        "HbD-KTMr9G0",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf"
      ]
    },
    {
      "id": "T_L_E_04",
      "skill": "listening",
      "focus_area": "Campus Conversation 101",
      "objective": "Master the 4 campus conversation contexts and 3-act structure.",
      "videos": [
        "I5nrDNi7bsI",
        "VFQDqZwzJjc",
        "SXNvRcJtoPA",
        "SXNvRcJtoPA",
        "AB-mNTTekE0"
      ],
      "pdfs": [
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/"
      ]
    },
    {
      "id": "T_S_E_01",
      "skill": "speaking",
      "focus_area": "Pronunciation Core",
      "objective": "Nail word-stress, sentence stress, and native-like intonation.",
      "videos": [
        "HbD-KTMr9G0",
        "AB-mNTTekE0",
        "7B7ulnX3A0U",
        "2rWfwKB-Wxg",
        "OJLmWsWC0L4"
      ],
      "pdfs": [
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/"
      ]
    },
    {
      "id": "T_S_E_02",
      "skill": "speaking",
      "focus_area": "The 15-Second Plan",
      "objective": "Fill a fixed micro-template for Task 1 in under 12 seconds.",
      "videos": [
        "DBw0HRAqC-E",
        "09mPcpAg4y4",
        "smFWM1ABdxk",
        "TEO-Wsh7bhw",
        "VFQDqZwzJjc"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/"
      ]
    },
    {
      "id": "T_S_E_03",
      "skill": "speaking",
      "focus_area": "Task 1 — Independent",
      "objective": "Master the 4-move personal-preference response on 30 prompts.",
      "videos": [
        "smFWM1ABdxk",
        "DBw0HRAqC-E",
        "09mPcpAg4y4",
        "HbD-KTMr9G0",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/"
      ]
    },
    {
      "id": "T_S_E_04",
      "skill": "speaking",
      "focus_area": "Fluency Drills",
      "objective": "Reduce filler words ('um', 'uh') from 15+ per minute to under 5.",
      "videos": [
        "HbD-KTMr9G0",
        "AB-mNTTekE0",
        "2rWfwKB-Wxg",
        "OJLmWsWC0L4",
        "7B7ulnX3A0U"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/"
      ]
    },
    {
      "id": "T_W_E_01",
      "skill": "writing",
      "focus_area": "Sentence Structure Toolkit",
      "objective": "Produce error-free simple, compound, and complex sentences.",
      "videos": [
        "DBw0HRAqC-E",
        "09mPcpAg4y4",
        "smFWM1ABdxk",
        "TEO-Wsh7bhw",
        "HbD-KTMr9G0"
      ],
      "pdfs": [
        "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
        "https://www.scribd.com/document/901478972/Semicolon-Colon-Dashes",
        "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf"
      ]
    },
    {
      "id": "T_W_E_02",
      "skill": "writing",
      "focus_area": "Academic Punctuation",
      "objective": "Master commas, semicolons, colons, and dashes for formal writing.",
      "videos": [
        "DBw0HRAqC-E",
        "09mPcpAg4y4",
        "TEO-Wsh7bhw",
        "smFWM1ABdxk",
        "VFQDqZwzJjc"
      ],
      "pdfs": [
        "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf",
        "https://www.scribd.com/document/901478972/Semicolon-Colon-Dashes",
        "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages"
      ]
    },
    {
      "id": "T_W_E_03",
      "skill": "writing",
      "focus_area": "Paragraph Blueprint",
      "objective": "Automate the 4-part paragraph (Topic → Support 1 → Support 2 → Conclusion).",
      "videos": [
        "smFWM1ABdxk",
        "DBw0HRAqC-E",
        "09mPcpAg4y4",
        "TEO-Wsh7bhw",
        "HbD-KTMr9G0"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/"
      ]
    },
    {
      "id": "T_W_E_04",
      "skill": "writing",
      "focus_area": "Note-Taking for Writing",
      "objective": "Build a rebuttal grid for Integrated Writing and turn notes into a skeleton.",
      "videos": [
        "TEO-Wsh7bhw",
        "HbD-KTMr9G0",
        "AB-mNTTekE0",
        "2rWfwKB-Wxg",
        "VFQDqZwzJjc"
      ],
      "pdfs": [
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/"
      ]
    }
  ]
};

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        // Clear existing TOEFL Easy records to ensure a fresh, consistent seed
        await Video.destroy({ where: { level: 'easy', examType: 'TOEFL' } });
        await Pdf.destroy({ where: { level: 'easy', examType: 'TOEFL' } });
        console.log("Cleared existing TOEFL Easy records.");
        
        let videoCount = 0;
        let pdfCount = 0;

        for (const mission of toeflEasyData.missions) {
            console.log(`Processing mission: ${mission.focus_area}...`);
            
            // Seed Videos
            for (let i = 0; i < mission.videos.length; i++) {
                const videoId = mission.videos[i];
                await Video.create({
                    title: `${mission.focus_area}: Part ${i + 1}`,
                    description: `TOEFL Easy Level Foundations for ${mission.skill}: ${mission.focus_area}`,
                    videolink: `https://www.youtube.com/watch?v=${videoId}`,
                    thubnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
                    level: 'easy',
                    type: mission.skill as any,
                    examType: 'TOEFL',
                    duration: '10:00',
                    resourceType: 'video'
                });
                videoCount++;
            }

            // Seed PDFs
            for (let i = 0; i < mission.pdfs.length; i++) {
                const pdfUrl = mission.pdfs[i];
                await Pdf.create({
                    title: `${mission.focus_area} Study Guide ${i + 1}`,
                    description: `Academic PDF resource for mastering ${mission.focus_area} (TOEFL Easy).`,
                    pdfLink: pdfUrl,
                    level: 'easy',
                    type: mission.skill as any,
                    examType: 'TOEFL'
                });
                pdfCount++;
            }
        }

        console.log(`✅ Successfully seeded ${videoCount} Easy level TOEFL videos and ${pdfCount} PDFs.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding TOEFL missions:", error);
        process.exit(1);
    }
}

seed();
