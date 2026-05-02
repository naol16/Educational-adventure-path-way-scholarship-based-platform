
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Clock,
  Youtube,
  User,
  MessageCircle,
  Trophy,
  History,
  Lock,
  ArrowUpCircle,
  BarChart3,
  BookMarked,
  Info,
  ChevronRight,
  Map as MapIcon,
  StopCircle,
  AlertCircle,
  Send,
  Target,
  Compass,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { 
  getLearningPath, 
  completeSection, 
  evaluateSpeakingPractice,
  trackProgress,
  generateDynamicMission,
  generateUnitTest,
  submitUnitTest,
  getAssessmentProgress,
  generateAssessment
} from "@/features/assessments/api/assessment-api";
import Link from "next/link";
import { UnitTestOverlay, DynamicMissionOverlay } from "./LearningPathOverlays";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import { AssessmentDashboard } from "@/features/assessments/components/AssessmentDashboard";
import { AssessmentTest } from "@/features/assessments/components/AssessmentTest";
import { AssessmentResultView } from "@/features/assessments/components/AssessmentResultView";
import { toast } from "react-hot-toast";

interface Video {
  id: number;
  videolink: string;
  thubnail: string;
  title?: string;
  isCompleted?: boolean;
}

interface Mission {
  title: string;
  objective: string;
  videos: Video[];
  pdfs: any[]; // Adjust if needed
  isCompleted: boolean;
  isUnitTestCompleted: boolean;
}

interface SkillData {
  videos: Video[];
  notes: string;
  isNoteCompleted?: boolean;
  missions: Mission[];
}

interface LearningPathData {
  proficiencyLevel: 'easy' | 'medium' | 'hard';
  skills: Record<string, SkillData>;
  learningMode?: Record<string, any>;
  competencyGapAnalysis?: any;
  curriculumMap?: any;
  current_progress_percentage?: number;
  examType?: string;
  exam_type?: string;
}

const levelConfig: Record<string, { label: string; color: string; border: string; bg: string }> = {
  easy: { label: "Beginner", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  medium: { label: "Intermediate", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  hard: { label: "Advanced", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
};

const skillIcons: Record<string, any> = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenLine,
  speaking: Mic,
};

const speakingExamScale: Record<string, { max: number; label: string }> = {
   IELTS: { max: 9, label: "Band" },
   TOEFL: { max: 30, label: "Score" },
   DUOLINGO: { max: 160, label: "Score" },
   PTE: { max: 90, label: "Score" },
   CELPIP: { max: 12, label: "Level" },
};

const normalizeExamType = (raw: unknown) => {
   if (!raw) return "IELTS";
   const cleaned = String(raw).trim().toUpperCase();
   return speakingExamScale[cleaned] ? cleaned : "IELTS";
};

const parseNumericValue = (value: unknown): number | null => {
   if (typeof value === "number" && Number.isFinite(value)) return value;
   if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
   }
   return null;
};

const normalizeChoiceText = (value: unknown) =>
   String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/^[a-d]\s*[\.)\-:]\s*/i, "")
      .replace(/\s+/g, " ");

const isCorrectOption = (answer: unknown, option: string, options: string[]) => {
   const normalizedOption = normalizeChoiceText(option);
   const normalizedAnswer = normalizeChoiceText(answer);

   if (!normalizedAnswer) return false;
   if (normalizedAnswer === normalizedOption) return true;

   const letterMap = ["a", "b", "c", "d"];

   if (letterMap.includes(normalizedAnswer)) {
      const expectedOption = options[letterMap.indexOf(normalizedAnswer)];
      return normalizeChoiceText(expectedOption) === normalizedOption;
   }

   if (/^\d+$/.test(normalizedAnswer)) {
      const numericAnswer = parseInt(normalizedAnswer, 10);
      const idx = numericAnswer > 0 ? numericAnswer - 1 : numericAnswer;
      if (idx >= 0 && idx < options.length) {
         return normalizeChoiceText(options[idx]) === normalizedOption;
      }
   }

   const optionPrefixMatch = String(option).trim().match(/^([a-d])\s*[\.)\-:]/i);
   if (optionPrefixMatch && optionPrefixMatch[1].toLowerCase() === normalizedAnswer) {
      return true;
   }

   return false;
};

const getSkillQuestions = (learningMode: LearningPathData["learningMode"], skill: string) => {
   const modeData = learningMode?.[skill];
   return Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
};

const isSkillLocallyComplete = (pathData: LearningPathData, skill: string, practiceAnswers?: Record<string, Record<number, string>>) => {
   const skillData = pathData.skills?.[skill];
   if (!skillData) return false;

   const videos = skillData.videos || [];
   const videosComplete = videos.length === 0 || videos.every((v) => !!v.isCompleted);
   const noteComplete = !!skillData.isNoteCompleted;

   const questions = getSkillQuestions(pathData.learningMode, skill);
   const questionsComplete = questions.length === 0 || questions.every((q: any, idx: number) => {
      if (q.isCompleted) return true;
      if (practiceAnswers && practiceAnswers[skill]?.[idx] !== undefined && String(practiceAnswers[skill][idx]).trim().length > 0) return true;
      return false;
   });

   return videosComplete && noteComplete && questionsComplete;
};

const getSkillCompletionStatus = (pathData: LearningPathData, skill: string, practiceAnswers?: Record<string, Record<number, string>>) => {
   const skillData = pathData.skills?.[skill];
   if (!skillData) {
      return {
         skill,
         complete: false,
         videosComplete: false,
         noteComplete: false,
         questionsComplete: false,
         videosDone: 0,
         videosTotal: 0,
         questionsDone: 0,
         questionsTotal: 0,
      };
   }

   const videos = skillData.videos || [];
   const videosDone = videos.filter((v) => !!v.isCompleted).length;
   const videosTotal = videos.length;
   const videosComplete = videosTotal === 0 || videosDone === videosTotal;

   const questions = getSkillQuestions(pathData.learningMode, skill);
   const questionsDone = questions.filter((q: any, idx: number) => {
      if (q.isCompleted) return true;
      if (practiceAnswers && practiceAnswers[skill]?.[idx] !== undefined && String(practiceAnswers[skill][idx]).trim().length > 0) return true;
      return false;
   }).length;
   const questionsTotal = questions.length;
   const questionsComplete = questionsTotal === 0 || questionsDone === questionsTotal;

   const noteComplete = !!skillData.isNoteCompleted;
   const complete = videosComplete && noteComplete && questionsComplete;

   return {
      skill,
      complete,
      videosComplete,
      noteComplete,
      questionsComplete,
      videosDone,
      videosTotal,
      questionsDone,
      questionsTotal,
   };
};

