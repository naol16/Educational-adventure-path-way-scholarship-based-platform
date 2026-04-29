import { LearningPathRepository } from "../repositories/LearningPathRepository.js";
import { VideoService } from "../services/VideoService.js";
import { PdfService } from "../services/PdfService.js";
import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";
import { AIService } from "./AIService.js";
import { AssessmentRepository } from "../repositories/AssessmentRepository.js";

export class LearningPathService {
  // ─── IELTS Mission Catalog (untouched) ────────────────────────────────────
  private static missionData: any = {
    reading: [
      { title: "The Bird's Eye View", objective: "Master timing and test structure to stop feeling rushed." },
      { title: "Skimming vs. Scanning", objective: "Learn to navigate text rapidly without reading every word." },
      { title: "The Paraphrase Key", objective: "Unlock the secret to finding answers hidden in synonyms." },
      { title: "The Logic Traps", objective: "Stop falling for 'Not Given' and 'False' traps in Section 3." },
      { title: "The Full Run", objective: "Practice full-length passages under strict simulated conditions." }
    ],
    listening: [
      { title: "Precision Hearing", objective: "Capture names, numbers, and dates without missing a beat." },
      { title: "Situational Tracking", objective: "Follow directions and map locations without getting lost." },
      { title: "The Echo Trap", objective: "Identify distractors and speaker corrections in real-time." }
    ],
    writing: [
      { title: "The Grammar Engine", objective: "Build the foundation of tenses and subject-verb agreement." },
      { title: "Sentence Architecture", objective: "Combine simple ideas into high-scoring complex sentences." },
      { title: "Describing Trends", objective: "Master the vocabulary for charts, graphs, and line trends." },
      { title: "The 4-Paragraph Blueprint", objective: "Learn the universal structure for a high-scoring Task 2 essay." },
      { title: "Idea Generation", objective: "Never run out of points to write about in Task 2 brainstorming." }
    ],
    speaking: [
      { title: "The Icebreaker", objective: "Master Part 1 confidence for hometown, hobbies, and studies." },
      { title: "Clear Comms", objective: "Reduce filler words and improve natural pronunciation flow." },
      { title: "The Storyteller", objective: "Master the Part 2 cue card and talk for 2 minutes non-stop." },
      { title: "Opinion Logic", objective: "Structure abstract arguments in Part 3 using the A.R.E method." }
    ]
  };

