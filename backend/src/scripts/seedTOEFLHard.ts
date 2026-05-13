import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

const toeflHardData = {
  "level": "3",
  "label": "TOEFL – Advanced Mastery",
  "missions": [
    {
      "id": "T_R_H_01",
      "skill": "reading",
      "focus_area": "Academic Synthesis",
      "objective": "Master Prose Summary questions and distinguish major ideas from minor details.",
      "videos": [
        "LuLfdP8ft2M",
        "W0NFBxRxnXQ",
        "A4aEd12QXLo",
        "64nROSqA3Fw",
        "7wi2tLZTqIM"
      ],
      "pdfs": [
        "https://study.com/academy/lesson/toefl-prose-summary-strategy.html",
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/"
      ]
    },
    {
      "id": "T_R_H_02",
      "skill": "reading",
      "focus_area": "Abstract Logic Mapping",
      "objective": "Navigate 800-word specialized texts (archaeology, astrophysics, etc.) at full speed.",
      "videos": [
        "ojn00v0zjzI",
        "dPzNVn0vERs",
        "iiiM2LcFqvk",
        "jcrKSkZn814",
        "a6UGaQX4E30"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf"
      ]
    },
    {
      "id": "T_R_H_03",
      "skill": "reading",
      "focus_area": "Insert-Text Strategy",
      "objective": "Perfect the logic of where a new sentence fits into a paragraph using transition cues.",
      "videos": [
        "H1y0hWYt09M",
        "LuLfdP8ft2M",
        "W0NFBxRxnXQ",
        "A4aEd12QXLo",
        "64nROSqA3Fw"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information"
      ]
    },
    {
      "id": "T_R_H_04",
      "skill": "reading",
      "focus_area": "Complex Sentence Synthesis",
      "objective": "Handle double-negatives and deeply nested clauses without losing the core meaning.",
      "videos": [
        "H1y0hWYt09M",
        "SG-Y3YSrBDo",
        "viZLhskg9JE",
        "0n-mJ8NvEwQ",
        "UNtWyqDPV0Y"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://www.in.ets.org/toefl/test-takers/ibt/transcript/reading-factual-information.html"
      ]
    },
    {
      "id": "T_R_H_05",
      "skill": "reading",
      "focus_area": "The 18-Minute Passage",
      "objective": "Complete a full 10-question passage in 18 minutes with 95% accuracy.",
      "videos": [
        "W0NFBxRxnXQ",
        "LuLfdP8ft2M",
        "A4aEd12QXLo",
        "7wi2tLZTqIM",
        "iiiM2LcFqvk"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        "https://niec.edu.np/wp-content/uploads/2026/01/toefl-reading.pdf"
      ]
    },
    {
      "id": "T_L_H_01",
      "skill": "listening",
      "focus_area": "Complex Lecture Mapping",
      "objective": "Take structured notes on 6-minute dense monologues with multiple sub-topics.",
      "videos": [
        "PSgJBBf1RUY",
        "TEO-Wsh7bhw",
        "CXPipNWbyuk",
        "rtDwnbFm8KM",
        "rsX3JTgQVfQ"
      ],
      "pdfs": [
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        "https://magoosh.com/toefl/toefl-listening-practice/",
        "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/"
      ]
    },
    {
      "id": "T_L_H_02",
      "skill": "listening",
      "focus_area": "Nuance & Implied Meaning",
      "objective": "Catch subtle hints where the speaker implies something without stating it directly.",
      "videos": [
        "SG-Y3YSrBDo",
        "rtDwnbFm8KM",
        "i_3BtrDYeSo",
        "rsX3JTgQVfQ",
        "CXPipNWbyuk"
      ],
      "pdfs": [
        "https://study.com/academy/lesson/toefl-function-and-attitude-strategy.html",
        "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
        "https://magoosh.com/toefl/toefl-listening-practice/"
      ]
    },
    {
      "id": "T_L_H_03",
      "skill": "listening",
      "focus_area": "The Distractor Audit",
      "objective": "Analyze why 'almost correct' options are wrong in high-level listening tests.",
      "videos": [
        "CXPipNWbyuk",
        "rsX3JTgQVfQ",
        "SG-Y3YSrBDo",
        "TEO-Wsh7bhw",
        "PSgJBBf1RUY"
      ],
      "pdfs": [
        "https://magoosh.com/toefl/toefl-listening-practice/",
        "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/"
      ]
    },
    {
      "id": "T_L_H_04",
      "skill": "listening",
      "focus_area": "Academic Vocabulary 1000",
      "objective": "Master high-tier GRE/TOEFL vocabulary used in Section 4-style lectures.",
      "videos": [
        "fUNcr9l8MjA",
        "fE0W18Yz9hM",
        "Xe9XmGYEXaY",
        "I5nrDNi7bsI",
        "iiiM2LcFqvk"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf"
      ]
    },
    {
      "id": "T_S_H_01",
      "skill": "speaking",
      "focus_area": "Task 4 — Integrated (Advanced Lecture)",
      "objective": "Summarize a dense lecture with two complex points and multiple sub-examples.",
      "videos": [
        "njL86TkjK6E",
        "ojT7WIj8GZs",
        "e6pSvrYdfkA",
        "JPEfWz6MFSg",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/"
      ]
    },
    {
      "id": "T_S_H_02",
      "skill": "speaking",
      "focus_area": "Lexical Precision",
      "objective": "Replace common words with precise academic synonyms while keeping natural flow.",
      "videos": [
        "I5nrDNi7bsI",
        "nG1V5lj4kEU",
        "Xe9XmGYEXaY",
        "fUNcr9l8MjA",
        "fE0W18Yz9hM"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf"
      ]
    },
    {
      "id": "T_S_H_03",
      "skill": "speaking",
      "focus_area": "Zero-Filler Mastery",
      "objective": "Eliminate 'um/uh/like' during high-pressure 60-second responses.",
      "videos": [
        "HbD-KTMr9G0",
        "AB-mNTTekE0",
        "7B7ulnX3A0U",
        "DBw0HRAqC-E",
        "09mPcpAg4y4"
      ],
      "pdfs": [
        "https://www.myspeakingscore.com/blog",
        "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/"
      ]
    },
    {
      "id": "T_S_H_04",
      "skill": "speaking",
      "focus_area": "Intonation for Emphasis",
      "objective": "Use contrastive stress to highlight important points and sound like a native scholar.",
      "videos": [
        "AB-mNTTekE0",
        "7B7ulnX3A0U",
        "2rWfwKB-Wxg",
        "OJLmWsWC0L4",
        "HbD-KTMr9G0"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
        "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf"
      ]
    },
    {
      "id": "T_W_H_01",
      "skill": "writing",
      "focus_area": "Synthesizing Complex Data",
      "objective": "Handle Integrated tasks where reading and lecture have 3+ points of conflict.",
      "videos": [
        "FH8I74R6jlU",
        "njL86TkjK6E",
        "ojT7WIj8GZs",
        "PSgJBBf1RUY",
        "TEO-Wsh7bhw"
      ],
      "pdfs": [
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://magoosh.com/toefl/toefl-listening-practice/"
      ]
    },
    {
      "id": "T_W_H_02",
      "skill": "writing",
      "focus_area": "Advanced Discussion Logic",
      "objective": "Support your opinion with counter-argument and refutation patterns for a 5/5 score.",
      "videos": [
        "FH8I74R6jlU",
        "njL86TkjK6E",
        "ojT7WIj8GZs",
        "CXPipNWbyuk",
        "SG-Y3YSrBDo"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf"
      ]
    },
    {
      "id": "T_W_H_03",
      "skill": "writing",
      "focus_area": "Grammatical Complexity",
      "objective": "Demonstrate mastery of inversions, reduced relatives, and perfect tenses.",
      "videos": [
        "ojT7WIj8GZs",
        "njL86TkjK6E",
        "H1y0hWYt09M",
        "0n-mJ8NvEwQ",
        "viZLhskg9JE"
      ],
      "pdfs": [
        "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
        "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf",
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/"
      ]
    },
    {
      "id": "T_W_H_04",
      "skill": "writing",
      "focus_area": "The Perfect 30 Review",
      "objective": "Edit high-tier essays to remove clunky phrasing and improve academic sophistication.",
      "videos": [
        "njL86TkjK6E",
        "FH8I74R6jlU",
        "ojT7WIj8GZs",
        "CXPipNWbyuk",
        "SG-Y3YSrBDo"
      ],
      "pdfs": [
        "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        "https://www.toeflresources.com/toefl-integrated-writing/",
        "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages"
      ]
    }
  ]
};

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        // Clear existing TOEFL Hard records
        await Video.destroy({ where: { level: 'hard', examType: 'TOEFL' } });
        await Pdf.destroy({ where: { level: 'hard', examType: 'TOEFL' } });
        console.log("Cleared existing TOEFL Hard records.");
        
        let videoCount = 0;
        let pdfCount = 0;

        for (const mission of toeflHardData.missions) {
            console.log(`Processing mission: ${mission.focus_area}...`);
            
            // Seed Videos
            for (let i = 0; i < mission.videos.length; i++) {
                const videoId = mission.videos[i];
                await Video.create({
                    title: `${mission.focus_area}: Part ${i + 1}`,
                    description: `TOEFL Hard Level Refined Mastery for ${mission.skill}: ${mission.focus_area}`,
                    videolink: `https://www.youtube.com/watch?v=${videoId}`,
                    thubnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
                    level: 'hard',
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
                    title: `${mission.focus_area} Mastery Guide ${i + 1}`,
                    description: `Academic PDF resource for mastering ${mission.focus_area} (TOEFL Hard).`,
                    pdfLink: pdfUrl,
                    level: 'hard',
                    type: mission.skill as any,
                    examType: 'TOEFL'
                });
                pdfCount++;
            }
        }

        console.log(`✅ Successfully seeded ${videoCount} Hard level TOEFL videos and ${pdfCount} PDFs.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding TOEFL Hard missions:", error);
        process.exit(1);
    }
}

seed();