const getSpeakingScoreMeta = (result: any, fallbackExamType: string) => {
   const examType = normalizeExamType(
      result?.examType || result?.exam_type || fallbackExamType,
   );
   const scale = speakingExamScale[examType] || speakingExamScale.IELTS;

   const possibleScoreKeys = [
      result?.score,
      result?.overall_band,
      result?.speaking_band,
      result?.speaking_score,
      result?.band,
      result?.predicted_band,
   ];

   const score = possibleScoreKeys
      .map(parseNumericValue)
      .find((num): num is number => num !== null) ?? null;

   return {
      examType,
      score,
      max: scale.max,
      label: scale.label,
      percent: score === null ? 0 : Math.min(100, (score / scale.max) * 100),
      displayScore: score === null ? "N/A" : Number(score.toFixed(1)).toString(),
   };
};

const calculateSkillProgress = (pathData: LearningPathData, skill: string, practiceAnswers?: Record<string, Record<number, string>>) => {
    const status = getSkillCompletionStatus(pathData, skill, practiceAnswers);
    if (!status) return 0;
    
    let totalWeightedProgress = 0;
    const missions = pathData.skills[skill]?.missions || [];
    
    if (missions.length === 0) return status.videosDone / Math.max(1, status.videosTotal);
    
    const practiceRatio = status.questionsTotal > 0 ? status.questionsDone / status.questionsTotal : 0;
    
    for (let i = 0; i < missions.length; i++) {
        const mission = missions[i];
        let videoScore = 0;
        if (mission.videos && mission.videos.length > 0) {
            const completed = mission.videos.filter(v => v.isCompleted).length;
            videoScore = (completed / mission.videos.length) * 0.4;
        }
        let pdfScore = 0;
        let practiceScore = practiceRatio * 0.4;
        let missionProgress = videoScore + pdfScore + practiceScore;
        totalWeightedProgress += (missionProgress / missions.length);
    }
    return Math.min(1.0, totalWeightedProgress);
};

function SkillGauge({ label, value, examType, color }: { label: string, value: number, examType: string, color: string }) {
    const isIELTS = examType === "IELTS";
    const maxLabel = isIELTS ? "Band" : "/30";
    const currentVal = isIELTS ? (value * 9.0).toFixed(1) : Math.round(value * 30).toString();
    const circumference = 2 * Math.PI * 22;
    const strokeDashoffset = circumference - (value * circumference);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative h-14 w-14 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 52 52">
                    <circle className="text-muted/10 stroke-current" strokeWidth="4" cx="26" cy="26" r="22" fill="transparent" />
                    <circle className="stroke-current transition-all duration-1000 ease-out" style={{ color }}
                            strokeWidth="4" strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round" cx="26" cy="26" r="22" fill="transparent" />
                </svg>
                <div className="flex flex-col items-center mt-0.5">
                    <span className="text-xs font-bold leading-none">{currentVal}</span>
                    <span className="text-[6px] font-bold text-muted-foreground uppercase">{maxLabel}</span>
                </div>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>
    );
}

const getPathfinderTip = (level: string, tab: string) => {
    const l = level.toLowerCase();
    const t = tab.toLowerCase();
    if (l === 'easy') {
        if (t === 'reading') return { text: "You missed a few vocabulary questions in your assessment. This phase will help you master word-matching secrets!", title: "Master word-matching secrets..." };
        if (t === 'listening') return { text: "You missed a few detail-oriented audio cues. This phase will sharpen your ear for precision and distractors!", title: "Sharpen your ear for precision..." };
        if (t === 'writing') return { text: "Your grammar and sentence structures need a solid foundation. Let's build your writing engine step-by-step!", title: "Build your writing engine..." };
        if (t === 'speaking') return { text: "Let's build your speaking confidence from safe topics to full interactions. Prepare for the final AI mock interview!", title: "Build speaking confidence..." };
    } else if (l === 'medium') {
        if (t === 'reading') return { text: "You're reading well, but complex logic traps like TFNG are slowing you down. Let's master advanced inference.", title: "Master advanced inference..." };
        if (t === 'listening') return { text: "Multi-speaker flows and fast lectures are tricky. Time to practice spatial navigation and note-taking.", title: "Practice note-taking..." };
        if (t === 'writing') return { text: "Your coherence is improving, but try using more advanced cohesive devices to link these academic points.", title: "Use cohesive devices..." };
        if (t === 'speaking') return { text: "Your fluency is good, but you need to transition from safe topics to abstract reasoning and conditionals for a Band 7+.", title: "Transition to abstract reasoning..." };
    } else {
        if (t === 'reading') return { text: "Your comprehension is excellent, but abstract meaning and speed are the final hurdles. Let's master rapid inference.", title: "Master rapid inference..." };
        if (t === 'listening') return { text: "Your ear is sharp. Now we introduce high-speed synthesis and complex global accents. Focus on subtle distractors.", title: "Focus on subtle distractors..." };
        if (t === 'writing') return { text: "Your grammar is perfect, but stylistic choices matter. Try using a more active structure to sound authoritative.", title: "Refine stylistic choices..." };
        if (t === 'speaking') return { text: "It's time for the panel pressure. Focus on idiomatic naturalness and deep abstract reasoning.", title: "Focus on idiomatic naturalness..." };
    }
    return { text: "Keep progressing to master this skill.", title: "Pathfinder Insights" };
};