  // ─── TOEFL iBT Mission Catalog — 51 unique missions (3 levels × 4 skills) ──
  // Each level has its own distinct set of missions; no content is recycled between levels.
  private static toeflMissionData: Record<string, Record<string, Array<{ title: string; objective: string; drillType: string }>>> = {
    easy: {
      // Reading — 5 missions (Foundations track, Band 0–14)
      reading: [
        {
          title: "Academic Word Bank",
          objective: "Master the 570 Academic Word List families grouped by TOEFL frequency — recognize 80%+ of academic words on first read.",
          drillType: "RT_E_VOCAB"
        },
        {
          title: "Sentence Decoder",
          objective: "Break down 30–50-word TOEFL sentences into subject + verb + core idea in under 12 words using a 3-step decoding routine.",
          drillType: "RT_E_SENTENCE"
        },
        {
          title: "Main Idea Hunter",
          objective: "Identify each paragraph's function and topic sentence — the foundational skill behind Prose Summary and Rhetorical Purpose questions.",
          drillType: "RT_E_MAIN_IDEA"
        },
        {
          title: "Question Type Map",
          objective: "Learn all 10 official TOEFL Reading question types, their traps, and time budget — recognize the type within 3 seconds of reading the stem.",
          drillType: "RT_E_QTYPE"
        },
        {
          title: "Untimed Full Passage",
          objective: "Complete a real-format 700-word passage with no time pressure, then review every question via video walkthrough. Target: 7/10 correct.",
          drillType: "RT_E_PASSAGE"
        }
      ],
      // Listening — 4 missions
      listening: [
        {
          title: "Sound Recognition",
          objective: "Train your ear on reduced sounds, linking, and content-word stress — transcription lab at 80% then 100% playback speed.",
          drillType: "LT_E_SOUND"
        },
        {
          title: "Note-Taking Basics",
          objective: "Build a personal abbreviation system and the 2-column note format (main points left, examples right) used in every future mission.",
          drillType: "LT_E_NOTES"
        },
        {
          title: "Lecture Signpost Words",
          objective: "Memorize 50+ professor signposts (today we'll discuss, the key point is, to sum up) grouped by function and use them as note-taking anchors.",
          drillType: "LT_E_SIGNPOST"
        },
        {
          title: "Campus Conversation 101",
          objective: "Master the 4 conversation contexts (office hours, advisor, service desk, peer) and the 3-act structure: problem → discussion → resolution.",
          drillType: "LT_E_CONVERSATION"
        }
      ],
      // Speaking — 4 missions
      speaking: [
        {
          title: "Pronunciation Core",
          objective: "Nail word-stress rules for academic words, sentence stress, and intonation patterns — record clips and compare your stress to a native baseline.",
          drillType: "ST_E_PRONUNCIATION"
        },
        {
          title: "The 15-Second Plan",
          objective: "Fill a fixed micro-template (opinion + reason 1 + reason 2 + closing) in under 12 seconds of prep — practiced until automatic.",
          drillType: "ST_E_PREP"
        },
        {
          title: "Task 1 — Independent",
          objective: "Master the 4-move 45-second personal-preference response on 30 common prompts — speak the full time without freezing.",
          drillType: "ST_E_INDEPENDENT"
        },
        {
          title: "Fluency Drills",
          objective: "Cut fillers (um, uh, like) from 15+ per minute to under 5 — re-record with the rule: no fillers, max 1-second pause.",
          drillType: "ST_E_FLUENCY"
        }
      ],
      // Writing — 4 missions
      writing: [
        {
          title: "Sentence Structure Toolkit",
          objective: "Produce simple, compound, and complex sentences on demand — 100 transformation exercises until all 3 types are error-free.",
          drillType: "WT_E_SENTENCES"
        },
        {
          title: "Academic Punctuation",
          objective: "Master the 6 comma rules, semicolon-as-period, colon, and dash that TOEFL raters watch — 50 punctuation-correction drills.",
          drillType: "WT_E_PUNCTUATION"
        },
        {
          title: "Paragraph Blueprint",
          objective: "Write 20 paragraphs to the 4-part shape (topic → support 1 → support 2 → mini-conclusion) until the structure is automatic.",
          drillType: "WT_E_PARAGRAPH"
        },
        {
          title: "Note-Taking for Writing",
          objective: "Build a 3-row note grid for Integrated Writing — reading main point / lecture rebuttal / connection word — turning notes into a writing skeleton.",
          drillType: "WT_E_NOTES"
        }
      ]
    },

    medium: {
      // Reading — 5 missions (Strategic track, Band 15–23)
      reading: [
        {
          title: "Speed-Reading Drills",
          objective: "Push from 180 to 270 words per minute with comprehension using chunking and peripheral-vision drills — finish the section, stop guessing.",
          drillType: "RT_M_SPEED"
        },
        {
          title: "Inference Mastery",
          objective: "Answer 'It can be inferred that...' questions using the rule: the correct choice MUST be true — drill 30 inference items to eliminate 'might be' traps.",
          drillType: "RT_M_INFERENCE"
        },
        {
          title: "Negative Factual Trap",
          objective: "Beat EXCEPT/NOT/LEAST questions by skimming for the 3 correct items and marking them off — the leftover is your answer.",
          drillType: "RT_M_NEGATIVE"
        },
        {
          title: "Sentence Simplification",
          objective: "Solve 'Which best expresses the essential information?' in under 60 seconds — eliminate choices that change meaning, omit key info, or add new info.",
          drillType: "RT_M_SIMPLIFICATION"
        },
        {
          title: "Insert-Text Logic",
          objective: "Run a 4-question checklist on each square (pronoun antecedent, transition match, topic chain, time order) to place the sentence precisely.",
          drillType: "RT_M_INSERT"
        }
      ],
      // Listening — 4 missions
      listening: [
        {
          title: "Detail Capture Drill",
          objective: "Catch 4–5 specific details per lecture (numbers, dates, names, terms) without falling behind — target 80%+ accuracy without the replay feature.",
          drillType: "LT_M_DETAIL"
        },
        {
          title: "Attitude & Tone",
          objective: "Detect certainty, doubt, surprise, and disagreement through intonation, hedging, and word choice — drill 40 short audio clips identifying speaker attitude.",
          drillType: "LT_M_ATTITUDE"
        },
        {
          title: "Function Questions",
          objective: "Answer 'Why does the professor say...?' by identifying the utterance's purpose (example, correction, emphasis, joke, qualify, redirect).",
          drillType: "LT_M_FUNCTION"
        },
        {
          title: "Connecting Ideas",
          objective: "Predict lecture structure in the first 30 seconds (cause→effect, problem→solution, classification, chronological) and pre-organize notes accordingly.",
          drillType: "LT_M_CONNECTING"
        }
      ],
      // Speaking — 4 missions
      speaking: [
        {
          title: "Task 2 — Campus Announcement",
          objective: "Summarize a campus notice and the student's opinion + 2 reasons using the read-listen-speak template in 60 seconds.",
          drillType: "ST_M_CAMPUS"
        },
        {
          title: "Task 3 — Academic Concept",
          objective: "Connect a textbook definition to a professor's example using the template: 'The reading defines X as... The professor illustrates this by...'",
          drillType: "ST_M_ACADEMIC"
        },
        {
          title: "Task 4 — Lecture Summary",
          objective: "Capture a 90–120s academic lecture's main idea + 2 supporting examples in notes, then deliver them in 60 seconds with proper signposting.",
          drillType: "ST_M_LECTURE"
        },
        {
          title: "Cohesion & Connectors",
          objective: "Use 3 different linking phrases per 60-second response from 30 connectors grouped by addition, contrast, cause, example, and conclusion.",
          drillType: "ST_M_COHESION"
        }
      ],
      // Writing — 4 missions
      writing: [
        {
          title: "Integrated Writing Template",
          objective: "Build a 4-paragraph Integrated response (220–280 words in 18 min) using sentence stems — intro, 3 body pairs connecting reading to lecture.",
          drillType: "WT_M_INTEGRATED"
        },
        {
          title: "Lecture–Reading Contrast",
          objective: "Use 12 precise reporting verbs (challenges, refutes, casts doubt on, undermines) with the correct syntax patterns to show how the lecture relates.",
          drillType: "WT_M_CONTRAST"
        },
        {
          title: "Academic Discussion Format",
          objective: "Nail the 10-minute Task 2 response: acknowledge classmate → state opinion → 2-sentence support → wrap up — drilled on 25 varied prompts.",
          drillType: "WT_M_DISCUSSION"
        },
        {
          title: "Coherence & Cohesion",
          objective: "Thread a topic through a paragraph using reference words (this, such, these factors) and transitions so it reads as one argument, not a list.",
          drillType: "WT_M_COHERENCE"
        }
      ]
    },

    hard: {
      // Reading — 5 missions (Refined track, Band 24–30)
      reading: [
        {
          title: "Rhetorical Purpose Decoder",
          objective: "Identify the 8 rhetorical functions ETS tests (illustrate, contrast, refute, qualify, etc.) using linguistic markers — the gap between 27 and 30.",
          drillType: "RT_H_RHETORIC"
        },
        {
          title: "Prose Summary Architect",
          objective: "Score the full 2 points by writing 3 one-line 'main-idea buckets' before looking at choices, then eliminating minor details and off-topic distractors.",
          drillType: "RT_H_PROSE_SUMMARY"
        },
        {
          title: "Vocabulary Nuance",
          objective: "Master 200 near-synonym pairs at Hard level (spread vs proliferate vs disseminate) — register, collocations, and discriminating examples.",
          drillType: "RT_H_VOCAB_NUANCE"
        },
        {
          title: "Full Test Simulation",
          objective: "Two 700-word passages, all 20 questions, 35 minutes — then a question-by-question breakdown of time spent, accuracy by type, and weakness patterns.",
          drillType: "RT_H_SIMULATION"
        },
        {
          title: "ETS Distractor Patterns",
          objective: "Instantly spot all 6 wrong-answer designs: Out-of-Scope, Half-Truth, Opposite, Extreme, Distorted, and Plausible-but-Unsupported.",
          drillType: "RT_H_DISTRACTORS"
        }
      ],
      // Listening — 4 missions
      listening: [
        {
          title: "Multi-Speaker Mapping",
          objective: "Attribute opinions to the correct speaker (P:, S1:, S2:) in lectures with 2–3 voices — notation system drilled until automatic.",
          drillType: "LT_H_MULTISPEAKER"
        },
        {
          title: "Implicit Inference",
          objective: "Track the speaker's logic to the unstated next step in 'What does the professor imply?' questions — reject choices that go beyond what the audio supports.",
          drillType: "LT_H_INFERENCE"
        },
        {
          title: "Lecture Architecture",
          objective: "Handle advanced lectures that interleave structures (classification within chronological) using a hybrid note layout.",
          drillType: "LT_H_ARCHITECTURE"
        },
        {
          title: "Native-Rate Lectures",
          objective: "Progress from 1.0x to 1.2x playback speed on practice lectures until real-test pace (150–180 wpm) feels comfortable.",
          drillType: "LT_H_NATIVE_RATE"
        }
      ],
      // Speaking — 4 missions
      speaking: [
        {
          title: "Paraphrasing Power",
          objective: "Re-express any 15-word source sentence in your own words within 4 seconds using 5 paraphrase patterns — avoid penalized lifted language.",
          drillType: "ST_H_PARAPHRASE"
        },
        {
          title: "Time Architecture",
          objective: "Land every response within 3 seconds of the time limit with a complete final clause using the 5-second runway technique.",
          drillType: "ST_H_TIMING"
        },
        {
          title: "Lexical Precision",
          objective: "Build and drill a personal upgrade list (good → beneficial/advantageous, say → argue/contend) until upgraded vocabulary is automatic, not effortful.",
          drillType: "ST_H_LEXICAL"
        },
        {
          title: "Full Mock Speaking Test",
          objective: "All 4 tasks back-to-back in 16 minutes — auto-transcribed and graded on Delivery, Language Use, and Topic Development with per-task feedback.",
          drillType: "ST_H_MOCK"
        }
      ],
      // Writing — 4 missions
      writing: [
        {
          title: "Synthesis Mastery",
          objective: "Weave reading and lecture within a single sentence ('Whereas the reading argues X, the professor counters that Y') — ban the lazy sequential format.",
          drillType: "WT_H_SYNTHESIS"
        },
        {
          title: "Advanced Argumentation",
          objective: "Engage with classmates' posts by extending, refining, or challenging them using qualifier language — earn the 'Well-developed contribution' rating.",
          drillType: "WT_H_ARGUMENTATION"
        },
        {
          title: "Lexical Sophistication",
          objective: "Replace overused words with precise alternatives — enforce the rule: no word used twice in a 100-word response.",
          drillType: "WT_H_LEXICAL"
        },
        {
          title: "Timed Writing Excellence",
          objective: "Both tasks back-to-back in 29 minutes — auto-graded on Selection of Information, Organization, Contribution, and Language Facility with paragraph-level feedback.",
          drillType: "WT_H_TIMED"
        }
      ]
    }
  };

