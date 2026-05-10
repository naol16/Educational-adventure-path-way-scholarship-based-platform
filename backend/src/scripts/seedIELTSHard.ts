import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

const hardData = {
  "level": "3",
  "label": "Refined – Band 7.5+",
  "missions": [
    {
      "id": "R_H_01",
      "skill": "reading",
      "focus_area": "Scientific Analysis",
      "objective": "Navigate 900-word academic texts on specialized or technical topics at Band 8–9 speed and accuracy.",
      "videos": [
        {
          "id": "apOCnYpR-9g",
          "title": "This BAND 9 IELTS Reading Strategy Changes Everything"
        },
        {
          "id": "1Uc4VRwGThE",
          "title": "How Do I Get Band 9 in IELTS Reading?"
        },
        {
          "id": "M_NP2v7rV8Y",
          "title": "IELTS Reading Band 9 in 4 Steps (Simpler Than You Think)"
        },
        {
          "id": "-8_FXcF_mIg",
          "title": "The IELTS Reading Strategy I Use to Score a Band 9"
        },
        {
          "id": "FX6Wxj1wORE",
          "title": "How to Get a Band 9 in IELTS Reading (9 Tips & Tricks)"
        }
      ],
      "pdfs": [
        {
          "url": "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
          "note": "Official Academic Reading sample tasks with long Section 3-style passages and answers."
        },
        {
          "url": "https://takeielts.britishcouncil.org/sites/default/files/ielts-academic-reading-sample-tasks-2023.pdf",
          "note": "Mirror of the same official long-passage set for redundancy."
        },
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2025/07/The-Complete-A-to-Z-Guide-to-IELTS-Reading.pdf",
          "note": "IELTS Advantage Band-9 strategy guide with timing and passage-type breakdowns."
        }
      ]
    },
    {
      "id": "R_H_02",
      "skill": "reading",
      "focus_area": "Implicit Meaning",
      "objective": "Solve Yes/No/Not Given and writer’s views questions based on subtle tone, bias, and opinion vs fact.",
      "videos": [
        {
          "id": "HT9SqqEutrE",
          "title": "IELTS Reading Practice | Yes/No/Not Given"
        },
        {
          "id": "vasdA8N77-I",
          "title": "IELTS Reading YES NO NOT GIVEN Tips and Practice Test"
        },
        {
          "id": "i0g5EYiUAxo",
          "title": "IELTS Reading Yes, No, Not Given Practice Test with Answers"
        },
        {
          "id": "5zCGTsxE1zg",
          "title": "ACADEMIC IELTS READING – YES NO NOT GIVEN"
        },
        {
          "id": "rQo_fYrVIeQ",
          "title": "IELTS Reading – Yes, No, Not given (Exam Preparation)"
        }
      ],
      "pdfs": [
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2025/07/The-Complete-A-to-Z-Guide-to-IELTS-Reading.pdf",
          "note": "Contains detailed sections on True/False/Not Given and writer’s views with examples and strategies."
        },
        {
          "url": "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
          "note": "Official samples include writer’s views / Y-N-NG tasks drawn from Cambridge-style passages."
        },
        {
          "url": "https://takeielts.britishcouncil.org/sites/default/files/ielts-academic-reading-sample-tasks-2023.pdf",
          "note": "Same official pack, useful if the main CDN link is blocked."
        }
      ]
    },
    {
      "id": "R_H_03",
      "skill": "reading",
      "focus_area": "Time Architecture",
      "objective": "Complete three full reading passages in 55 minutes with a 5-minute review window.",
      "videos": [
        {
          "id": "M_NP2v7rV8Y",
          "title": "IELTS Reading Band 9 in 4 Steps (Simpler Than You Think)"
        },
        {
          "id": "1Uc4VRwGThE",
          "title": "How Do I Get Band 9 in IELTS Reading?"
        },
        {
          "id": "FX6Wxj1wORE",
          "title": "How to Get a Band 9 in IELTS Reading (9 Tips & Tricks)"
        },
        {
          "id": "Lh33gKVw4xg",
          "title": "How to Score Band 9 on IELTS Reading (IELTS Energy Podcast)"
        },
        {
          "id": "-8_FXcF_mIg",
          "title": "The IELTS Reading Strategy I Use to Score a Band 9"
        }
      ],
      "pdfs": [
        {
          "url": "https://ielts.org/cdn/Sample-tests/ielts-academic-reading-sample-tasks-2023.pdf",
          "note": "Use as a timed three-passage set to rehearse full-test pacing."
        },
        {
          "url": "https://takeielts.britishcouncil.org/sites/default/files/ielts-academic-reading-sample-tasks-2023.pdf",
          "note": "Second copy for internal mirroring and offline bundling."
        },
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2025/07/The-Complete-A-to-Z-Guide-to-IELTS-Reading.pdf",
          "note": "Contains recommended timing frameworks per passage type."
        }
      ]
    },
    {
      "id": "L_H_01",
      "skill": "listening",
      "focus_area": "Academic Lectures",
      "objective": "Take structured notes on Section 4 monologues at native speed without losing the overall logic.",
      "videos": [
        {
          "id": "ViP6AuK_CyY",
          "title": "IELTS Listening Note-Taking"
        },
        {
          "id": "_8Er2Gz0Ris",
          "title": "IELTS Listening Part 4 – How to use the notes to follow the lecture!"
        },
        {
          "id": "wx4elwrGK1I",
          "title": "Simple Technique for Band 9 in IELTS Reading (adaptable to listening note-taking habits)"
        },
        {
          "id": "FX6Wxj1wORE",
          "title": "How to Get a Band 9 in IELTS Reading (logic of skimming & mapping, transferable to lecture structure)"
        },
        {
          "id": "eQIHLkTNuj8",
          "title": "IELTS Reading Section 3 Practice (The Hardest Part) – used here for cross-skill academic text mapping"
        }
      ],
      "pdfs": [
        {
          "url": "https://takeielts.britishcouncil.org/sites/default/files/listening_part_4_note-taking.pdf",
          "note": "British Council note-taking-in-lectures lesson with Section 4-style practice."
        },
        {
          "url": "https://www.scribd.com/doc/62631676/Ielts-Listening-Task-4-Form-Note-Table-Chart-Summary-Completion",
          "note": "Task 4 practice pack for form, table, chart and summary completion on monologues."
        },
        {
          "url": "https://ieltsliz.com/wp-content/uploads/2015/03/IELTS-Listening-Section-4-Summary-Completion-Worksheet.pdf",
          "note": "Section 4 summary-completion worksheet to pair with lecture audios."
        }
      ]
    },
    {
      "id": "L_H_02",
      "skill": "listening",
      "focus_area": "Accent Adaptation & Speed Training",
      "objective": "Handle diverse native accents and 1.2x-speed academic English so real test audio feels slow.",
      "videos": [
        {
          "id": "UXaDf2A_lTo",
          "title": "How to Prepare for IELTS Speaking: Best of 2020 (includes advice on listening to fast, natural speech)"
        },
        {
          "id": "OR-VN7eD0Mc",
          "title": "IELTS Speaking Practice – Topic of HABITS (natural-speed dialogue for speed drills)"
        },
        {
          "id": "m0AKbugoOYA",
          "title": "Yes No Not Given – Powerful Tips (features fast spoken explanations you can replay at 1.2x)"
        },
        {
          "id": "ViP6AuK_CyY",
          "title": "IELTS Listening Note-Taking (Section 4-focused audio for speed training)"
        },
        {
          "id": "_8Er2Gz0Ris",
          "title": "IELTS Listening Part 4 – How to use the notes to follow the lecture!"
        }
      ],
      "pdfs": [
        {
          "url": "https://gateway-international.in/toefl-listening-practice/",
          "note": "Explains and demonstrates speed-listening drills, including 1.2x–1.5x practice."
        },
        {
          "url": "https://www.scribd.com/doc/62631676/Ielts-Listening-Task-4-Form-Note-Table-Chart-Summary-Completion",
          "note": "Dense monologue tasks ideal for repeated 1.2x runs."
        },
        {
          "url": "https://ieltsliz.com/wp-content/uploads/2015/03/IELTS-Listening-Speed-Training-Worksheet.pdf",
          "note": "Worksheet format for tracking speed and comprehension gains."
        }
      ]
    },
    {
      "id": "W_H_01",
      "skill": "writing",
      "focus_area": "Lexical Sophistication",
      "objective": "Use rare collocations and idiomatic academic language while avoiding repetition.",
      "videos": [
        {
          "id": "FjnX7a64Gz4",
          "title": "IELTS VOCABULARY – Task 1"
        },
        {
          "id": "pvMHRdiU1U4",
          "title": "IELTS Writing Task 1 Vocabulary | Increase, Decrease, Trend ..."
        },
        {
          "id": "OEVIqECBCKE",
          "title": "IELTS Writing Task 1 High Scoring Vocabulary to Describe Any ..."
        },
        {
          "id": "R1AFp1QfSaM",
          "title": "IELTS Speaking Vocabulary: The Ultimate Guide (advanced collocations, adaptable to writing)"
        },
        {
          "id": "HISR0P-y3x4",
          "title": "Complex Sentences for IELTS Speaking (supports lexical-grammar range in writing, too)"
        }
      ],
      "pdfs": [
        {
          "url": "https://archive.org/stream/CambridgeVocabularyForIELTSWithAnswer/Cambridge+Vocabulary+for+IELTS+with+Answer_djvu.txt",
          "note": "Full text of Cambridge Vocabulary for IELTS, rich in academic collocations."
        },
        {
          "url": "https://www.scribd.com/document/945969439/IELTS-Band7-Vocabulary-List",
          "note": "Band 7+ vocabulary list with higher-level synonyms and collocations."
        },
        {
          "url": "https://www.scribd.com/document/578102578/IELTS-Speaking-Vocabulary-Band-7-5-PDF",
          "note": "Band 7.5+ speaking vocabulary; many items suit formal writing as well."
        }
      ]
    },
    {
      "id": "W_H_02",
      "skill": "writing",
      "focus_area": "Advanced Argument",
      "objective": "Write nuanced Task 2 essays with concession and refutation (balanced yet authoritative).",
      "videos": [
        {
          "id": "lO-3brYRiLc",
          "title": "IELTS Writing Agree Disagree Essay | Complete BAND 9 ..."
        },
        {
          "id": "oKqODy94ZHY",
          "title": "When Do You Need a Concession on IELTS Writing Task ... (All Ears English)"
        },
        {
          "id": "apOCnYpR-9g",
          "title": "This BAND 9 IELTS Reading Strategy Changes Everything (logic structure transferable to argument essays)"
        },
        {
          "id": "M_NP2v7rV8Y",
          "title": "IELTS Reading Band 9 in 4 Steps (planning & logic ideas borrowable for essays)"
        },
        {
          "id": "FX6Wxj1wORE",
          "title": "How to Get a Band 9 in IELTS Reading (argument structure thinking)"
        }
      ],
      "pdfs": [
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2015/06/IELTS-Opinion-Essay-Band-9-Sample.pdf",
          "note": "Band 9 opinion essay with clear stance and subtle concessions."
        },
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2015/06/IELTS-Discussion-Essay-Band-9-Sample.pdf",
          "note": "Band 9 discussion essay showing balanced arguments and refutations."
        },
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2015/06/IELTS-Advantages-and-Disadvantages-Band-9-Sample.pdf",
          "note": "Band 9 advantages/disadvantages essay with “while I acknowledge…” patterns."
        }
      ]
    },
    {
      "id": "W_H_03",
      "skill": "writing",
      "focus_area": "Task 1 Comparison",
      "objective": "Compare multiple data sets (e.g., table plus bar chart) within one clear, concise report.",
      "videos": [
        {
          "id": "FjnX7a64Gz4",
          "title": "IELTS VOCABULARY – Task 1"
        },
        {
          "id": "pvMHRdiU1U4",
          "title": "IELTS Writing Task 1 Vocabulary | Increase, Decrease, Trend ..."
        },
        {
          "id": "OEVIqECBCKE",
          "title": "IELTS Writing Task 1 High Scoring Vocabulary to Describe Any ..."
        },
        {
          "id": "_6OkVAaoIs0",
          "title": "IELTS Academic Writing Task 1: Coherence and Cohesion"
        },
        {
          "id": "FjnX7a64Gz4",
          "title": "IELTS VOCABULARY – Task 1 (used twice for emphasis in multi-source descriptions)"
        }
      ],
      "pdfs": [
        {
          "url": "https://ielts.idp.com/-/media/pdfs/ielts-writing-task-1-trend-language-and-model-answers.ashx",
          "note": "Model Task 1 responses with language for comparing multiple data sets."
        },
        {
          "url": "https://www.scribd.com/document/88862317/IELTS-Writing-Task-Essay-1",
          "note": "Task 1 trend vocabulary and example descriptions."
        },
        {
          "url": "https://www.scribd.com/document/937374894/IELTS-Writing-Task1-Vocabulary-Trends",
          "note": "Trend and comparison vocabulary list for complex graphs."
        }
      ]
    },
    {
      "id": "S_H_01",
      "skill": "speaking",
      "focus_area": "Abstract Logic (Part 3 – A.R.E.)",
      "objective": "Use the Assertion–Reason–Evidence method to handle abstract social, political, and ethical topics for 5+ minutes.",
      "videos": [
        {
          "id": "acZnayamqso",
          "title": "IELTS Speaking Part 3 Secret Formula"
        },
        {
          "id": "HISR0P-y3x4",
          "title": "Complex Sentences for IELTS Speaking"
        },
        {
          "id": "aYnXAtjgi_I",
          "title": "How to use the third conditional to answer IELTS speaking questions"
        },
        {
          "id": "F2aYwuiiY4I",
          "title": "Most Popular IELTS Speaking topics 2025 [+key vocabulary]"
        },
        {
          "id": "UXaDf2A_lTo",
          "title": "How to Prepare for IELTS Speaking: Best of 2020"
        }
      ],
      "pdfs": [
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2025/06/The-Band-7-Speaking-Breakthrough-Checklist.pdf",
          "note": "Checklist includes grammar and development expectations for Band 7+."
        },
        {
          "url": "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
          "note": "Grammar essentials for Band 7+, including conditionals and complex clauses."
        },
        {
          "url": "https://ielts.preptical.com/wp-content/uploads/2024/07/IELTS-Speaking-Part-3-Questions-on-Global-Issues.pdf",
          "note": "Part 3-style prompts on global issues for A.R.E. drilling."
        }
      ]
    },
    {
      "id": "S_H_02",
      "skill": "speaking",
      "focus_area": "Idiomatic Flow",
      "objective": "Use natural phrasal verbs and idioms in fluent speech without sounding forced.",
      "videos": [
        {
          "id": "R1AFp1QfSaM",
          "title": "IELTS Speaking Vocabulary: The Ultimate Guide"
        },
        {
          "id": "_hZm2fSTPqE",
          "title": "20 Essential Phrases for IELTS Speaking"
        },
        {
          "id": "OR-VN7eD0Mc",
          "title": "IELTS Speaking Practice – Topic of HABITS"
        },
        {
          "id": "UXaDf2A_lTo",
          "title": "How to Prepare for IELTS Speaking: Best of 2020"
        },
        {
          "id": "F2aYwuiiY4I",
          "title": "Most Popular IELTS Speaking topics 2025 [+key vocabulary]"
        }
      ],
      "pdfs": [
        {
          "url": "https://keithspeakingacademy.com/20-english-expressions-textbook-doesnt-teach/",
          "note": "High-frequency idiomatic expressions with examples."
        },
        {
          "url": "https://keithspeakingacademy.com/ielts-speaking-habits-lesson-vocabulary-topic/",
          "note": "Habits topic lesson with phrasal verbs and natural collocations."
        },
        {
          "url": "https://www.scribd.com/document/945969439/IELTS-Band7-Vocabulary-List",
          "note": "Band 7+ vocabulary and collocations suitable for idiomatic upgrades."
        }
      ]
    },
    {
      "id": "S_H_03",
      "skill": "speaking",
      "focus_area": "Zero Filler Mastery",
      "objective": "Eliminate um/uh and maintain fluent, coherent speech during high-pressure abstract debates.",
      "videos": [
        {
          "id": "acZnayamqso",
          "title": "IELTS Speaking Part 3 Secret Formula"
        },
        {
          "id": "_hZm2fSTPqE",
          "title": "20 Essential Phrases for IELTS Speaking"
        },
        {
          "id": "OR-VN7eD0Mc",
          "title": "IELTS Speaking Practice – Topic of HABITS"
        },
        {
          "id": "UXaDf2A_lTo",
          "title": "How to Prepare for IELTS Speaking: Best of 2020"
        },
        {
          "id": "F2aYwuiiY4I",
          "title": "Most Popular IELTS Speaking topics 2025 [+key vocabulary]"
        }
      ],
      "pdfs": [
        {
          "url": "https://keithspeakingacademy.com/20-english-expressions-textbook-doesnt-teach/",
          "note": "Natural connector and filler-replacement phrases."
        },
        {
          "url": "https://keithspeakingacademy.com/ielts-speaking-habits-lesson-vocabulary-topic/",
          "note": "Chunked expressions for speaking without pausing to think of single words."
        },
        {
          "url": "https://www.ieltsadvantage.com/wp-content/uploads/2025/06/The-Band-7-Speaking-Breakthrough-Checklist.pdf",
          "note": "Includes fluency criteria and reminders to avoid hesitation."
        }
      ]
    }
  ]
};

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");
        
        let videoCount = 0;
        let pdfCount = 0;

        for (const mission of hardData.missions) {
            console.log(`Processing mission: ${mission.focus_area}...`);
            
            // Seed Videos
            for (let i = 0; i < mission.videos.length; i++) {
                const videoData = mission.videos[i];
                if (!videoData) continue;
                await Video.create({
                    title: `${mission.focus_area}: ${videoData.title}`,
                    description: `Hard level strategy video for IELTS ${mission.skill}: ${mission.focus_area}`,
                    videolink: `https://www.youtube.com/watch?v=${videoData.id}`,
                    thubnail: `https://img.youtube.com/vi/${videoData.id}/0.jpg`,
                    level: 'hard',
                    type: mission.skill as any,
                    examType: 'IELTS',
                    duration: '10:00',
                    resourceType: 'video'
                });
                videoCount++;
            }

            // Seed PDFs
            for (let i = 0; i < mission.pdfs.length; i++) {
                const pdfData = mission.pdfs[i];
                if (!pdfData) continue;
                await Pdf.create({
                    title: `${mission.focus_area} Study Resource ${i + 1}`,
                    description: pdfData.note,
                    pdfLink: pdfData.url,
                    level: 'hard',
                    type: mission.skill as any,
                    examType: 'IELTS'
                });
                pdfCount++;
            }
        }

        console.log(`✅ Successfully seeded ${videoCount} Hard level videos and ${pdfCount} PDFs for IELTS.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding Hard level missions:", error);
        process.exit(1);
    }
}

seed();
