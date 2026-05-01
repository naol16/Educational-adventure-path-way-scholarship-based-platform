import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

const mediumOtherData = [
  // --- LISTENING ---
  {
    "mission_name": "Distractor Detection",
    "skill": "Listening",
    "level": "medium",
    "videos": [
      "dkt4BvVywZQ",
      "hOAsUNNyPIs",
      "i1vqbto3C_E",
      "X9LztgjC3EI",
      "nO_3CTofR3Y"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/2021-07/ielts_listening_practice_test_1.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/listening_practice_test_1_que_121012.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/listening_practice_answers_121012.doc_0.pdf"
    ]
  },
  {
    "mission_name": "Multi-Choice Logic",
    "skill": "Listening",
    "level": "medium",
    "videos": [
      "as6l3Nw5eSs",
      "AkW0IeF46cA",
      "q7xCHfDRdug",
      "VdysvRzGXjo",
      "hnF8qeVN0EI"
    ],
    "pdfs": [
      "https://www.ielts.org/-/media/pdfs/113313-listening-practice-test-3.ashx",
      "https://www.ielts.org/-/media/pdfs/113313-listening-sample-task-multiple-choice.ashx",
      "https://www.scribd.com/document/972676152/Study-Skills-Tutorial"
    ]
  },
  {
    "mission_name": "Tone & Attitude",
    "skill": "Listening",
    "level": "medium",
    "videos": [
      "GDxLfUiAx58",
      "d1gSzGjRGZ8",
      "F1WE2BzrNGU",
      "BCIWDo7smRA",
      "VdysvRzGXjo"
    ],
    "pdfs": [
      "https://www.scribd.com/document/618246144/unit-5-Listening",
      "https://www.scribd.com/document/618246144/unit-5-Listening/download",
      "https://www.scribd.com/document/979460445/IELTS-Listening-Test-3"
    ]
  },

  // --- WRITING ---
  {
    "mission_name": "Cohesion & Coherence",
    "skill": "Writing",
    "level": "medium",
    "videos": [
      "wSbv5bCY4No",
      "PYk3neHeUcw",
      "lYZlqEdcVss",
      "oG415lpZ4bI",
      "RTTonZnBY4Q"
    ],
    "pdfs": [
      "https://www.scribd.com/document/495122234/cohesivedevices-161214122601",
      "https://www.scribd.com/doc/296489584/Linking-Words-for-IELTS-Writing-Task-2",
      "https://flyielts.com/wp-content/uploads/2025/12/IELTS-Writing-Coherence-and-Cohesion-Key-Linking-Words.pdf"
    ]
  },
  {
    "mission_name": "Describing Trends",
    "skill": "Writing",
    "level": "medium",
    "videos": [
      "FjnX7a64Gz4",
      "pvMHRdiU1U4",
      "OEVIqECBCKE",
      "_6OkVAaoIs0",
      "4FQhIFBrj4w"
    ],
    "pdfs": [
      "https://www.scribd.com/document/88862317/IELTS-Writing-Task-Essay-1",
      "https://www.scribd.com/document/937374894/IELTS-Writing-Task1-Vocabulary-Trends",
      "https://ielts.idp.com/-/media/pdfs/ielts-writing-task-1-trend-language-and-model-answers.ashx"
    ]
  },
  {
    "mission_name": "Idea Generation",
    "skill": "Writing",
    "level": "medium",
    "videos": [
      "4FQhIFBrj4w",
      "k5igP_H-C90",
      "OEVIqECBCKE",
      "43FQhIFBrj4w",
      "OEVIqECBCKE"
    ],
    "pdfs": [
      "https://www.ieltsadvantage.com/wp-content/uploads/2015/03/IELTS-Advantages-Task-2-Idea-Generation.pdf",
      "https://www.ieltsadvantage.com/wp-content/uploads/2015/07/IELTS-Task-2-Planner.pdf",
      "https://www.ieltsadvantage.com/wp-content/uploads/2015/03/Ideas-for-IELTS-Writing-Task-2-Topic-List.pdf"
    ]
  },

  // --- SPEAKING ---
  {
    "mission_name": "The Storyteller (Part 2)",
    "skill": "Speaking",
    "level": "medium",
    "videos": [
      "fc9lDyIgdB4",
      "Y1KXNybhqoc",
      "v48vKG-d0JE",
      "ij0WCF4YpFg",
      "7JVb3-4tDSE"
    ],
    "pdfs": [
      "https://www.scribd.com/document/687362248/Speaking-Part-2-Templates",
      "https://magicaloverseas.com/wp-content/uploads/2021/01/Speaking-Part-Cue-Cards-Jan-to-April-2021.pdf",
      "https://ieltsbd.co/resources?download=Person+Related+Cue+Card+Template.pdf"
    ]
  },
  {
    "mission_name": "Lexical Range",
    "skill": "Speaking",
    "level": "medium",
    "videos": [
      "R1AFp1QfSaM",
      "_hZm2fSTPqE",
      "7JVb3-4tDSE",
      "HISR0P-y3x4",
      "acZnayamqso"
    ],
    "pdfs": [
      "https://www.scribd.com/document/945969439/IELTS-Band7-Vocabulary-List",
      "https://www.scribd.com/document/578102578/IELTS-Speaking-Vocabulary-Band-7-5-PDF",
      "https://keithspeakingacademy.com/education-ielts-speaking/"
    ]
  },
  {
    "mission_name": "Complex Structures",
    "skill": "Speaking",
    "level": "medium",
    "videos": [
      "HISR0P-y3x4",
      "aYnXAtjgi_I",
      "acZnayamqso",
      "UXaDf2A_lTo",
      "F2aYwuiiY4I"
    ],
    "pdfs": [
      "https://www.scribd.com/document/953813947/IELTS-Grammar-Guide-10pages",
      "https://www.ieltsadvantage.com/wp-content/uploads/2025/06/The-Band-7-Speaking-Breakthrough-Checklist.pdf",
      "https://keithspeakingacademy.com/20-english-expressions-textbook-doesnt-teach/"
    ]
  }
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");
        
        let videoCount = 0;
        let pdfCount = 0;

        for (const mission of mediumOtherData) {
            console.log(`Processing mission: ${mission.mission_name}...`);
            
            // Seed Videos
            for (let i = 0; i < mission.videos.length; i++) {
                const videoId = mission.videos[i];
                await Video.create({
                    title: `${mission.mission_name} - Part ${i + 1}`,
                    description: `Advanced strategy video for IELTS ${mission.skill}: ${mission.mission_name}`,
                    videolink: `https://www.youtube.com/watch?v=${videoId}`,
                    thubnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
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

        console.log(`✅ Successfully seeded ${videoCount} Medium level videos and ${pdfCount} PDFs for Listening, Writing, and Speaking.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding Medium level missions:", error);
        process.exit(1);
    }
}

seed();
