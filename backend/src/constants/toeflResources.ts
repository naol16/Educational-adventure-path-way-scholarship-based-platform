/**
 * TOEFL iBT Complete Mission Catalog with Videos and PDF Resources
 * 51 unique missions across 3 levels (Easy, Medium, Hard) × 4 skills
 */

export interface ToeflMission {
  id: string;
  skill: "reading" | "listening" | "speaking" | "writing";
  focus_area: string;
  objective: string;
  videos: string[]; // YouTube IDs
  pdfs: string[]; // PDF URLs
}

export interface ToeflLevel {
  level: string;
  label: string;
  missions: ToeflMission[];
}

export const TOEFL_RESOURCES: ToeflLevel[] = [
  {
    level: "1",
    label: "TOEFL Foundations – Easy",
    missions: [
      {
        id: "T_R_E_01",
        skill: "reading",
        focus_area: "Academic Word Bank",
        objective:
          "Master the 570 Academic Word List families grouped by TOEFL frequency.",
        videos: [
          "fUNcr9l8MjA",
          "fE0W18Yz9hM",
          "Xe9XmGYEXaY",
          "nG1V5lj4kEU",
          "I5nrDNi7bsI",
        ],
        pdfs: [
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "http://ielpmarianna.pbworks.com/w/file/fetch/101175910/AWL_sublists1-10_alpha_col_pink.pdf",
          "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf",
        ],
      },
      {
        id: "T_R_E_02",
        skill: "reading",
        focus_area: "Sentence Decoder",
        objective:
          "Break down 30–50-word TOEFL sentences into core ideas using a 3-step routine.",
        videos: [
          "UNtWyqDPV0Y",
          "TEO-Wsh7bhw",
          "VFQDqZwzJjc",
          "HbD-KTMr9G0",
          "2rWfwKB-Wxg",
        ],
        pdfs: [
          "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://www.scribd.com/document/512960562/570-Academic-Words-List",
        ],
      },
      {
        id: "T_R_E_03",
        skill: "reading",
        focus_area: "Main Idea Hunter",
        objective:
          "Identify paragraph functions and topic sentences (Prose Summary foundation).",
        videos: [
          "UNtWyqDPV0Y",
          "fUNcr9l8MjA",
          "fE0W18Yz9hM",
          "SXNvRcJtoPA",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://niec.edu.np/wp-content/uploads/2026/01/toefl-reading.pdf",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        ],
      },
      {
        id: "T_R_E_04",
        skill: "reading",
        focus_area: "Question Type Map",
        objective:
          "Learn all 10 official TOEFL Reading question types and their specific traps.",
        videos: [
          "TEO-Wsh7bhw",
          "UNtWyqDPV0Y",
          "VFQDqZwzJjc",
          "fE0W18Yz9hM",
          "Xe9XmGYEXaY",
        ],
        pdfs: [
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://www.scribd.com/document/222211816/TOEFL-Questions-Types",
          "https://www.scribd.com/document/456400864/10-Types-of-TOEFL-Reading-Exercises-You-docx",
        ],
      },
      {
        id: "T_R_E_05",
        skill: "reading",
        focus_area: "Untimed Full Passage",
        objective:
          "Complete a 700-word passage with no time pressure to build confidence.",
        videos: [
          "UNtWyqDPV0Y",
          "SXNvRcJtoPA",
          "VFQDqZwzJjc",
          "TEO-Wsh7bhw",
          "fUNcr9l8MjA",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://niec.edu.np/wp-content/uploads/2026/01/toefl-reading.pdf",
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        ],
      },
      {
        id: "T_L_E_01",
        skill: "listening",
        focus_area: "Sound Recognition",
        objective:
          "Train your ear on reduced sounds, linking, and content-word stress.",
        videos: [
          "HbD-KTMr9G0",
          "2rWfwKB-Wxg",
          "AB-mNTTekE0",
          "OJLmWsWC0L4",
          "7B7ulnX3A0U",
        ],
        pdfs: [
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        ],
      },
      {
        id: "T_L_E_02",
        skill: "listening",
        focus_area: "Note-Taking Basics",
        objective:
          "Build a personal abbreviation system and a 2-column note format.",
        videos: [
          "TEO-Wsh7bhw",
          "HbD-KTMr9G0",
          "2rWfwKB-Wxg",
          "VFQDqZwzJjc",
          "AB-mNTTekE0",
        ],
        pdfs: [
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        ],
      },
      {
        id: "T_L_E_03",
        skill: "listening",
        focus_area: "Lecture Signpost Words",
        objective: "Memorize 50+ professor signposts as note-taking anchors.",
        videos: [
          "AB-mNTTekE0",
          "OJLmWsWC0L4",
          "7B7ulnX3A0U",
          "HbD-KTMr9G0",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
        ],
      },
      {
        id: "T_L_E_04",
        skill: "listening",
        focus_area: "Campus Conversation 101",
        objective:
          "Master the 4 campus conversation contexts and 3-act structure.",
        videos: [
          "I5nrDNi7bsI",
          "VFQDqZwzJjc",
          "SXNvRcJtoPA",
          "SXNvRcJtoPA",
          "AB-mNTTekE0",
        ],
        pdfs: [
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        ],
      },
      {
        id: "T_S_E_01",
        skill: "speaking",
        focus_area: "Pronunciation Core",
        objective:
          "Nail word-stress, sentence stress, and native-like intonation.",
        videos: [
          "HbD-KTMr9G0",
          "AB-mNTTekE0",
          "7B7ulnX3A0U",
          "2rWfwKB-Wxg",
          "OJLmWsWC0L4",
        ],
        pdfs: [
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        ],
      },
      {
        id: "T_S_E_02",
        skill: "speaking",
        focus_area: "The 15-Second Plan",
        objective:
          "Fill a fixed micro-template for Task 1 in under 12 seconds.",
        videos: [
          "DBw0HRAqC-E",
          "09mPcpAg4y4",
          "smFWM1ABdxk",
          "TEO-Wsh7bhw",
          "VFQDqZwzJjc",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        ],
      },
      {
        id: "T_S_E_03",
        skill: "speaking",
        focus_area: "Task 1 — Independent",
        objective:
          "Master the 4-move personal-preference response on 30 prompts.",
        videos: [
          "smFWM1ABdxk",
          "DBw0HRAqC-E",
          "09mPcpAg4y4",
          "HbD-KTMr9G0",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        ],
      },
      {
        id: "T_S_E_04",
        skill: "speaking",
        focus_area: "Fluency Drills",
        objective:
          "Reduce filler words ('um', 'uh') from 15+ per minute to under 5.",
        videos: [
          "HbD-KTMr9G0",
          "AB-mNTTekE0",
          "2rWfwKB-Wxg",
          "OJLmWsWC0L4",
          "7B7ulnX3A0U",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        ],
      },
      {
        id: "T_W_E_01",
        skill: "writing",
        focus_area: "Sentence Structure Toolkit",
        objective:
          "Produce error-free simple, compound, and complex sentences.",
        videos: [
          "DBw0HRAqC-E",
          "09mPcpAg4y4",
          "smFWM1ABdxk",
          "TEO-Wsh7bhw",
          "HbD-KTMr9G0",
        ],
        pdfs: [
          "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
          "https://www.scribd.com/document/901478972/Semicolon-Colon-Dashes",
          "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf",
        ],
      },
      {
        id: "T_W_E_02",
        skill: "writing",
        focus_area: "Academic Punctuation",
        objective:
          "Master commas, semicolons, colons, and dashes for formal writing.",
        videos: [
          "DBw0HRAqC-E",
          "09mPcpAg4y4",
          "TEO-Wsh7bhw",
          "smFWM1ABdxk",
          "VFQDqZwzJjc",
        ],
        pdfs: [
          "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf",
          "https://www.scribd.com/document/901478972/Semicolon-Colon-Dashes",
          "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
        ],
      },
      {
        id: "T_W_E_03",
        skill: "writing",
        focus_area: "Paragraph Blueprint",
        objective:
          "Automate the 4-part paragraph (Topic → Support 1 → Support 2 → Conclusion).",
        videos: [
          "smFWM1ABdxk",
          "DBw0HRAqC-E",
          "09mPcpAg4y4",
          "TEO-Wsh7bhw",
          "HbD-KTMr9G0",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        ],
      },
      {
        id: "T_W_E_04",
        skill: "writing",
        focus_area: "Note-Taking for Writing",
        objective:
          "Build a rebuttal grid for Integrated Writing and turn notes into a skeleton.",
        videos: [
          "TEO-Wsh7bhw",
          "HbD-KTMr9G0",
          "AB-mNTTekE0",
          "2rWfwKB-Wxg",
          "VFQDqZwzJjc",
        ],
        pdfs: [
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        ],
      },
    ],
  },
  {
    level: "2",
    label: "TOEFL – Precision Skills (Medium+)",
    missions: [
      {
        id: "T_R_M_01",
        skill: "reading",
        focus_area: "Speed-Reading Drills",
        objective:
          "Push from ~180 to 270 words per minute using chunking and peripheral-vision drills.",
        videos: [
          "ojn00v0zjzI",
          "dPzNVn0vERs",
          "iiiM2LcFqvk",
          "a6UGaQX4E30",
          "H1y0hWYt09M",
        ],
        pdfs: [
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf",
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
        ],
      },
      {
        id: "T_R_M_02",
        skill: "reading",
        focus_area: "Inference Mastery",
        objective:
          "Answer 'It can be inferred that...' questions using the 'must be true' rule.",
        videos: [
          "H1y0hWYt09M",
          "SG-Y3YSrBDo",
          "UNtWyqDPV0Y",
          "TEO-Wsh7bhw",
          "VFQDqZwzJjc",
        ],
        pdfs: [
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information",
        ],
      },
      {
        id: "T_R_M_03",
        skill: "reading",
        focus_area: "Negative Factual Trap",
        objective:
          "Beat EXCEPT/NOT/LEAST questions by skimming and marking off correct items.",
        videos: [
          "09vN_qYkrH0",
          "PplEa1Qe0xw",
          "No77vrFrZ84",
          "H1y0hWYt09M",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://www.in.ets.org/toefl/test-takers/ibt/transcript/reading-factual-information.html",
          "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information",
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        ],
      },
      {
        id: "T_R_M_04",
        skill: "reading",
        focus_area: "Rhetorical Purpose",
        objective:
          "Analyze why the author mentioned a specific detail or used a certain word.",
        videos: [
          "rdoPbdH7NT0",
          "GyrnKUXwkFI",
          "H1y0hWYt09M",
          "UNtWyqDPV0Y",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information",
        ],
      },
      {
        id: "T_R_M_05",
        skill: "reading",
        focus_area: "Vocabulary-in-Context",
        objective:
          "Use surrounding context to define unfamiliar academic words accurately.",
        videos: [
          "viZLhskg9JE",
          "0n-mJ8NvEwQ",
          "H1y0hWYt09M",
          "UNtWyqDPV0Y",
          "fUNcr9l8MjA",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf",
        ],
      },
      {
        id: "T_L_M_01",
        skill: "listening",
        focus_area: "Speaker's Purpose & Attitude",
        objective:
          "Identify why a speaker says something and capture sarcasm, uncertainty, or emphasis.",
        videos: [
          "rtDwnbFm8KM",
          "i_3BtrDYeSo",
          "rsX3JTgQVfQ",
          "JPEfWz6MFSg",
          "SG-Y3YSrBDo",
        ],
        pdfs: [
          "https://study.com/academy/lesson/toefl-function-and-attitude-strategy.html",
          "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
          "https://magoosh.com/toefl/toefl-listening-practice/",
        ],
      },
      {
        id: "T_L_M_02",
        skill: "listening",
        focus_area: "Organization & Connection",
        objective:
          "Track how a lecture is structured (Comparison, Cause/Effect, Steps in a Process).",
        videos: [
          "CXPipNWbyuk",
          "rsX3JTgQVfQ",
          "rtDwnbFm8KM",
          "SG-Y3YSrBDo",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://magoosh.com/toefl/toefl-listening-practice/",
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
          "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
        ],
      },
      {
        id: "T_L_M_03",
        skill: "listening",
        focus_area: "Inference in Conversations",
        objective: "Draw conclusions from indirect hints in campus dialogues.",
        videos: [
          "SG-Y3YSrBDo",
          "rsX3JTgQVfQ",
          "VFQDqZwzJjc",
          "SXNvRcJtoPA",
          "njL86TkjK6E",
        ],
        pdfs: [
          "https://magoosh.com/toefl/toefl-listening-practice/",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
        ],
      },
      {
        id: "T_L_M_04",
        skill: "listening",
        focus_area: "The Detail Filter",
        objective:
          "Distinguish crucial 'testable' details from filler information in talks and conversations.",
        videos: [
          "CXPipNWbyuk",
          "SG-Y3YSrBDo",
          "rtDwnbFm8KM",
          "rsX3JTgQVfQ",
          "JPEfWz6MFSg",
        ],
        pdfs: [
          "https://magoosh.com/toefl/toefl-listening-practice/",
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
          "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
        ],
      },
      {
        id: "T_S_M_01",
        skill: "speaking",
        focus_area: "Task 2 — Integrated (Campus)",
        objective:
          "Master the transition from reading a campus notice to summarizing a student's opinion.",
        videos: [
          "e6pSvrYdfkA",
          "JPEfWz6MFSg",
          "TEO-Wsh7bhw",
          "smFWM1ABdxk",
          "DBw0HRAqC-E",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
          "https://magoosh.com/toefl/toefl-listening-practice/",
        ],
      },
      {
        id: "T_S_M_02",
        skill: "speaking",
        focus_area: "Task 3 — Integrated (Academic)",
        objective:
          "Connect a professor's example back to a general academic concept clearly.",
        videos: [
          "JPEfWz6MFSg",
          "SG-Y3YSrBDo",
          "rtDwnbFm8KM",
          "CXPipNWbyuk",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://magoosh.com/toefl/toefl-listening-practice/",
        ],
      },
      {
        id: "T_S_M_03",
        skill: "speaking",
        focus_area: "The Bridge Template",
        objective: "Use advanced transition phrases to connect ideas smoothly.",
        videos: [
          "JPEfWz6MFSg",
          "e6pSvrYdfkA",
          "smFWM1ABdxk",
          "DBw0HRAqC-E",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
          "https://magoosh.com/toefl/toefl-listening-practice/",
        ],
      },
      {
        id: "T_S_M_04",
        skill: "speaking",
        focus_area: "Timing Discipline",
        objective:
          "Finish responses within ~2 seconds of the buzzer while staying coherent.",
        videos: [
          "e6pSvrYdfkA",
          "JPEfWz6MFSg",
          "smFWM1ABdxk",
          "DBw0HRAqC-E",
          "09mPcpAg4y4",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
          "https://www.myspeakingscore.com/blog",
        ],
      },
      {
        id: "T_W_M_01",
        skill: "writing",
        focus_area: "Integrated Writing Framework",
        objective:
          "Master the 'Comparison Intro' and 'Point–Counterpoint' body paragraph structure.",
        videos: [
          "ojT7WIj8GZs",
          "njL86TkjK6E",
          "CXPipNWbyuk",
          "SG-Y3YSrBDo",
          "rsX3JTgQVfQ",
        ],
        pdfs: [
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://magoosh.com/toefl/toefl-listening-practice/",
        ],
      },
      {
        id: "T_W_M_02",
        skill: "writing",
        focus_area: "Academic Discussion Task",
        objective:
          "Contribute to a class discussion with a unique point and high-level vocabulary.",
        videos: [
          "ojT7WIj8GZs",
          "njL86TkjK6E",
          "SG-Y3YSrBDo",
          "rtDwnbFm8KM",
          "JPEfWz6MFSg",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        ],
      },
      {
        id: "T_W_M_03",
        skill: "writing",
        focus_area: "Paraphrasing Power",
        objective: "Rewrite reading points without copying the original text.",
        videos: [
          "ojT7WIj8GZs",
          "njL86TkjK6E",
          "H1y0hWYt09M",
          "0n-mJ8NvEwQ",
          "viZLhskg9JE",
        ],
        pdfs: [
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
        ],
      },
      {
        id: "T_W_M_04",
        skill: "writing",
        focus_area: "Cohesion & Flow",
        objective: "Use logical connectors to ensure a 5/5 logic score.",
        videos: [
          "ojT7WIj8GZs",
          "njL86TkjK6E",
          "CXPipNWbyuk",
          "rtDwnbFm8KM",
          "SG-Y3YSrBDo",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf",
        ],
      },
    ],
  },
  {
    level: "3",
    label: "TOEFL – Advanced Mastery",
    missions: [
      {
        id: "T_R_H_01",
        skill: "reading",
        focus_area: "Academic Synthesis",
        objective:
          "Master Prose Summary questions and distinguish major ideas from minor details.",
        videos: [
          "LuLfdP8ft2M",
          "W0NFBxRxnXQ",
          "A4aEd12QXLo",
          "64nROSqA3Fw",
          "7wi2tLZTqIM",
        ],
        pdfs: [
          "https://study.com/academy/lesson/toefl-prose-summary-strategy.html",
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
        ],
      },
      {
        id: "T_R_H_02",
        skill: "reading",
        focus_area: "Abstract Logic Mapping",
        objective:
          "Navigate 800-word specialized texts (archaeology, astrophysics, etc.) at full speed.",
        videos: [
          "ojn00v0zjzI",
          "dPzNVn0vERs",
          "iiiM2LcFqvk",
          "jcrKSkZn814",
          "a6UGaQX4E30",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf",
        ],
      },
      {
        id: "T_R_H_03",
        skill: "reading",
        focus_area: "Insert-Text Strategy",
        objective:
          "Perfect the logic of where a new sentence fits into a paragraph using transition cues.",
        videos: [
          "H1y0hWYt09M",
          "LuLfdP8ft2M",
          "W0NFBxRxnXQ",
          "A4aEd12QXLo",
          "64nROSqA3Fw",
        ],
        pdfs: [
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://www.bestmytest.com/blog/toefl/toefl-reading-question-type-negative-factual-information",
        ],
      },
      {
        id: "T_R_H_04",
        skill: "reading",
        focus_area: "Complex Sentence Synthesis",
        objective:
          "Handle double-negatives and deeply nested clauses without losing the core meaning.",
        videos: [
          "H1y0hWYt09M",
          "SG-Y3YSrBDo",
          "viZLhskg9JE",
          "0n-mJ8NvEwQ",
          "UNtWyqDPV0Y",
        ],
        pdfs: [
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://www.in.ets.org/toefl/test-takers/ibt/transcript/reading-factual-information.html",
        ],
      },
      {
        id: "T_R_H_05",
        skill: "reading",
        focus_area: "The 18-Minute Passage",
        objective:
          "Complete a full 10-question passage in 18 minutes with 95% accuracy.",
        videos: [
          "W0NFBxRxnXQ",
          "LuLfdP8ft2M",
          "A4aEd12QXLo",
          "7wi2tLZTqIM",
          "iiiM2LcFqvk",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/100-reading-questions-for-the-toefl-test-pdf-included/",
          "https://magoosh.com/toefl/files/2020/08/TOEFL-Reading-Question-Types-and-Strategies-PDF-3.pdf",
          "https://niec.edu.np/wp-content/uploads/2026/01/toefl-reading.pdf",
        ],
      },
      {
        id: "T_L_H_01",
        skill: "listening",
        focus_area: "Complex Lecture Mapping",
        objective:
          "Take structured notes on 6-minute dense monologues with multiple sub-topics.",
        videos: [
          "PSgJBBf1RUY",
          "TEO-Wsh7bhw",
          "CXPipNWbyuk",
          "rtDwnbFm8KM",
          "rsX3JTgQVfQ",
        ],
        pdfs: [
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
          "https://magoosh.com/toefl/toefl-listening-practice/",
          "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
        ],
      },
      {
        id: "T_L_H_02",
        skill: "listening",
        focus_area: "Nuance & Implied Meaning",
        objective:
          "Catch subtle hints where the speaker implies something without stating it directly.",
        videos: [
          "SG-Y3YSrBDo",
          "rtDwnbFm8KM",
          "i_3BtrDYeSo",
          "rsX3JTgQVfQ",
          "CXPipNWbyuk",
        ],
        pdfs: [
          "https://study.com/academy/lesson/toefl-function-and-attitude-strategy.html",
          "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
          "https://magoosh.com/toefl/toefl-listening-practice/",
        ],
      },
      {
        id: "T_L_H_03",
        skill: "listening",
        focus_area: "The Distractor Audit",
        objective:
          "Analyze why 'almost correct' options are wrong in high-level listening tests.",
        videos: [
          "CXPipNWbyuk",
          "rsX3JTgQVfQ",
          "SG-Y3YSrBDo",
          "TEO-Wsh7bhw",
          "PSgJBBf1RUY",
        ],
        pdfs: [
          "https://magoosh.com/toefl/toefl-listening-practice/",
          "https://www.bestmytest.com/blog/toefl/how-take-notes-toefl-listening-section",
          "https://www.test-pare.com/ibt-toefl-listening-pay-attention-speakers-tone-transitions/",
        ],
      },
      {
        id: "T_L_H_04",
        skill: "listening",
        focus_area: "Academic Vocabulary 1000",
        objective:
          "Master high-tier GRE/TOEFL vocabulary used in Section 4-style lectures.",
        videos: [
          "fUNcr9l8MjA",
          "fE0W18Yz9hM",
          "Xe9XmGYEXaY",
          "I5nrDNi7bsI",
          "iiiM2LcFqvk",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf",
        ],
      },
      {
        id: "T_S_H_01",
        skill: "speaking",
        focus_area: "Task 4 — Integrated (Advanced Lecture)",
        objective:
          "Summarize a dense lecture with two complex points and multiple sub-examples.",
        videos: [
          "njL86TkjK6E",
          "ojT7WIj8GZs",
          "e6pSvrYdfkA",
          "JPEfWz6MFSg",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
        ],
      },
      {
        id: "T_S_H_02",
        skill: "speaking",
        focus_area: "Lexical Precision",
        objective:
          "Replace common words with precise academic synonyms while keeping natural flow.",
        videos: [
          "I5nrDNi7bsI",
          "nG1V5lj4kEU",
          "Xe9XmGYEXaY",
          "fUNcr9l8MjA",
          "fE0W18Yz9hM",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://studyabroadlife.org/wp-content/uploads/2025/03/the-ultimate-toefl-vocabulary-list-1.pdf.pdf",
        ],
      },
      {
        id: "T_S_H_03",
        skill: "speaking",
        focus_area: "Zero-Filler Mastery",
        objective:
          "Eliminate 'um/uh/like' during high-pressure 60-second responses.",
        videos: [
          "HbD-KTMr9G0",
          "AB-mNTTekE0",
          "7B7ulnX3A0U",
          "DBw0HRAqC-E",
          "09mPcpAg4y4",
        ],
        pdfs: [
          "https://www.myspeakingscore.com/blog",
          "https://tstprep.com/articles/toefl/guide-for-the-toefl-test-speaking-question-1/",
          "https://www.toeflresources.com/speaking-section/toefl-speaking-samples/",
        ],
      },
      {
        id: "T_S_H_04",
        skill: "speaking",
        focus_area: "Intonation for Emphasis",
        objective:
          "Use contrastive stress to highlight important points and sound like a native scholar.",
        videos: [
          "AB-mNTTekE0",
          "7B7ulnX3A0U",
          "2rWfwKB-Wxg",
          "OJLmWsWC0L4",
          "HbD-KTMr9G0",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-ultimate-vocabulary-list-for-the-toefl-test/",
          "https://ccaps.umn.edu/sites/ccaps.umn.edu/files/Academic%20Word%20List%20570%20words_0.pdf",
          "https://charbzaban.com/wp-content/uploads/2019/06/570.pdf",
        ],
      },
      {
        id: "T_W_H_01",
        skill: "writing",
        focus_area: "Synthesizing Complex Data",
        objective:
          "Handle Integrated tasks where reading and lecture have 3+ points of conflict.",
        videos: [
          "FH8I74R6jlU",
          "njL86TkjK6E",
          "ojT7WIj8GZs",
          "PSgJBBf1RUY",
          "TEO-Wsh7bhw",
        ],
        pdfs: [
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://magoosh.com/toefl/toefl-listening-practice/",
        ],
      },
      {
        id: "T_W_H_02",
        skill: "writing",
        focus_area: "Advanced Discussion Logic",
        objective:
          "Support your opinion with counter-argument and refutation patterns for a 5/5 score.",
        videos: [
          "FH8I74R6jlU",
          "njL86TkjK6E",
          "ojT7WIj8GZs",
          "CXPipNWbyuk",
          "SG-Y3YSrBDo",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf",
        ],
      },
      {
        id: "T_W_H_03",
        skill: "writing",
        focus_area: "Grammatical Complexity",
        objective:
          "Demonstrate mastery of inversions, reduced relatives, and perfect tenses.",
        videos: [
          "ojT7WIj8GZs",
          "njL86TkjK6E",
          "H1y0hWYt09M",
          "0n-mJ8NvEwQ",
          "viZLhskg9JE",
        ],
        pdfs: [
          "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
          "https://crk.umn.edu/sites/crk.umn.edu/files/2023-03/semicolons-colons-dashes.pdf",
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
        ],
      },
      {
        id: "T_W_H_04",
        skill: "writing",
        focus_area: "The Perfect 30 Review",
        objective:
          "Edit high-tier essays to remove clunky phrasing and improve academic sophistication.",
        videos: [
          "njL86TkjK6E",
          "FH8I74R6jlU",
          "ojT7WIj8GZs",
          "CXPipNWbyuk",
          "SG-Y3YSrBDo",
        ],
        pdfs: [
          "https://tstprep.com/articles/toefl/the-complete-guide-to-toefl-writing/",
          "https://www.toeflresources.com/toefl-integrated-writing/",
          "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
        ],
      },
    ],
  },
];

/**
 * Helper function to get missions by level and skill
 */
export function getToeflMissionsByLevelAndSkill(
  level: "1" | "2" | "3",
  skill: "reading" | "listening" | "speaking" | "writing",
): ToeflMission[] {
  const levelData = TOEFL_RESOURCES.find((l) => l.level === level);
  if (!levelData) return [];
  return levelData.missions.filter((m) => m.skill === skill);
}

/**
 * Helper function to get all missions for a level
 */
export function getToeflMissionsByLevel(
  level: "1" | "2" | "3",
): ToeflMission[] {
  const levelData = TOEFL_RESOURCES.find((l) => l.level === level);
  return levelData?.missions || [];
}

/**
 * Helper function to get a specific mission by ID
 */
export function getToeflMissionById(id: string): ToeflMission | undefined {
  for (const level of TOEFL_RESOURCES) {
    const mission = level.missions.find((m) => m.id === id);
    if (mission) return mission;
  }
  return undefined;
}
