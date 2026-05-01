import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

const toeflMediumData = {
  "level": "2",
  "label": "TOEFL – Precision Skills (Medium+)",
  "missions": [
    {
      "id": "T_R_M_01",
      "skill": "reading",
      "focus_area": "Speed-Reading Drills",
      "objective": "Push from ~180 to 270 words per minute using chunking and peripheral-vision drills.",
      "videos": [
        "ojn00v0zjzI",
        "dPzNVn0vERs",
        "iiiM2LcFqvk",
        "a6UGaQX4E30",
        "H1y0hWYt09M"
      ],
      "pdfs": [
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf",
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/"
      ]
    },
    {
      "id": "T_R_M_02",
      "skill": "reading",
      "focus_area": "Inference Mastery",
      "objective": "Answer 'It can be inferred that...' questions using the 'must be true' rule.",
      "videos": [
        "H1y0hWYt09M",
        "SG-Y3YSrBDo",
        "UNtWyqDPV0Y",
        "TEO-Wsh7bhw",
        "VFQDqZwzJjc"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information"
      ]
    },
    {
      "id": "T_R_M_03",
      "skill": "reading",
      "focus_area": "Negative Factual Trap",
      "objective": "Beat EXCEPT/NOT/LEAST questions by skimming and marking off correct items.",
      "videos": [
        "09vN_qYkrH0",
        "PplEa1Qe0xw",
        "No77vrFrZ84",
        "H1y0hWYt09M",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://www.in.ets.org/toefl/test-takers/ibt/transcript/reading-factual-information.html",
        "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information",
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf"
      ]
    },
    {
      "id": "T_R_M_04",
      "skill": "reading",
      "focus_area": "Rhetorical Purpose",
      "objective": "Analyze why the author mentioned a specific detail or used a certain word.",
      "videos": [
        "rdoPbdH7NT0",
        "GyrnKUXwkFI",
        "H1y0hWYt09M",
        "UNtWyqDPV0Y",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information"
      ]
    },
    {
      "id": "T_R_M_05",
      "skill": "reading",
      "focus_area": "Vocabulary-in-Context",
      "objective": "Use surrounding context to define unfamiliar academic words accurately.",
      "videos": [
        "viZLhskg9JE",
        "0n-mJ8NvEwQ",
        "H1y0hWYt09M",
        "UNtWyqDPV0Y",
        "fUNcr9l8MjA"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf"
      ]
    },
    {
      "id": "T_L_M_01",
      "skill": "listening",
      "focus_area": "Speaker’s Purpose & Attitude",
      "objective": "Identify why a speaker says something and capture sarcasm, uncertainty, or emphasis.",
      "videos": [
        "rtDwnbFm8KM",
        "i_3BtrDYeSo",
        "rsX3JTgQVfQ",
        "JPEfWz6MFSg",
        "SG-Y3YSrBDo"
      ],
      "pdfs": [
        "https://study.com/academy/lesson/toefl-function-and-attitude-strategy.html",
        "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
        "https://magoosh.com/toefl/toefl-listening-practice/"
      ]
    },
    {
      "id": "T_L_M_02",
      "skill": "listening",
      "focus_area": "Organization & Connection",
      "objective": "Track how a lecture is structured (Comparison, Cause/Effect, Steps in a Process).",
      "videos": [
        "CXPipNWbyuk",
        "rsX3JTgQVfQ",
        "rtDwnbFm8KM",
        "SG-Y3YSrBDo",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/toefl-listening-practice/",
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/"
      ]
    },
    {
      "id": "T_L_M_03",
      "skill": "listening",
      "focus_area": "Inference in Conversations",
      "objective": "Draw conclusions from indirect hints in campus dialogues.",
      "videos": [
        "SG-Y3YSrBDo",
        "rsX3JTgQVfQ",
        "VFQDqZwzJjc",
        "SXNvRcJtoPA",
        "njL86TkjK6E"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/toefl-listening-practice/",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section"
      ]
    },
    {
      "id": "T_L_M_04",
      "skill": "listening",
      "focus_area": "The Detail Filter",
      "objective": "Distinguish crucial 'testable' details from filler information in talks and conversations.",
      "videos": [
        "CXPipNWbyuk",
        "SG-Y3YSrBDo",
        "rtDwnbFm8KM",
        "rsX3JTgQVfQ",
        "JPEfWz6MFSg"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/toefl-listening-practice/",
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/"
      ]
    },
    {
      "id": "T_S_M_01",
      "skill": "speaking",
      "focus_area": "Task 2 — Integrated (Campus)",
      "objective": "Master the transition from reading a campus notice to summarizing a student's opinion.",
      "videos": [
        "e6pSvrYdfkA",
        "JPEfWz6MFSg",
        "TEO-Wsh7bhw",
        "smFWM1ABdxk",
        "DBw0HRAqC-E"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        "https://magoosh.com/toefl/toefl-listening-practice/"
      ]
    },
    {
      "id": "T_S_M_02",
      "skill": "speaking",
      "focus_area": "Task 3 — Integrated (Academic)",
      "objective": "Connect a professor's example back to a general academic concept clearly.",
      "videos": [
        "JPEfWz6MFSg",
        "SG-Y3YSrBDo",
        "rtDwnbFm8KM",
        "CXPipNWbyuk",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://magoosh.com/toefl/toefl-listening-practice/"
      ]
    },
    {
      "id": "T_S_M_03",
      "skill": "speaking",
      "focus_area": "The Bridge Template",
      "objective": "Use advanced transition phrases (e.g., 'The professor further illustrates this by…') to connect ideas.",
      "videos": [
        "JPEfWz6MFSg",
        "e6pSvrYdfkA",
        "smFWM1ABdxk",
        "DBw0HRAqC-E",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        "https://magoosh.com/toefl/toefl-listening-practice/"
      ]
    },
    {
      "id": "T_S_M_04",
      "skill": "speaking",
      "focus_area": "Timing Discipline",
      "objective": "Finish responses within ~2 seconds of the buzzer while staying coherent.",
      "videos": [
        "e6pSvrYdfkA",
        "JPEfWz6MFSg",
        "smFWM1ABdxk",
        "DBw0HRAqC-E",
        "09mPcpAg4y4"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        "https://www.myspeakingscore.com/blog"
      ]
    },
    {
      "id": "T_W_M_01",
      "skill": "writing",
      "focus_area": "Integrated Writing Framework",
      "objective": "Master the 'Comparison Intro' and 'Point–Counterpoint' body paragraph structure.",
      "videos": [
        "ojT7WIj8GZs",
        "njL86TkjK6E",
        "CXPipNWbyuk",
        "SG-Y3YSrBDo",
        "rsX3JTgQVfQ"
      ],
      "pdfs": [
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://magoosh.com/toefl/toefl-listening-practice/"
      ]
    },
    {
      "id": "T_W_M_02",
      "skill": "writing",
      "focus_area": "Academic Discussion Task",
      "objective": "Contribute to a class discussion with a unique point and high-level vocabulary.",
      "videos": [
        "ojT7WIj8GZs",
        "njL86TkjK6E",
        "SG-Y3YSrBDo",
        "rtDwnbFm8KM",
        "JPEfWz6MFSg"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/"
      ]
    },
    {
      "id": "T_W_M_03",
      "skill": "writing",
      "focus_area": "Paraphrasing Power",
      "objective": "Practice 50+ drills on rewriting reading points without copying the original text.",
      "videos": [
        "ojT7WIj8GZs",
        "ACompleteTOEFL",
        "H1y0hWYt09M",
        "0n-mJ8NvEwQ",
        "viZLhskg9JE"
      ],
      "pdfs": [
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf"
      ]
    },
    {
      "id": "T_W_M_04",
      "skill": "writing",
      "focus_area": "Cohesion & Flow",
      "objective": "Use logical connectors (Furthermore, Conversely, Subsequently) to ensure a 5/5 logic score.",
      "videos": [
        "ojT7WIj8GZs",
        "njL86TkjK6E",
        "CXPipNWbyuk",
        "rtDwnbFm8KM",
        "SG-Y3YSrBDo"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf"
      ]
    }
  ]
};

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        // Clear existing TOEFL Medium records
        await Video.destroy({ where: { level: 'medium', examType: 'TOEFL' } });
        await Pdf.destroy({ where: { level: 'medium', examType: 'TOEFL' } });
        console.log("Cleared existing TOEFL Medium records.");
        
        let videoCount = 0;
        let pdfCount = 0;

        for (const mission of toeflMediumData.missions) {
            console.log(`Processing mission: ${mission.focus_area}...`);
            
            // Seed Videos
            for (let i = 0; i < mission.videos.length; i++) {
                const videoId = mission.videos[i];
                await Video.create({
                    title: `${mission.focus_area}: Part ${i + 1}`,
                    description: `TOEFL Medium Level Precision Skills for ${mission.skill}: ${mission.focus_area}`,
                    videolink: `https://www.youtube.com/watch?v=${videoId}`,
                    thubnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
                    level: 'medium',
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
                    title: `${mission.focus_area} Strategic Guide ${i + 1}`,
                    description: `Academic PDF resource for mastering ${mission.focus_area} (TOEFL Medium).`,
                    pdfLink: pdfUrl,
                    level: 'medium',
                    type: mission.skill as any,
                    examType: 'TOEFL'
                });
                pdfCount++;
            }
        }

        console.log(`✅ Successfully seeded ${videoCount} Medium level TOEFL videos and ${pdfCount} PDFs.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding TOEFL Medium missions:", error);
        process.exit(1);
    }
}

seed();