  /**
   * Maps overall band score to a difficulty level (easy, medium, hard).
   */
  private static mapScoreToLevel(
    overallScore: number,
    examType: "IELTS" | "TOEFL"
  ): "easy" | "medium" | "hard" {
    if (examType === "TOEFL") {
      if (overallScore < 15) return "easy";
      if (overallScore < 24) return "medium";
      return "hard";
    } else {
      if (overallScore < 5.0) return "easy";
      if (overallScore < 7.0) return "medium";
      return "hard";
    }
  }

  /**
   * Generates a new learning path or updates existing one based on evaluation.
   */
  static async generateForStudent(
    studentId: number,
    evaluation: any,
    examType: "IELTS" | "TOEFL" = "IELTS",
  ) {
    const overallBand = evaluation.overall_band || 0;
    const normalizedExamType =
      examType && examType.toUpperCase() === "TOEFL" ? "TOEFL" : "IELTS";
    const level = this.mapScoreToLevel(overallBand, normalizedExamType);

    // 1. Fetch 5 videos and 5 pdfs per skill matching the student's level and exam type
    const [videoMap, pdfMap] = await Promise.all([
      VideoService.getAllPerType(level, normalizedExamType),
      PdfService.findAllPerType(level, normalizedExamType)
    ]);

    const videoSections = {
      reading: videoMap["reading"]?.map((v) => v.id) || [],
      listening: videoMap["listening"]?.map((v) => v.id) || [],
      writing: videoMap["writing"]?.map((v) => v.id) || [],
      speaking: videoMap["speaking"]?.map((v) => v.id) || [],
    };

    const pdfSections = {
      reading: pdfMap["reading"]?.map((p) => p.id) || [],
      listening: pdfMap["listening"]?.map((p) => p.id) || [],
      writing: pdfMap["writing"]?.map((p) => p.id) || [],
      speaking: pdfMap["speaking"]?.map((p) => p.id) || [],
    };

    // 2. Extract skill-based notes from AI evaluation
    // We expect AI to return section_notes, if not, we fallback to general feedback
    const aiNotes = evaluation.section_notes || {};
    const generalFeedback =
      evaluation.feedback_report ||
      "Continue practicing all skills.";

    const noteSections = {
      reading: aiNotes.reading || generalFeedback,
      listening: aiNotes.listening || generalFeedback,
      writing: aiNotes.writing || generalFeedback,
      speaking: aiNotes.speaking || generalFeedback,
    };

    // 3. Extract Learning Mode Sections (Practice Questions)
    let rawLearningMode = evaluation.learning_mode || {};
    
    // Normalize keys (handle AI casing inconsistency)
    const learningModeSections: any = {
      reading: rawLearningMode.reading || rawLearningMode.Reading || [],
      listening: rawLearningMode.listening || rawLearningMode.Listening || [],
      writing: rawLearningMode.writing || rawLearningMode.Writing || [],
      speaking: rawLearningMode.speaking || rawLearningMode.Speaking || [],
    };

    // Ensure at least one fallback question if section is empty
    const skills: ('reading' | 'listening' | 'writing' | 'speaking')[] = ['reading', 'listening', 'writing', 'speaking'];
    for (const skill of skills) {
      const section = learningModeSections[skill];
      if (!section || (Array.isArray(section) && section.length === 0)) {
        console.log(`[LearningPathService] Applying diagnostic fallback for ${skill}`);
        learningModeSections[skill] = [
          {
            question: `Review your diagnostic results for ${skill} and focus on areas with the highest competency gap.`,
            options: ["I have reviewed it", "I will review it later"],
            correct_answer: 0,
            explanation: "Reflection is the first step to mastery."
          }
        ];
      }
    }

    // 4. Extract Competency Gap and Curriculum Map
    const competencyGapAnalysis =
      evaluation.competency_gap_analysis || null;
    const curriculumMap =
      evaluation.adaptive_curriculum_map || null;

    // 5. Persist the learning path (resets all progress for fresh start)
    await LearningPathRepository.upsert(studentId, {
      videoSections,
      pdfSections,
      noteSections,
      learningModeSections,
      competencyGapAnalysis,
      curriculumMap,
      proficiencyLevel: level,
      examType: normalizedExamType,
      currentProgressPercentage: 0,
    });
  }

