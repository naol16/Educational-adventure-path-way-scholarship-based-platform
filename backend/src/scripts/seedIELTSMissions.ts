import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

const data = [
  {
    "mission_name": "Decoding Foundations",
    "skill": "Reading",
    "level": "easy",
    "videos": [
      "mKx-aXvT6XU",
      "KyLp8_Sreic",
      "pE3Xv9z4D2U",
      "rLdM5Nf0t2U",
      "vU6G_pS0_X4"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers.pdf",
      "https://info.ielts.idp.com/rs/561-EIU-022/images/IELTSFocus-AcademicReading-StudentBook.pdf",
      "https://www.cambridgeenglish.org/Images/23382-ielts-reading-test-sample-general-training.pdf"
    ]
  },
  {
    "mission_name": "Scanning for Specifics",
    "skill": "Reading",
    "level": "easy",
    "videos": [
      "hI_wK9oYpWw",
      "y2fVv06B_Qk",
      "8Ue13YVb4X0",
      "Q_70v8vS_3Y",
      "G_UoF66ZpRE"
    ],
    "pdfs": [
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_academic_reading_sample_tasks.pdf",
      "https://www.cambridgeenglish.org/Images/ielts-reading-sample-task-matching-features.pdf"
    ]
  },
  {
    "mission_name": "The Grammar Link",
    "skill": "Reading",
    "level": "easy",
    "videos": [
      "Xp644hE6Y60",
      "zUfO_7KzM8w",
      "rGZ_VjQ9k_Q",
      "hI_wK9oYpWw",
      "u_K_fI1_2C0"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers_brochure_a4_print.pdf",
      "https://info.ielts.idp.com/rs/561-EIU-022/images/IELTS%20Focus%20-%20Listening%20-%20Student%20Updated.pdf",
      "https://www.cambridgeenglish.org/Images/734967-studies-in-language-testing-volume-25.pdf"
    ]
  },
  {
    "mission_name": "Basic T/F/NG",
    "skill": "Reading",
    "level": "easy",
    "videos": [
      "9m7L-WAnxYc",
      "vU6G_pS0_X4",
      "8_69H55_3P0",
      "rLdM5Nf0t2U",
      "G_UoF66ZpRE"
    ],
    "pdfs": [
      "https://info.ielts.idp.com/rs/561-EIU-022/images/IELTSFocus-AcademicReading-StudentBook.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_reading_sample_task_tfng.pdf",
      "https://www.cambridgeenglish.org/Images/ielts-reading-sample-task-identifying-information.pdf"
    ]
  },
  {
    "mission_name": "Precision Hearing (Section 1)",
    "skill": "Listening",
    "level": "easy",
    "videos": [
      "vN1T_K7G-iE",
      "uXU9R7G9Q_Y",
      "8_69H55_3P0",
      "pE3Xv9z4D2U",
      "KyLp8_Sreic"
    ],
    "pdfs": [
      "https://info.ielts.idp.com/rs/561-EIU-022/images/IELTS%20Focus%20-%20Listening%20-%20Student%20Updated.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_listening_sample_task_form_completion.pdf",
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf"
    ]
  },
  {
    "mission_name": "Map Navigation",
    "skill": "Listening",
    "level": "easy",
    "videos": [
      "8_69H55_3P0",
      "pE3Xv9z4D2U",
      "mKx-aXvT6XU",
      "u_K_fI1_2C0",
      "vU6G_pS0_X4"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_listening_sample_task_plan_map_diagram_labelling.pdf",
      "https://info.ielts.idp.com/rs/561-EIU-022/images/IELTS%20Focus%20-%20Listening%20-%20Student%20Updated.pdf",
      "https://www.cambridgeenglish.org/Images/ielts-listening-sample-task-plan-labelling.pdf"
    ]
  },
  {
    "mission_name": "Keyword Spotting",
    "skill": "Listening",
    "level": "easy",
    "videos": [
      "KyLp8_Sreic",
      "vU6G_pS0_X4",
      "rLdM5Nf0t2U",
      "hI_wK9oYpWw",
      "9m7L-WAnxYc"
    ],
    "pdfs": [
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers.pdf",
      "https://info.ielts.idp.com/rs/561-EIU-022/images/IELTS%20Focus%20-%20Listening%20-%20Student%20Updated.pdf"
    ]
  },
  {
    "mission_name": "Sentence Architecture",
    "skill": "Writing",
    "level": "easy",
    "videos": [
      "vVnS-V2J6m4",
      "rLdM5Nf0t2U",
      "hI_wK9oYpWw",
      "mKx-aXvT6XU",
      "Xp644hE6Y60"
    ],
    "pdfs": [
      "https://www.cambridgeenglish.org/Images/734967-studies-in-language-testing-volume-25.pdf",
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers_brochure_a4_print.pdf",
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf"
    ]
  },
  {
    "mission_name": "Task 1 Foundations (Overview)",
    "skill": "Writing",
    "level": "easy",
    "videos": [
      "hI_wK9oYpWw",
      "rLdM5Nf0t2U",
      "G_UoF66ZpRE",
      "Xp644hE6Y60",
      "vVnS-V2J6m4"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_academic_writing_task_1_sample_scripts_and_examiner_comments.pdf",
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf",
      "https://www.cambridgeenglish.org/Images/ielts-writing-sample-task-1.pdf"
    ]
  },
  {
    "mission_name": "The 4-Paragraph Map",
    "skill": "Writing",
    "level": "easy",
    "videos": [
      "9m7L-WAnxYc",
      "vU6G_pS0_X4",
      "mKx-aXvT6XU",
      "Xp644hE6Y60",
      "vVnS-V2J6m4"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers.pdf",
      "https://www.cambridgeenglish.org/Images/734967-studies-in-language-testing-volume-25.pdf",
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf"
    ]
  },
  {
    "mission_name": "Part 1 Confidence",
    "skill": "Speaking",
    "level": "easy",
    "videos": [
      "rLdM5Nf0t2U",
      "KyLp8_Sreic",
      "pE3Xv9z4D2U",
      "vU6G_pS0_X4",
      "mKx-aXvT6XU"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_speaking_sample_tasks.pdf",
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf",
      "https://www.cambridgeenglish.org/Images/ielts-speaking-sample-task-part-1.pdf"
    ]
  },
  {
    "mission_name": "Fluency Starters",
    "skill": "Speaking",
    "level": "easy",
    "videos": [
      "8_69H55_3P0",
      "9m7L-WAnxYc",
      "hI_wK9oYpWw",
      "G_UoF66ZpRE",
      "Xp644hE6Y60"
    ],
    "pdfs": [
      "https://takeielts.britishcouncil.org/sites/default/files/ielts_guide_for_teachers_brochure_a4_print.pdf",
      "https://ielts.idp.com/book/Content/pdf/IELTS%20Examiner%20Approved%20Tips.pdf",
      "https://www.cambridgeenglish.org/Images/735098-studies-in-language-testing-volume-34.pdf"
    ]
  },
  {
    "mission_name": "Pronunciation Core",
    "skill": "Speaking",
    "level": "easy",
    "videos": [
      "vU6G_pS0_X4",
      "KyLp8_Sreic",
      "rLdM5Nf0t2U",
      "pE3Xv9z4D2U",
      "mKx-aXvT6XU"
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
        
        // Optional: clear existing easy IELTS videos/pdfs if you want a clean slate
        // await Video.destroy({ where: { level: 'easy', examType: 'IELTS' } });
        // await Pdf.destroy({ where: { level: 'easy', examType: 'IELTS' } });

        let videoCount = 0;
        let pdfCount = 0;

        for (const mission of data) {
            console.log(`Processing mission: ${mission.mission_name}...`);
            
            // Seed Videos
            for (let i = 0; i < mission.videos.length; i++) {
                const videoId = mission.videos[i];
                await Video.create({
                    title: `${mission.mission_name} - Video ${i + 1}`,
                    description: `Educational video for ${mission.mission_name}`,
                    videolink: `https://www.youtube.com/watch?v=${videoId}`,
                    thubnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
                    level: 'easy',
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
                    title: `${mission.mission_name} - Resource ${i + 1}`,
                    description: `Study guide for ${mission.mission_name}`,
                    pdfLink: pdfLink,
                    level: 'easy',
                    type: mission.skill as any,
                    examType: 'IELTS'
                });
                pdfCount++;
            }
        }

        console.log(`✅ Successfully seeded ${videoCount} videos and ${pdfCount} PDFs.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding missions:", error);
        process.exit(1);
    }
}

seed();