function PathfinderTip({ level, tab, colorClass }: { level: string, tab: string, colorClass: string }) {
    const tip = getPathfinderTip(level, tab);
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div 
          onClick={() => setExpanded(!expanded)}
          className={`cursor-pointer max-w-xl mx-auto rounded-3xl border transition-all duration-300 bg-card/60 backdrop-blur-md ${expanded ? 'p-6 shadow-xl border-primary/50' : 'p-4 shadow-sm border-primary/20'} mb-16 relative z-20`}
        >
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full bg-primary/10 text-primary`}>
                       <Sparkles size={expanded ? 20 : 16} className="text-current" />
                   </div>
                   {!expanded ? (
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{tip.title}</span>
                   ) : (
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pathfinder Tip</span>
                   )}
               </div>
               {!expanded && <ChevronRight size={14} className="text-primary/50" />}
            </div>
            {expanded && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        {tip.text}
                    </p>
                </div>
            )}
        </div>
    );
}

export function LearningPathView() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("reading");
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  const [syncHint, setSyncHint] = useState<string | null>(null);

  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, Record<number, string>>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, Record<number, boolean>>>({});
  
  // Audio Recording for Speaking Practice
  const [isRecording, setIsRecording] = useState<Record<number, boolean>>({});
  const [recordingSeconds, setRecordingSeconds] = useState<Record<number, number>>({});
  const [evaluationResults, setEvaluationResults] = useState<Record<number, any>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervals = useRef<Record<number, NodeJS.Timeout>>({});
  
  // Mission & Unit Test State
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [showUnitTest, setShowUnitTest] = useState(false);
  const [generatingMission, setGeneratingMission] = useState(false);
  const [unitTestContent, setUnitTestContent] = useState<any>(null);
  const [unitTestResults, setUnitTestResults] = useState<any>(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [envMode, setEnvMode] = useState<"IELTS" | "TOEFL">("IELTS");
  const [pathView, setPathView] = useState<"path" | "assessment" | "result">("path");
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [selectedAssessmentResult, setSelectedAssessmentResult] = useState<any>(null);

  // Theme configuration based on environment mode
  const theme = {
    primary: envMode === "IELTS" ? "emerald" : "blue",
    bg: envMode === "IELTS" ? "bg-emerald-500/5" : "bg-blue-500/5",
    text: envMode === "IELTS" ? "text-emerald-600" : "text-blue-600",
    border: envMode === "IELTS" ? "border-emerald-200" : "border-blue-200",
    gradient: envMode === "IELTS" ? "from-emerald-500 to-teal-500" : "from-blue-500 to-indigo-500",
    accent: envMode === "IELTS" ? "text-emerald-500" : "text-blue-500"
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await getLearningPath();
      const pathData = res?.skills ? res : (res?.data?.skills ? res.data : null);
      if (pathData) {
        setData(pathData);

        // --- NEW FIX: Rebuild local UI State from the Backend ---
        const initialExplanations: Record<string, Record<number, boolean>> = {};
        const initialAnswers: Record<string, Record<number, string>> = {};

        Object.keys(pathData.skills).forEach((skill) => {
          initialExplanations[skill] = {};
          initialAnswers[skill] = {};
          
          const modeData = pathData.learningMode?.[skill];
          const questions = Array.isArray(modeData) ? modeData : modeData?.questions || [];
          
          questions.forEach((q: any, i: number) => {
            if (q.isCompleted) {
              // Lock the UI for completed questions
              initialExplanations[skill][i] = true;
              
              // Try to populate past answers if the backend provides them
              const pastAnswer = q.user_answer || q.userAnswer || q.answer_text;
              if (pastAnswer) {
                initialAnswers[skill][i] = pastAnswer;
              }
            }
          });
        });

        // Merge with existing state so we don't accidentally wipe out unsaved typing during a sync
        setPracticeAnswers(prev => ({ ...prev, ...initialAnswers }));
        setShowExplanation(prev => ({ ...prev, ...initialExplanations }));
        // --------------------------------------------------------

        const skills = Object.keys(pathData.skills);
        if (skills.length > 0 && !skills.includes(activeTab)) setActiveTab(skills[0]);
      } else {
        setError("Not found");
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? "Not found" : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleVideo = async (videoId: number) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const video = newData.skills[activeTab].videos.find((v: any) => v.id === videoId);
      if (video) {
        video.isCompleted = !video.isCompleted;
      }
      return newData;
    });

    const currentVideoStatus = data?.skills[activeTab]?.videos.find(v => v.id === videoId)?.isCompleted;
    try {
      await trackProgress({ videoId, section: activeTab, isCompleted: !currentVideoStatus });
    } catch (error) {
      console.error("Failed to track video progress", error);
    }
  };

  const handleToggleNote = async () => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      newData.skills[activeTab].isNoteCompleted = !newData.skills[activeTab].isNoteCompleted;
      return newData;
    });

    const currentNoteStatus = data?.skills[activeTab]?.isNoteCompleted;
    try {
      await trackProgress({ isNote: true, section: activeTab, isCompleted: !currentNoteStatus });
    } catch (error) {
      console.error("Failed to track note progress", error);
    }
  };

  const handleSelectAnswer = async (skill: string, qIndex: number, answer: string) => {
    setPracticeAnswers(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: answer } }));
    setShowExplanation(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: true } }));
    
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const modeData = newData?.learningMode?.[skill];
      const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
      if (questions[qIndex]) questions[qIndex].isCompleted = true;
      return newData;
    });

    try {
      // NEW FIX: Pass the `answer` payload
      await trackProgress({ questionIndex: qIndex, section: skill, isCompleted: true, answer: answer });
    } catch (error) {
      console.error("Failed to track question progress", error);
    }
  };

  const handleTextareaChange = (skill: string, qIndex: number, answer: string) => {
    setPracticeAnswers(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: answer } }));
  };

  const handleSubmitTextAnswer = async (skill: string, qIndex: number) => {
    const answer = practiceAnswers[skill]?.[qIndex] || "";
    if (answer.trim().length > 0) {
      setShowExplanation(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: true } }));
      
      setData(prev => {
        if (!prev) return prev;
        const newData = JSON.parse(JSON.stringify(prev));
        const modeData = newData?.learningMode?.[skill];
        const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
        if (questions[qIndex]) questions[qIndex].isCompleted = true;
        return newData;
      });

      try {
        // NEW FIX: Pass the `answer` payload to the backend
        await trackProgress({ questionIndex: qIndex, section: skill, isCompleted: true, answer: answer });
      } catch (error) {
        console.error("Failed to track textarea progress", error);
      }
    }
  };

  const startRecording = async (qIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
         const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
         handleEvaluateSpeaking(qIndex, blob);
         stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(prev => ({ ...prev, [qIndex]: true }));
      setRecordingSeconds(prev => ({ ...prev, [qIndex]: 0 }));
      recordingIntervals.current[qIndex] = setInterval(() => {
        setRecordingSeconds(prev => ({ ...prev, [qIndex]: (prev[qIndex] || 0) + 1 }));
      }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = (qIndex: number) => {
    if (mediaRecorderRef.current && isRecording[qIndex]) {
      mediaRecorderRef.current.stop();
      setIsRecording(prev => ({ ...prev, [qIndex]: false }));
      if (recordingIntervals.current[qIndex]) clearInterval(recordingIntervals.current[qIndex]);
    }
  };

  const handleEvaluateSpeaking = async (qIndex: number, blob: Blob) => {
    try {
      setEvaluating(prev => ({ ...prev, [qIndex]: true }));
      const result = await evaluateSpeakingPractice(qIndex, blob);
      const normalizedResult = (result && typeof result === 'object' && 'data' in result)
        ? (result as { data?: any }).data
        : result;

      if (normalizedResult) {
        setEvaluationResults(prev => ({ ...prev, [qIndex]: normalizedResult }));
        setShowExplanation(prev => ({ ...prev, [activeTab]: { ...(prev[activeTab] || {}), [qIndex]: true } }));
        
        const modeData = data?.learningMode?.[activeTab];
        const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
        if (questions[qIndex]) {
          questions[qIndex].isCompleted = true;
          setData({ ...data! });
        }
      }
    } catch (err) {
      console.error("Evaluation failed", err);
    } finally {
      setEvaluating(prev => ({ ...prev, [qIndex]: false }));
    }
  };

  const handleCompleteSection = async (section: string) => {
    try {
      setCompleting(true);
      setSyncHint(null);

      const localAnswers = practiceAnswers[section];
      if (localAnswers) {
         for (const [qIndex, answerText] of Object.entries(localAnswers)) {
            if (answerText.trim().length > 0 && !showExplanation[section]?.[Number(qIndex)]) {
               // NEW FIX: Also pass `answer` in the failsafe sync
               await trackProgress({ questionIndex: Number(qIndex), section, isCompleted: true, answer: answerText }).catch(() => {});
            }
         }
      }

      if (data?.skills[section] && !data.skills[section].isNoteCompleted) {
         await trackProgress({ isNote: true, section, isCompleted: true }).catch(() => {});
      }

      await completeSection(section);
      setCompletedSections(prev => ({ ...prev, [section]: true }));
      await load(); 
      
      // Navigate to next skill instead of generating assessment
      if (!data) return;
      const skillNames = Object.keys(data.skills);
      const nextIdx = skillNames.indexOf(section) + 1;
      if (nextIdx < skillNames.length) {
        setActiveTab(skillNames[nextIdx]);
        toast.success(`Module ${section} complete! Moving to ${skillNames[nextIdx]}.`);
        
        // Scroll to top of skills section
        const el = document.getElementById("skills-navigation-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.success(`All learning modules complete! You can now take the final mock exam.`);
      }
    } catch (err) {
      console.error("Failed to complete section", err);
      setSyncHint("Could not sync section right now. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

   const handleSyncAllCompletedSections = async () => {
      if (!data) return;
      try {
         setSyncingAll(true);
         setSyncHint(null);

         const skillNames = Object.keys(data.skills);
         const completedSkills = skillNames.filter((skill) => isSkillLocallyComplete(data, skill, practiceAnswers));

         for (const skill of completedSkills) {
            await completeSection(skill);
         }

         const completedFlags = completedSkills.reduce(
            (acc, skill) => ({ ...acc, [skill]: true }),
            {} as Record<string, boolean>,
         );
         setCompletedSections((prev) => ({ ...prev, ...completedFlags }));
         await load();
      } catch (err) {
         console.error("Failed to sync all completed sections", err);
         setSyncHint("Could not sync all sections. Please try again.");
      } finally {
         setSyncingAll(false);
      }
   };

   const handleStartMission = async (mIndex: number) => {
      setActiveMission(mIndex);
      // Automatically scroll down to the curriculum modules section
      setTimeout(() => {
         const el = document.getElementById("curriculum-modules-section");
         if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
         }
      }, 100);
   };

   const handleTakeUnitTest = async (mIndex: number) => {
      try {
         setIsSubmittingTest(true);
         const res = await generateUnitTest({ 
            skill: activeTab, 
            level: data?.proficiencyLevel || 'easy',
            examType: currentExamType 
         });
         setUnitTestContent(res?.data || res);
         setActiveMission(mIndex);
         setShowUnitTest(true);
         setUnitTestResults(null);
      } catch (err) {
         console.error("Failed to generate unit test", err);
      } finally {
         setIsSubmittingTest(false);
      }
   };

   const handleSubmitUnitTest = async (responses: any[]) => {
      if (activeMission === null) return;
      try {
         setIsSubmittingTest(true);
         const res = await submitUnitTest({
            skill: activeTab,
            responses,
            missionIndex: activeMission
         });
         setUnitTestResults(res?.data || res);
         if (res?.data?.passed || res?.passed) {
            await load(); // Refresh progress
         }
      } catch (err) {
         console.error("Failed to submit unit test", err);
      } finally {
         setIsSubmittingTest(false);
      }
   };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Constructing Curriculum Matrix...</p>
      </div>
    );
  }

  if (error === "Not found") {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-10">
         <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Compass className="h-12 w-12 text-primary" />
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Begin Your Journey</h2>
            <p className="text-muted-foreground font-normal text-base leading-relaxed">
               Take the diagnostic assessment to unlock your personalized learning path.
            </p>
         </div>
         <Link href="/dashboard/learning-path/diagnostic/assessment">
            <Button size="lg" className="px-12 h-14 rounded-2xl primary-gradient text-white shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform">
               START ASSESSMENT
            </Button>
         </Link>
      </div>
    );
  }

  if (!data || !data.skills) return null;

  const currentSkill = data.skills[activeTab];
  const progress = data.current_progress_percentage || 0;
   const skillNames = Object.keys(data.skills);
   const skillStatusList = skillNames.map((skill) => getSkillCompletionStatus(data, skill, practiceAnswers));
   const locallyCompletedSkillCount = skillStatusList.filter((s) => s.complete).length;
   const localUnitsTotal = skillNames.length;
   const localUnitsCompleted = locallyCompletedSkillCount;
   const localProgress = localUnitsTotal > 0 ? Math.round((localUnitsCompleted / localUnitsTotal) * 100) : 0;
   const isOutOfSync = localProgress > progress;
   const incompleteSkillStatus = skillStatusList.filter((s) => !s.complete);
  const canLevelUp = progress >= 100;
   const currentExamType = normalizeExamType(
      data.examType || data.exam_type || data.competencyGapAnalysis?.exam_type || data.competencyGapAnalysis?.examType,
   );

  const modeData = data.learningMode?.[activeTab];
  const pQues = Array.isArray(modeData) 
    ? modeData 
    : ((modeData as any)?.questions || (modeData as any)?.practice_questions || ((modeData as any)?.prompt ? [modeData] : []));
  const listeningScript = (modeData as any)?.script || null;
  const listeningAudio = (modeData as any)?.audio_base64 || null;

  const pTotal = pQues.length;
  const pComp = pQues.filter((q: any, idx: number) => {
    if (q.isCompleted) return true;
    const answer = practiceAnswers[activeTab]?.[idx];
    if (answer !== undefined && String(answer).trim().length > 0) return true;
    return false;
  }).length;

  const vTotal = currentSkill?.videos?.length || 0;
  const vComp = currentSkill?.videos?.filter(v => v.isCompleted).length || 0;

  const isSectionSaved = completedSections[activeTab] || false;

  if (pathView === "assessment" && activeAssessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <AssessmentTest
          examData={activeAssessment}
          onComplete={() => {
            setActiveAssessment(null);
            setPathView("path");
            load();
          }}
        />
      </div>
    );
  }

  if (pathView === "result" && selectedAssessmentResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <AssessmentResultView
          testId={selectedAssessmentResult.testId || selectedAssessmentResult.test_id || ""}
          examType={selectedAssessmentResult.examType}
          difficulty={selectedAssessmentResult.difficulty}
          initialData={selectedAssessmentResult.evaluation}
          onBack={() => {
            setSelectedAssessmentResult(null);
            setPathView("path");
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between border-b border-border/60 pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <EnvironmentSwitcher mode={envMode} onChange={setEnvMode} />
             <span className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${levelConfig[data.proficiencyLevel].color} ${levelConfig[data.proficiencyLevel].bg} ${levelConfig[data.proficiencyLevel].border}`}>
               Tier: {levelConfig[data.proficiencyLevel].label}
             </span>
          </div>
          <div className="relative space-y-3">
            <div className={`absolute -inset-10 opacity-20 blur-3xl rounded-full z-0 ${envMode === "IELTS" ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} />
            <h1 className="relative z-10 text-6xl md:text-7xl font-black tracking-tighter leading-none uppercase bg-linear-to-br from-foreground via-foreground/80 to-transparent bg-clip-text text-transparent drop-shadow-sm">
              Mastery Hub
            </h1>
            <p className="relative z-10 text-muted-foreground font-medium text-sm md:text-base flex items-center gap-2 max-w-lg">
               <Sparkles size={16} className={`${theme.accent} shrink-0`} /> 
               Leveling up your {envMode} proficiency through AI-sequenced missions.
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-10 bg-card/60 backdrop-blur-2xl p-8 rounded-[40px] border border-white/20 shadow-2xl overflow-hidden group">
           <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-.gradient-to-r ${envMode === "IELTS" ? 'from-emerald-400 to-transparent' : 'from-blue-400 to-transparent'}`} />
           <div className="relative z-10 text-right space-y-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-60">Overall Mastery</p>
              <div className="flex items-baseline gap-1 justify-end">
                <span className={`text-5xl font-black leading-none tracking-tighter ${theme.text} drop-shadow-sm`}>{progress}%</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest">SYNCED</span>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} opacity-60 mt-2`}>Local Track: {localProgress}%</p>
           </div>
           <div className="relative z-10 h-24 w-24 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${envMode === "IELTS" ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <svg className="absolute inset-0 h-full w-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                 <circle className="text-muted/10 stroke-current" strokeWidth="6" cx="50" cy="50" r="44" fill="transparent" />
                 <circle className={`stroke-current transition-all duration-1000 ease-out ${envMode === "IELTS" ? 'text-emerald-500' : 'text-blue-500'}`}
                         strokeWidth="8" strokeDasharray={`${progress * 2.76} 276`}
                         strokeLinecap="round" cx="50" cy="50" r="44" fill="transparent" />
              </svg>
              <Trophy size={28} className={`${theme.accent} drop-shadow-sm`} />
           </div>
        </div>
      </div>

         {(isOutOfSync || syncHint || incompleteSkillStatus.length > 0) && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
               <div className="space-y-2">
                  <p className="text-sm text-amber-900">
                     {syncHint || `You completed ${localProgress}% locally, but synced progress is ${progress}%. Click Sync All Completed to push every finished section.`}
                  </p>
                  {incompleteSkillStatus.length > 0 && (
                     <div className="text-xs text-amber-900/90 space-y-1">
                        {incompleteSkillStatus.map((s) => (
                           <p key={s.skill}>
                              {s.skill.toUpperCase()}: videos {s.videosDone}/{s.videosTotal}, questions {s.questionsDone}/{s.questionsTotal}, note {s.noteComplete ? "done" : "pending"}
                           </p>
                        ))}
                     </div>
                  )}
               </div>
               <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSyncAllCompletedSections} disabled={syncingAll || completing}>
                     {syncingAll ? "Syncing..." : "Sync All Completed"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCompleteSection(activeTab)} disabled={completing}>
                     Sync {activeTab}
                  </Button>
               </div>
            </div>
         )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-12">
           {/* SKILL OVERVIEW GAUGES */}
           <div className="p-6 rounded-[40px] bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl shadow-primary/5 flex items-center justify-between lg:grid lg:grid-cols-2 lg:gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              {['reading', 'listening', 'writing', 'speaking'].map(s => {
                  const val = calculateSkillProgress(data, s, practiceAnswers);
                  const isIELTS = envMode === "IELTS";
                  const colors: Record<string, string> = isIELTS 
                     ? { reading: '#10B981', listening: '#3B82F6', writing: '#F43F5E', speaking: '#F59E0B' }
                     : { reading: '#3B82F6', listening: '#0EA5E9', writing: '#8B5CF6', speaking: '#D946EF' };
                  return <SkillGauge key={s} label={s} value={val} examType={currentExamType} color={colors[s]} />;
              })}
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest px-2 text-muted-foreground opacity-40">Skill Dimensions</h4>
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
                 {Object.keys(data.skills).map((skill) => {
                    const Icon = skillIcons[skill];
                    const active = activeTab === skill;
                    const saved = completedSections[skill];
                    const skillTheme = active ? (envMode === "IELTS" ? "bg-emerald-500 text-white border-emerald-400" : "bg-blue-600 text-white border-blue-500") : "bg-card/50 text-muted-foreground hover:bg-muted/80 border-border/40";
                    
                    return (
                       <button
                         key={skill}
                         onClick={() => setActiveTab(skill)}
                         className={`group relative shrink-0 flex items-center justify-between p-5 rounded-3xl transition-all duration-500 font-bold uppercase text-[11px] tracking-[0.2em] border min-w-[150px] lg:w-full overflow-hidden ${skillTheme} ${active ? 'shadow-2xl shadow-primary/20 scale-[1.03] z-10' : 'hover:scale-[1.01] hover:shadow-lg'}`}
                       >
                          {active && (
                            <div className="absolute inset-0 bg-white/20 blur-xl opacity-50" />
                          )}
                          <div className="relative z-10 flex items-center gap-4">
                             <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-white/20 text-white' : 'bg-primary/10 ' + theme.accent}`}>
                                <Icon size={16} />
                             </div>
                             <span>{skill}</span>
                          </div>
                          <div className="relative z-10">
                             {saved
                               ? <CheckCircle2 size={18} className={active ? "text-white" : "text-emerald-500"} />
                               : <ChevronRight size={16} className={`transition-all duration-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"}`} />
                             }
                          </div>
                       </button>
                    );
                 })}
              </div>
           </div>

           <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6 grayscale opacity-80">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary/60">
                 <BarChart3 size={18} />
              </div>
              <div className="space-y-2">
                 <h5 className="text-[10px] font-medium uppercase tracking-widest leading-none">Promotion Target</h5>
                 <p className="text-[11px] font-normal text-muted-foreground leading-relaxed">Complete all 4 skill sections to reach 100% and unlock tier-elevation.</p>
              </div>
           </div>

           {/* CURRICULUM MAP PANEL */}
           {data.curriculumMap && (
              <div className="p-8 rounded-3xl bg-linear-to-br from-primary/5 to-accent/5 border border-primary/10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                       <MapIcon size={16} />
                    </div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest">Growth Sprints</h5>
                 </div>
                 <div className="space-y-3">
                    {data.curriculumMap.sprints?.map((sprint: any, i: number) => (
                       <div key={i} className="flex gap-3">
                          <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${sprint.is_remedial ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>W{sprint.week}</div>
                          <p className="text-[10px] text-muted-foreground leading-tight pt-1">{sprint.goal}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>

        {/* MAIN FEED */}
        <div className="lg:col-span-3 space-y-24">
           <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-24">

                 {/* 01 COMPETENCY STRATEGY */}
                 <section className="space-y-10">
                    <div className="flex items-center gap-2 px-2">
                       <span className="h-1 w-4 bg-primary/40 rounded-full" />
                       <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/70">01 / Competency Strategy</h2>
                    </div>

                    <div className="space-y-12">
                       <div className="space-y-6">
                          <h3 className="text-2xl font-semibold tracking-tight">Gap Analysis Summary</h3>
                          <div className="max-w-4xl text-lg font-normal leading-relaxed text-foreground/80 italic">
                             "{data.competencyGapAnalysis?.proficiency_profile || "Analyzing student response profile..."}"
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                             {data.competencyGapAnalysis?.weaknesses?.map((w: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-red-500/5 text-red-600 rounded-full text-[10px] font-medium uppercase border border-red-200/10 tracking-widest">{w}</span>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4 pt-10 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-primary/50">
                               <BookMarked size={14} /> Subject Directive
                            </div>
                            <button
                              onClick={handleToggleNote}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-medium uppercase tracking-widest transition-all ${currentSkill?.isNoteCompleted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted'}`}
                            >
                              {currentSkill?.isNoteCompleted ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                              {currentSkill?.isNoteCompleted ? 'Directive Acknowledged' : 'Mark as Read'}
                            </button>
                          </div>
                          <div className="text-sm font-normal text-muted-foreground/90 leading-relaxed max-w-4xl whitespace-pre-wrap">
                             {data.competencyGapAnalysis?.section_analysis?.[activeTab] || currentSkill?.notes}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* ADVENTURE PATH: MISSIONS */}
                 <section className="space-y-12">
                    <div className="flex flex-col items-center text-center space-y-4 mb-8">
                        <PathfinderTip level={data.proficiencyLevel} tab={activeTab} colorClass={theme.bg} />
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4 mb-16">
                       <div className="flex items-center gap-2">
                          <span className={`h-1 w-8 ${envMode === "IELTS" ? 'bg-emerald-400' : 'bg-blue-400'} rounded-full`} />
                          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">The Adventure Path</h2>
                          <span className={`h-1 w-8 ${envMode === "IELTS" ? 'bg-emerald-400' : 'bg-blue-400'} rounded-full`} />
                       </div>
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Complete missions to unlock the final assessment</p>
                    </div>
 
                    <div className="relative max-w-2xl mx-auto pb-20">
                       {/* Connecting Line Path */}
                       <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-muted/20 -translate-x-1/2 z-0 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            className={`w-full relative ${envMode === "IELTS" ? 'bg-emerald-500' : 'bg-blue-600'} shadow-[0_0_15px_rgba(var(--primary),0.5)]`}
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentSkill.missions?.filter((m: any) => m.isCompleted).length / (currentSkill.missions?.length || 1)) * 100}%` }}
                            transition={{ duration: 2, ease: "easeOut" }}
                          >
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-8 bg-white rounded-full blur-sm opacity-50 mix-blend-overlay" />
                          </motion.div>
                       </div>

                       <div className="space-y-32 relative z-10">
                          {currentSkill.missions?.map((m: any, i: number) => {
                             const isLocked = i > 0 && !currentSkill.missions[i - 1].isCompleted;
                             const isActive = activeMission === i && !isLocked;
                             const isDone = m.isCompleted;
                             const isEven = i % 2 === 0;

                             return (
                               <motion.div 
                                 key={i}
                                 initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                                 whileInView={{ opacity: 1, x: 0 }}
                                 viewport={{ once: true }}
                                 className={`flex flex-col items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16`}
                               >
                                  {/* MISSION NODE */}
                                  <div className="relative">
                                     <button
                                       onClick={() => !isLocked && handleStartMission(i)}
                                       className={`size-24 rounded-[32px] flex items-center justify-center transition-all duration-500 ${isLocked ? 'bg-muted/50 border-2 border-border/40 text-muted-foreground/30' : isDone ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 rotate-12' : isActive ? 'primary-gradient text-white shadow-2xl shadow-primary/30 scale-110' : 'bg-card border-2 border-primary/20 text-primary hover:border-primary'}`}
                                     >
                                        {isLocked ? <Lock size={28} /> : isDone ? <CheckCircle2 size={32} /> : <Target size={32} />}
                                        
                                        {/* Particle/Glow for Active */}
                                        {isActive && (
                                          <motion.div 
                                            className="absolute inset-0 rounded-[32px] border-4 border-primary/40"
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                          />
                                        )}
                                     </button>
                                     <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-muted-foreground/40' : theme.text}`}>
                                           Mission 0{i + 1}
                                        </span>
                                     </div>
                                  </div>

                                  {/* MISSION DETAILS CARD */}
                                  <div className={`relative flex-1 w-full max-w-sm p-8 rounded-[40px] border transition-all duration-700 overflow-hidden group ${isLocked ? 'bg-muted/5 border-border/20 opacity-50 hover:opacity-70' : isActive ? 'bg-card/80 backdrop-blur-xl border-primary/50 shadow-2xl shadow-primary/20 scale-[1.02]' : 'bg-card/40 backdrop-blur-md border-border/40 hover:border-primary/30 hover:shadow-xl'}`}>
                                     {isActive && <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />}
                                     <div className="relative z-10 flex items-center justify-between mb-4">
                                        <h4 className={`text-2xl font-black tracking-tight ${isActive ? 'text-foreground drop-shadow-sm' : 'text-foreground/70 group-hover:text-foreground transition-colors'}`}>{m.title}</h4>
                                        {isDone && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-sm">Mastered</span>}
                                     </div>
                                     <p className="text-xs text-muted-foreground leading-relaxed mb-8">{m.objective}</p>
                                     
                                     <div className="flex gap-3">
                                        <Button 
                                          onClick={() => handleStartMission(i)}
                                          disabled={isLocked}
                                          className={`flex-1 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest ${isActive ? 'primary-gradient text-white' : 'bg-muted/50 text-foreground'}`}
                                        >
                                           {isDone ? 'Review' : isActive ? 'Continue' : 'Start'}
                                        </Button>
                                        <Button 
                                          onClick={() => handleTakeUnitTest(i)}
                                          disabled={isLocked || m.isUnitTestCompleted}
                                          variant="outline"
                                          className={`flex-1 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest ${m.isUnitTestCompleted ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : ''}`}
                                        >
                                           {m.isUnitTestCompleted ? 'Test Passed' : 'Final Exam'}
                                        </Button>
                                     </div>
                                  </div>
                               </motion.div>
                             );
                          })}

                          {/* DYNAMIC END NODE */}
                          <div className="flex flex-col items-center">
                             <button 
                               onClick={() => setGeneratingMission(true)}
                               className="size-20 rounded-[24px] border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/10 transition-all hover:scale-110 group"
                             >
                                <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                             </button>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4 opacity-40">Generate Extra Mission</p>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* 02 CURRICULUM MODULES */}
                 <section className="space-y-10" id="curriculum-modules-section">
                    <div className="flex items-center gap-2 px-2">
                       <span className="h-1 w-4 bg-primary/40 rounded-full" />
                       <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/70">02 / Curriculum Modules</h2>
                    </div>

                    <div className="space-y-24">
                       {/* Video Modules */}
                       <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                             <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-40">Instructional Log Feed</h4>
                             <span className="text-[9px] font-medium uppercase tracking-widest text-primary/60">{vComp} / {vTotal} COMPLETED</span>
                          </div>

                          <div className="divide-y divide-border/60">
                             {currentSkill?.videos?.map((v, i) => (
                               <div key={v.id} className="flex items-center py-6 gap-8 group">
                                  <button onClick={() => handleToggleVideo(v.id)} className={`${v.isCompleted ? 'text-primary' : 'text-muted-foreground/10 hover:text-primary transition-colors'}`}>
                                     {v.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                  </button>
                                  <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-8">
                                     <div className="h-14 w-14 bg-slate-50 rounded-full shrink-0 flex items-center justify-center text-slate-300 overflow-hidden relative border border-border/40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all">
                                        <img src={v.thubnail} className="h-full w-full object-cover" />
                                        {v.videolink && (
                                          <a href={v.videolink} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 text-white transition-all opacity-0 hover:opacity-100"><PlayCircle size={18} /></a>
                                        )}
                                     </div>
                                     <div className="flex-1 space-y-1">
                                        <p className={`text-lg font-medium tracking-tight ${v.isCompleted ? 'text-muted-foreground line-through opacity-40' : 'text-foreground/90'}`}>{v.title || `Instructional Module 0${i + 1}`}</p>
                                        <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-widest text-muted-foreground opacity-30">
                                           <span>TIER {data.proficiencyLevel.toUpperCase()}</span>
                                           <span className="h-1 w-1 bg-border rounded-full" />
                                           <span>LOG MODULE</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Practice Matrix */}
                       <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                             <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-40">Practical Application Matrix</h4>
                             <span className="text-[9px] font-medium uppercase tracking-widest text-primary/60">{pComp} / {pTotal} RESOLVED</span>
                          </div>

                          <div className="divide-y divide-border/60">
                             {pQues.length > 0 ? pQues.map((q: any, idx: number) => (
                               <div key={idx} className="py-12 space-y-8">
                                  <div className="space-y-4">
                                     <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full border border-primary/20 flex items-center justify-center text-[9px] font-medium text-primary opacity-60">0{idx + 1}</div>
                                        <h5 className="text-xl font-medium tracking-tight leading-tight italic text-foreground/80">"{String(q.question || q.prompt)}"</h5>
                                     </div>

                                     {/* LISTENING SCRIPT */}
                                     {activeTab === 'listening' && listeningScript && (
                                       <div className="space-y-4">
                                         <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 opacity-40">Audio Transcript</p>
                                           <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{listeningScript}</p>
                                         </div>
                                       </div>
                                     )}

                                     {/* AUDIO PLAYER WITH ON-ENDED TRACKING */}
                                     {(q.audio_base64 || listeningAudio) && (
                                       <div className="p-5 bg-linear-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-2xl space-y-3 max-w-2xl">
                                          <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-primary/60">
                                             <Headphones size={12} /> Listening Stimulus
                                          </div>
                                          <audio 
                                            controls 
                                            className="w-full h-10" 
                                            src={`data:audio/mp3;base64,${q.audio_base64 || listeningAudio}`}
                                          >
                                             Your browser does not support the audio element.
                                          </audio>
                                       </div>
                                     )}

                                     {/* RENDER QUESTIONS */}
                                     {(q.options || q.choices) ? (
                                       <div className="grid md:grid-cols-2 gap-3 max-w-3xl pt-2">
                                          {(q.options || q.choices).map((opt: string) => {
                                            const rev = showExplanation[activeTab]?.[idx];
                                            const correct = isCorrectOption(q.answer || q.correct_answer || q.correctAnswer, opt, q.options || q.choices);
                                            const selected = practiceAnswers[activeTab]?.[idx] === opt;
                                            return (
                                               <button key={opt} disabled={rev} onClick={() => handleSelectAnswer(activeTab, idx, opt)}
                                                       className={`text-left p-4 rounded-xl text-sm font-medium transition-all border tracking-tight flex items-center justify-between gap-3 ${rev ? correct ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : selected ? 'bg-red-50 border-red-300 text-red-700' : 'bg-muted border-transparent opacity-50' : 'bg-muted/20 border-transparent hover:border-primary/40'}`}>
                                                  <span>{opt}</span>
                                                  {rev && correct && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
                                                  {rev && selected && !correct && <AlertCircle size={16} className="shrink-0 text-red-600" />}
                                               </button>
                                            );
                                          })}
                                       </div>
                                     ) : activeTab === 'speaking' ? (
                                       <div className="space-y-6 max-w-2xl">
                                          {evaluationResults[idx] ? (
                                             (() => {
                                                const scoreMeta = getSpeakingScoreMeta(evaluationResults[idx], currentExamType);
                                                return (
                                                   <div className="space-y-4">
                                                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                                                         <div className="flex items-center justify-between gap-3">
                                                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Speaking {scoreMeta.label}</p>
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700/80">{scoreMeta.examType}</span>
                                                         </div>
                                                         <p className="text-2xl font-semibold text-emerald-700 leading-none">
                                                            {scoreMeta.displayScore}
                                                            <span className="text-sm font-medium text-emerald-700/70"> / {scoreMeta.max}</span>
                                                         </p>
                                                         <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${scoreMeta.percent}%` }} />
                                                         </div>
                                                         {scoreMeta.score === null && (
                                                            <p className="text-[10px] text-emerald-800/80">Numeric score is unavailable in this response. Feedback is shown below.</p>
                                                         )}
                                                      </div>

                                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                          {[
                                                             { label: 'Pronunciation', val: evaluationResults[idx].pronunciation },
                                                             { label: 'Fluency', val: evaluationResults[idx].fluency },
                                                             { label: 'Coherence', val: evaluationResults[idx].coherence },
                                                          ].map((stat, i) => (
                                                             <div key={i} className="p-3 rounded-xl bg-card border border-border space-y-1">
                                                                  <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                                                  <p className="text-[10px] leading-tight text-foreground/80 line-clamp-3">{stat.val || "No detailed feedback"}</p>
                                                             </div>
                                                          ))}
                                                      </div>
                                                   </div>
                                                );
                                             })()
                                          ) : (
                                             <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-muted/20 border border-dashed border-border/60">
                                               {isRecording[idx] ? (
                                                 <>
                                                   <div className="flex items-center gap-4">
                                                      <div className="size-3 bg-destructive rounded-full animate-pulse" />
                                                      <span className="text-xl font-mono font-bold text-destructive">{Math.floor((recordingSeconds[idx] || 0) / 60)}:{(recordingSeconds[idx] || 0) % 60 < 10 ? '0' : ''}{(recordingSeconds[idx] || 0) % 60}</span>
                                                   </div>
                                                   <Button onClick={() => stopRecording(idx)} className="rounded-full bg-destructive hover:bg-destructive/90 text-white gap-2">
                                                      <StopCircle size={16} /> Stop & Evaluate
                                                   </Button>
                                                 </>
                                               ) : (
                                                 <>
                                                   <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                      <Mic size={24} />
                                                   </div>
                                                   <div className="text-center space-y-1">
                                                      <p className="text-sm font-bold">Ready to Practice?</p>
                                                      <p className="text-xs text-muted-foreground">Record your response for immediate AI scoring.</p>
                                                   </div>
                                                   <Button disabled={evaluating[idx]} onClick={() => startRecording(idx)} className="rounded-full primary-gradient text-white gap-2">
                                                      {evaluating[idx] ? <><Loader2 size={16} className="animate-spin" /> Evaluating...</> : <><Mic size={16} /> Start Recording</>}
                                                   </Button>
                                                 </>
                                               )}
                                             </div>
                                          )}
                                       </div>
                                     ) : (
                                       // TEXTAREA + EXPLICIT SUBMIT BUTTON
                                       <div className="p-6 bg-slate-50/50 border border-border/60 rounded-2xl space-y-4">
                                          <textarea 
                                             className="w-full bg-transparent text-lg font-normal placeholder:text-muted-foreground/20 focus:outline-none min-h-30 tracking-tight resize-y"
                                             placeholder="Input formalized response transcript..." 
                                             // NEW FIX: Show a clear message if the backend says it's saved but we don't have the text available
                                             value={practiceAnswers[activeTab]?.[idx] ?? (q.isCompleted ? "(Answer locked and saved.)" : "")}
                                             disabled={showExplanation[activeTab]?.[idx]}
                                             onChange={(e) => handleTextareaChange(activeTab, idx, e.target.value)} 
                                          />
                                          {!showExplanation[activeTab]?.[idx] ? (
                                             <div className="flex justify-end pt-2 border-t border-border/40">
                                                <Button 
                                                   onClick={() => handleSubmitTextAnswer(activeTab, idx)}
                                                   disabled={!practiceAnswers[activeTab]?.[idx]?.trim()}
                                                   className="gap-2 px-6 bg-primary text-white hover:bg-primary/90 rounded-xl"
                                                >
                                                   <Send size={16} /> Submit Answer
                                                </Button>
                                             </div>
                                          ) : (
                                             <div className="flex justify-end pt-2 border-t border-border/40">
                                                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                                   <CheckCircle2 size={16} /> Answer Locked
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                     )}

                                     {showExplanation[activeTab]?.[idx] && (
                                       <div className="p-6 bg-indigo-50/40 border-l border-indigo-400 rounded-r-2xl animate-in fade-in duration-700">
                                          <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-indigo-500 mb-3 opacity-60">
                                             <Sparkles size={12} /> Evaluative Appraisal
                                          </div>
                                          <div className="text-base font-normal text-indigo-900 leading-relaxed italic max-w-4xl opacity-90">
                                             "{String(q.explanation || q.tips || q.sample_answer || q.sample_response)}"
                                          </div>
                                       </div>
                                     )}
                                  </div>
                               </div>
                             )) : (
                               <div className="py-20 flex flex-col items-center justify-center text-center opacity-10">
                                  <Lock size={32} className="mb-4" />
                                  <p className="text-[10px] font-medium uppercase tracking-widest">Protocol Sync Pending</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* FINALIZE SECTION BUTTON */}
                  <div className="flex flex-col items-center gap-4 pt-4 pb-12 border-b border-border/40">
                    {isSectionSaved ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 px-8 py-4 bg-primary/5 border border-primary/20 rounded-2xl">
                           <CheckCircle2 size={20} className="text-primary" />
                           <span className="text-sm font-semibold text-primary uppercase tracking-widest">{activeTab} Section Saved</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                             try {
                                toast.loading("Fetching latest results...", { id: "fetch-results" });
                                const res = await getAssessmentProgress(envMode);
                                toast.dismiss("fetch-results");
                                const items = Array.isArray(res) ? res : res?.data || [];
                                const latest = items.filter((i: any) => i.examType === envMode && i.evaluation?.score_breakdown?.[activeTab]).reverse()[0];
                                if (latest) {
                                   setSelectedAssessmentResult(latest);
                                   setPathView("result");
                                } else {
                                   toast.error("No assessment result found for this section.");
                                }
                             } catch (err) {
                                toast.dismiss("fetch-results");
                                toast.error("Failed to load results.");
                             }
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
                        >
                           View Latest {activeTab} Results
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleCompleteSection(activeTab)}
                        disabled={completing}
                        size="lg"
                        className="px-12 h-14 rounded-2xl primary-gradient text-white shadow-xl shadow-primary/20 font-semibold uppercase tracking-widest text-[11px] hover:scale-105 transition-transform disabled:opacity-60 disabled:scale-100"
                      >
                        {completing ? (
                          <><Loader2 size={16} className="mr-3 animate-spin" /> Saving {activeTab} Module...</>
                        ) : (
                          <>Complete {activeTab} Module & Save Progress <CheckCircle2 className="ml-3 h-4 w-4" /></>
                        )}
                      </Button>
                    )}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                      Saves all videos, notes & practice for {activeTab}
                    </p>
                  </div>

                 {/* ULTIMATE MOCK EXAM BUTTON */}
                 <div className="pt-16 pb-12">
                     <div className="relative w-full h-88 sm:h-64 rounded-4xl overflow-hidden shadow-2xl shadow-primary/20 group">
                        <div className="absolute inset-0 bg-slate-900" />
                        <div className={`absolute inset-0 bg-linear-to-t from-black/90 to-black/20 z-10`} />
                        <div className={`absolute inset-0 bg-linear-to-t ${envMode === "IELTS" ? 'from-emerald-900/60' : 'from-blue-900/60'} mix-blend-multiply z-10`} />
                        
                        <div className="absolute inset-0 p-8 z-20 flex flex-col justify-end items-start">
                            <div className={`px-3 py-1.5 rounded-full ${envMode === "IELTS" ? 'bg-emerald-500' : 'bg-blue-500'} flex items-center gap-2 mb-4`}>
                                <Unlock size={12} className="text-white" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white">Ultimate Goal Unlocked</span>
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Full Mastery Mock Exam</h3>
                            <p className="text-white/80 text-sm font-medium max-w-lg mb-6 leading-relaxed">
                                You have mastered all skills. Step into the arena and claim your certification.
                            </p>
                            <Link href={canLevelUp ? "/dashboard/learning-path/final/assessment" : "#"}>
                                <Button disabled={!canLevelUp} className={`rounded-xl px-8 py-6 text-xs font-bold uppercase tracking-widest shadow-xl transition-all ${canLevelUp ? (envMode === "IELTS" ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white') : 'bg-white/10 text-white/50 border border-white/20'}`}>
                                    {canLevelUp ? "START MOCK EXAM" : "UNAVAILABLE"}
                                </Button>
                            </Link>
                        </div>

                        {!canLevelUp && (
                           <div className="absolute top-6 right-6 z-30">
                              <div className="p-3 rounded-full bg-black/40 backdrop-blur-md">
                                 <Lock className="text-white/70" size={20} />
                              </div>
                           </div>
                        )}
                     </div>
                 </div>

              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}