  static async getFormattedPath(studentId: number, examType?: string) {
    const path = await LearningPathRepository.findByStudentId(studentId, examType);
    if (!path) return null;

    const skills = ["reading", "listening", "writing", "speaking"];
    const result: any = {};
    const updatedLearningMode: any = {};
    let totalItems = 0;
    let completedItems = 0;

    // Faster optimization: fetch all progress records at once for this student
    const allProgress = await LearningPathProgress.findAll({
      where: { studentId }
    });

    for (const skill of skills) {
      const sectionStr = skill.charAt(0).toUpperCase() + skill.slice(1);
      const skillProgress = allProgress.filter(p => p.section === sectionStr && p.isCompleted);

      // --- 1. Videos ---
      const videoIds = (path.videoSections as any)[skill] || [];
      const videosProgress = await Promise.all(
        videoIds.map(async (id: number) => {
          const video = await VideoService.getById(id);
          if (!video) return null;

          const isCompleted = skillProgress.some(p => p.videoId === id);
          totalItems++;
          if (isCompleted) completedItems++;

          return {
            ...video.get({ plain: true }),
            isCompleted: isCompleted,
          };
        }),
      );

      // --- 2. PDFs ---
      const pdfIds = (path as any).pdfSections?.[skill] || [];
      const pdfsProgress = await Promise.all(
        pdfIds.map(async (id: number) => {
          const pdf = await PdfService.getById(id);
          if (!pdf) return null;

          const isCompleted = allProgress.some(p => p.pdfId === id);
          totalItems++;
          if (isCompleted) completedItems++;

          return {
            ...pdf.get({ plain: true }),
            isCompleted,
          };
        }),
      );

      // --- 2. Practice Questions ---
      const skillData = (path.learningModeSections as any)[skill];
      let skillQuestions: any[] = [];
      let extraData: any = {};

      if (Array.isArray(skillData)) {
        skillQuestions = skillData;
      } else if (skillData && Array.isArray(skillData.questions)) {
        skillQuestions = skillData.questions;
        // Preserve other data like script and audio_base64
        const { questions, ...rest } = skillData;
        extraData = rest;
      }

      const updatedQuestions = skillQuestions.map((q: any, index: number) => {
        const savedProgress = skillProgress.find(p => p.questionIndex === index);
        const isCompleted = !!savedProgress;
        
        totalItems++;
        if (isCompleted) completedItems++;
        
        return { 
          ...q, 
          isCompleted,
          userAnswer: savedProgress?.answerText || null
        };
      });

      if (Object.keys(extraData).length > 0) {
        updatedLearningMode[skill] = {
          ...extraData,
          questions: updatedQuestions,
        };
      } else {
        updatedLearningMode[skill] = updatedQuestions;
      }

      // --- 3. Notes ---
      const isNoteCompleted = skillProgress.some(p => p.isNote === true);
      totalItems++; // 1 Note per skill section
      if (isNoteCompleted) completedItems++;

      // --- 4. Group into Missions ---
      const missions: any[] = [];
      // TOEFL: pick the level-specific catalog (3 distinct tracks, no content recycled).
      // IELTS: use the original catalog and let the mobile filter by adaptive level count.
      const isToefl = (path.examType || '').toUpperCase() === 'TOEFL';
      const toeflLevel = (path.proficiencyLevel || 'easy').toLowerCase() as 'easy' | 'medium' | 'hard';
      const skillMissions = isToefl
        ? (this.toeflMissionData[toeflLevel]?.[skill] || [])
        : (this.missionData[skill] || []);
      const validVideos = videosProgress.filter((v) => v !== null);
      const validPdfs = pdfsProgress.filter((p) => p !== null);

      for (let i = 0; i < skillMissions.length; i++) {
        const missionInfo = skillMissions[i];
        
        // Videos: 5 per mission
        const videoStart = i * 5;
        const videoEnd = Math.min(videoStart + 5, validVideos.length);
        let missionVideos = videoStart < validVideos.length ? validVideos.slice(videoStart, videoEnd) : [];

        // PDFs: 3 per mission
        const pdfStart = i * 3;
        const pdfEnd = Math.min(pdfStart + 3, validPdfs.length);
        let missionPdfs = pdfStart < validPdfs.length ? validPdfs.slice(pdfStart, pdfEnd) : [];

        // --- INJECT PLACEHOLDERS IF EMPTY ---
        if (missionVideos.length === 0) {
          missionVideos = [
            {
              id: 9000 + (skills.indexOf(skill) * 100) + (i * 10) + 1,
              title: `${missionInfo.title} - Strategy Overview`,
              description: "Placeholder strategy overview.",
              videolink: "https://www.youtube.com/watch?v=sLQ0A3U2hYg",
              thubnail: "https://img.youtube.com/vi/sLQ0A3U2hYg/0.jpg",
              level: path.proficiencyLevel || "medium",
              type: skill.charAt(0).toUpperCase() + skill.slice(1),
              examType: path.examType || "IELTS",
              duration: "05:00",
              resourceType: "video",
              isCompleted: false
            },
            {
              id: 9000 + (skills.indexOf(skill) * 100) + (i * 10) + 2,
              title: `${missionInfo.title} - Practice Walkthrough`,
              description: "Placeholder practice walkthrough.",
              videolink: "https://www.youtube.com/watch?v=sLQ0A3U2hYg",
              thubnail: "https://img.youtube.com/vi/sLQ0A3U2hYg/0.jpg",
              level: path.proficiencyLevel || "medium",
              type: skill.charAt(0).toUpperCase() + skill.slice(1),
              examType: path.examType || "IELTS",
              duration: "08:00",
              resourceType: "video",
              isCompleted: false
            }
          ];
        }

        if (missionPdfs.length === 0) {
          missionPdfs = [
            {
              id: 8000 + (skills.indexOf(skill) * 100) + (i * 10) + 1,
              title: `${missionInfo.title} - Mastery Cheat Sheet`,
              description: "Placeholder PDF guide.",
              pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              level: path.proficiencyLevel || "medium",
              type: skill.charAt(0).toUpperCase() + skill.slice(1),
              examType: path.examType || "IELTS",
              isCompleted: false
            }
          ];
        }
        
        const isPracticeCompleted = updatedLearningMode[skill]?.questions?.some((q: any) => q.isCompleted) || 
                                    (Array.isArray(updatedLearningMode[skill]) && updatedLearningMode[skill].some((q: any) => q.isCompleted)) ||
                                    (updatedLearningMode[skill] && (updatedLearningMode[skill].prompt || updatedLearningMode[skill].question) && updatedLearningMode[skill].isCompleted);
                                    
        const normalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
        const unitTestEntry = allProgress.find(p => p.section === normalizedSkill && p.isUnitTest && p.missionIndex === i);
        const isUnitTestCompleted = unitTestEntry ? unitTestEntry.isCompleted : false;

        const isMissionCompleted = (missionVideos.length > 0 ? missionVideos.every(v => v.isCompleted) : true) && 
                                   (missionPdfs.length > 0 ? missionPdfs.every(p => p.isCompleted) : true) &&
                                   isPracticeCompleted &&
                                   isUnitTestCompleted;
        
        missions.push({
          title: missionInfo.title,
          objective: missionInfo.objective,
          videos: missionVideos,
          pdfs: missionPdfs,
          isCompleted: !!isMissionCompleted,
          isUnitTestCompleted: !!isUnitTestCompleted
        });
      }

      result[skill] = {
        videos: validVideos,
        pdfs: pdfsProgress.filter((p) => p !== null),
        notes: (path.noteSections as any)[skill] || "",
        isNoteCompleted,
        missions
      };
    }

    // --- Weighted Overall Progress Calculation ---
    let totalSkillProgressSum = 0;
    for (const skill of skills) {
      const skillData = result[skill];
      const missions = skillData.missions;
      if (missions && missions.length > 0) {
        let skillWeightedSum = 0;
        for (const mission of missions) {
          // Video: 40% | PDF: 20% | Practice: 40%
          const videoRatio = mission.videos.length > 0 
            ? mission.videos.filter((v: any) => v.isCompleted).length / mission.videos.length 
            : 1.0; 
          
          const pdfRatio = mission.pdfs.length > 0 
            ? mission.pdfs.filter((p: any) => p.isCompleted).length / mission.pdfs.length 
            : 1.0;

          // Practice calculation
          const skillLm = updatedLearningMode[skill];
          let practiceRatio = 0;
          if (Array.isArray(skillLm)) {
            practiceRatio = skillLm.length > 0 ? skillLm.filter((q: any) => q.isCompleted).length / skillLm.length : 0;
          } else if (skillLm && skillLm.questions) {
            practiceRatio = skillLm.questions.length > 0 ? skillLm.questions.filter((q: any) => q.isCompleted).length / skillLm.questions.length : 0;
          } else if (skillLm && (skillLm.prompt || skillLm.question)) {
            practiceRatio = skillLm.isCompleted ? 1 : 0;
          }

          const missionProgress = (videoRatio * 0.4) + (pdfRatio * 0.2) + (practiceRatio * 0.4);
          skillWeightedSum += (missionProgress / missions.length);
        }
        totalSkillProgressSum += (skillWeightedSum / skills.length);
      }
    }

    const progressPercentage = Math.round(totalSkillProgressSum * 100);
    
    // Update the record in the database
    if (path.currentProgressPercentage !== progressPercentage) {
      path.currentProgressPercentage = progressPercentage;
      await path.save();
    }

    return {
      proficiencyLevel: path.proficiencyLevel,
      examType: path.examType,
      skills: result,
      learningMode: updatedLearningMode,
      competencyGapAnalysis: path.competencyGapAnalysis,
      curriculumMap: path.curriculumMap,
      current_progress_percentage: progressPercentage,
    };
  }

  /**
   * Evaluates a specific speaking practice question.
   */
  static async evaluateSpeakingPractice(
    studentId: number,
    questionIndex: number,
    audioBase64: string,
    mimeType: string,
  ) {
    const path = await LearningPathRepository.findByStudentId(studentId);
    if (!path) throw new Error("Learning path not found.");

    const speakingData = (path.learningModeSections as any).speaking;
    const speakingPrompt = speakingData?.[questionIndex];

    if (!speakingPrompt) {
      throw new Error("Speaking prompt not found at this index.");
    }

    const promptText = speakingPrompt.prompt || speakingPrompt.question;

    const evaluation = await AIService.evaluateSpeaking(
      promptText,
      audioBase64,
      mimeType,
      (path.examType as "IELTS" | "TOEFL") || "IELTS",
    );

    // Mark this specific speaking practice question as completed
    await LearningPathProgress.findOrCreate({
      where: {
        studentId,
        questionIndex,
        section: "Speaking",
      },
      defaults: {
        isCompleted: true,
      },
    }).then(([progress, created]) => {
      if (!created) progress.update({ isCompleted: true });
    });

    return evaluation;
  }

  /**
   * Generates a mini unit test for a specific skill and level.
   */
  static async generateUnitTest(skill: string, level: string, examType: string = 'IELTS') {
    const isReading = skill.toLowerCase().includes('reading');
    const isListening = skill.toLowerCase().includes('listening');

    const prompt = `
      Role: Senior ${examType} Examiner
      Task: Generate a high-stakes Unit Test for the ${skill} section.
      Difficulty: ${level}
      
      Requirement: 
      ${isReading ? "- Provide a 400-500 word academic Reading Passage." : ""}
      ${isListening ? "- Provide a detailed Listening Script (conversation or lecture) for the audio section." : ""}
      - Provide 5 multiple-choice questions based on the ${isReading ? "passage" : (isListening ? "script" : "task")}.
      - Each question must have 4 options and 1 correct answer.
      - Include a brief explanation for the correct answer.
      
      Return ONLY a valid JSON object in this schema:
      {
        "skill": "${skill}",
        ${isReading ? '"passage": "string",' : ""}
        ${isListening ? '"script": "string",' : ""}
        "questions": [
          {
            "question": "string",
            "options": ["A", "B", "C", "D"],
            "correct_answer": 0,
            "explanation": "string"
          }
        ]
      }
    `;

    const response = await AIService.generateJSON(prompt);
    return response;
  }

  /**
   * Dynamically generates a full mission content (Practice Drill & Unit Test) using AI,
   * with sequentially varying question types based on the missionIndex.
   */
  static async generateMissionContent(skill: string, level: string, topic: string, missionIndex: number = 0) {
    const isReading = skill.toLowerCase().includes('reading');
    const isListening = skill.toLowerCase().includes('listening');
    const isWriting = skill.toLowerCase().includes('writing');
    const isSpeaking = skill.toLowerCase().includes('speaking');
    
    // Standard IELTS Question Types Ordered by Mission Sequence
    const readingTypes = ['R_MCQ', 'R_TFNG', 'R_HEAD', 'R_MATCH', 'R_FILL', 'R_DIAG'];
    const listeningTypes = ['L_MCQ', 'L_MATCH', 'L_FORM', 'L_MAP', 'L_FLOW'];
    const writingTypes = ['W_FIX', 'W_MERGE', 'W_VOCAB', 'W_STRUCTURE', 'W_IDEA'];
    const speakingTypes = ['S_PART1', 'S_PART2', 'S_PART3', 'S_MIXED'];
    
    let types = readingTypes;
    if (isListening) types = listeningTypes;
    if (isWriting) types = writingTypes;
    if (isSpeaking) types = speakingTypes;
    
    // Map the mission index to the specific question type, cycling back if index exceeds array length
    const safeIndex = Math.max(0, missionIndex) % types.length;
    const type1 = types[safeIndex];
    
    // Unit Test gets a slightly different type to mix it up, usually the next one in the sequence
    const nextIndex = (safeIndex + 1) % types.length;
    const type2 = types[nextIndex];

    const prompt = `
      Role: Senior IELTS/TOEFL Content Architect
      Task: Generate a dynamic, highly accurate Mission for the ${skill} section.
      Difficulty: ${level}
      Topic/Theme: ${topic || "Academic Subject"}
      
      Requirements: 
      ${isReading ? "- Provide a 300-400 word academic Reading Passage." : ""}
      ${isListening ? "- Provide a detailed Listening Script (conversation or lecture). Add a distractor (speaker corrects themselves) to trick the student." : ""}
      ${isWriting ? "- Provide a short writing prompt or scenario (e.g., a paragraph with deliberate errors, or a Task 1 graph description)." : ""}
      ${isSpeaking ? "- Provide a Speaking Examiner prompt (e.g., questions about hometown, a Cue Card, or abstract discussion questions)." : ""}
      - The Practice Drill must use the ${type1} question type and contain 2 questions.
      - The Unit Test must use the ${type2} question type and contain 3 questions.
      - For each question, provide the correct answer and a 'feedbackTip' explaining why it's correct or explaining the trap.
      
      Return ONLY a valid JSON object in this schema:
      {
        "title": "Dynamic Mission: ${topic}",
        "level": "${level}",
        ${isReading ? '"passage": "string",' : ""}
        ${isListening ? '"script": "string", "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",' : ""}
        ${isWriting ? '"writingPrompt": "string",' : ""}
        ${isSpeaking ? '"speakingPrompt": "string",' : ""}
        "practiceDrill": {
          "type": "${type1}",
          "questions": [
            { "q": "Question text", "options": ["A", "B", "C"], "answer": "correct string/option", "distractor": "optional string to trick them", "feedbackTip": "AI generated explanation" }
          ]
        },
        "unitTest": {
          "type": "${type2}",
          "questions": [
            { "q": "Question text", "options": ["A", "B"], "answer": "correct string/option", "feedbackTip": "AI generated explanation" }
          ]
        }
      }
    `;

    const response = await AIService.generateJSON(prompt);
    return response;
  }

  /**
   * Evaluates unit test results and marks module as mastered if successful.
   */
  static async evaluateUnitTest(studentId: number, skill: string, responses: any[], missionIndex: number) {
    // Logic: Simple score calculation or AI evaluation
    // For Unit Tests (MCQs), we can just check indices
    let correctCount = 0;
    for (const res of responses) {
      if (res.isCorrect) correctCount++;
    }

    const score = (correctCount / responses.length) * 100;
    const passed = score >= 80; // 80% to pass

    if (passed) {
      // Mark this section as mastered in LearningPathProgress
      await LearningPathProgress.findOrCreate({
        where: {
          studentId,
          section: skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase() as any,
          isUnitTest: true,
          missionIndex: missionIndex
        },
        defaults: {
          isCompleted: true,
        }
      });
    }

    return {
      score,
      passed,
      feedback: passed ? "Excellent work! You have mastered this module." : "You're close! Review the materials and try again."
    };
  }
}
