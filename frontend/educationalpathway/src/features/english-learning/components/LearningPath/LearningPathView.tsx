
"use client";

import { useState, useEffect, useRef } from "react";
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
  pdfs: any[]; 
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
        let practiceScore = practiceRatio * 0.4;
        let missionProgress = videoScore + practiceScore;
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
                    <circle className="text-slate-100 dark:text-zinc-800 stroke-current" strokeWidth="4" cx="26" cy="26" r="22" fill="transparent" />
                    <circle 
                        className="stroke-current transition-all duration-1000" 
                        style={{ color, strokeDasharray: circumference, strokeDashoffset }}
                        strokeWidth="4" 
                        strokeLinecap="round" cx="26" cy="26" r="22" fill="transparent" 
                    />
                </svg>
                <div className="flex flex-col items-center mt-0.5">
                    <span className="text-[10px] font-bold leading-none">{currentVal}</span>
                    <span className="text-[5px] font-medium text-muted-foreground uppercase tracking-widest">{maxLabel}</span>
                </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
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
    return { text: "Keep progressing to master this skill.", title: "Learning Insights" };
};

function PathfinderTip({ level, tab }: { level: string, tab: string }) {
    const tip = getPathfinderTip(level, tab);
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div 
          onClick={() => setExpanded(!expanded)}
          className={`cursor-pointer max-w-2xl mx-auto rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all ${expanded ? 'p-6' : 'p-4'} mb-12`}
        >
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-primary/10 text-primary">
                       <Sparkles size={16} />
                   </div>
                   <div className="flex flex-col items-start">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Strategic Tip</span>
                       {!expanded && (
                           <span className="text-xs font-semibold text-foreground/80">{tip.title}</span>
                       )}
                   </div>
               </div>
               <ChevronRight size={14} className={`text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </div>
            {expanded && (
                <div className="mt-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
  
  const [isRecording, setIsRecording] = useState<Record<number, boolean>>({});
  const [recordingSeconds, setRecordingSeconds] = useState<Record<number, number>>({});
  const [evaluationResults, setEvaluationResults] = useState<Record<number, any>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervals = useRef<Record<number, NodeJS.Timeout>>({});
  
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [showUnitTest, setShowUnitTest] = useState(false);
  const [generatingMission, setGeneratingMission] = useState(false);
  const [unitTestContent, setUnitTestContent] = useState<any>(null);
  const [unitTestResults, setUnitTestResults] = useState<any>(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [loadingUnitTestIndex, setLoadingUnitTestIndex] = useState<number | null>(null);
  const [envMode, setEnvMode] = useState<"IELTS" | "TOEFL">("IELTS");
  const [pathView, setPathView] = useState<"path" | "assessment" | "result">("path");
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [selectedAssessmentResult, setSelectedAssessmentResult] = useState<any>(null);

  const theme = {
    primary: envMode === "IELTS" ? "emerald" : "blue",
    text: envMode === "IELTS" ? "text-emerald-600" : "text-blue-600",
    gradient: envMode === "IELTS" ? "from-emerald-600 to-teal-500" : "from-blue-600 to-indigo-500",
    accent: envMode === "IELTS" ? "text-emerald-500" : "text-blue-500",
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await getLearningPath();
      const pathData = res?.skills ? res : (res?.data?.skills ? res.data : null);
      if (pathData) {
        setData(pathData);
        const initialExplanations: Record<string, Record<number, boolean>> = {};
        const initialAnswers: Record<string, Record<number, string>> = {};

        Object.keys(pathData.skills).forEach((skill) => {
          initialExplanations[skill] = {};
          initialAnswers[skill] = {};
          const modeData = pathData.learningMode?.[skill];
          const questions = Array.isArray(modeData) ? modeData : modeData?.questions || [];
          questions.forEach((q: any, i: number) => {
            if (q.isCompleted) {
              initialExplanations[skill][i] = true;
              const pastAnswer = q.user_answer || q.userAnswer || q.answer_text;
              if (pastAnswer) initialAnswers[skill][i] = pastAnswer;
            }
          });
        });

        setPracticeAnswers(prev => ({ ...prev, ...initialAnswers }));
        setShowExplanation(prev => ({ ...prev, ...initialExplanations }));
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
      if (video) video.isCompleted = !video.isCompleted;
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
      if (!data) return;
      const skillNames = Object.keys(data.skills);
      const nextIdx = skillNames.indexOf(section) + 1;
      if (nextIdx < skillNames.length) {
        setActiveTab(skillNames[nextIdx]);
        toast.success(`Module ${section} complete! Moving to ${skillNames[nextIdx]}.`);
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
      for (const skill of completedSkills) await completeSection(skill);
      const completedFlags = completedSkills.reduce((acc, skill) => ({ ...acc, [skill]: true }), {} as Record<string, boolean>);
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
    setTimeout(() => {
       const el = document.getElementById("curriculum-modules-section");
       if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleTakeUnitTest = async (mIndex: number) => {
    try {
       setLoadingUnitTestIndex(mIndex);
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
       setLoadingUnitTestIndex(null);
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
       if (res?.data?.passed || res?.passed) await load();
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
        <p className="text-muted-foreground text-xs uppercase tracking-widest">Loading Learning Path...</p>
      </div>
    );
  }

  if (error === "Not found") {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-8">
         <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Compass className="h-8 w-8 text-slate-400" />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-bold">Begin Your Journey</h2>
            <p className="text-muted-foreground text-sm">
               Take the diagnostic assessment to unlock your learning path.
            </p>
         </div>
         <Link href="/dashboard/learning-path/diagnostic/assessment">
            <Button className="rounded-2xl px-8">START ASSESSMENT</Button>
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
  const currentExamType = normalizeExamType(data.examType || data.exam_type || data.competencyGapAnalysis?.exam_type || data.competencyGapAnalysis?.examType);

  const modeData = data.learningMode?.[activeTab];
  const pQues = Array.isArray(modeData) ? modeData : ((modeData as any)?.questions || (modeData as any)?.practice_questions || ((modeData as any)?.prompt ? [modeData] : []));
  const listeningScript = (modeData as any)?.script || null;
  const listeningAudio = (modeData as any)?.audio_base64 || null;
  const pTotal = pQues.length;
  const pComp = pQues.filter((q: any, idx: number) => (q.isCompleted || (practiceAnswers[activeTab]?.[idx] && practiceAnswers[activeTab]?.[idx].trim().length > 0))).length;
  const vTotal = currentSkill?.videos?.length || 0;
  const vComp = currentSkill?.videos?.filter(v => v.isCompleted).length || 0;
  const isSectionSaved = completedSections[activeTab] || false;

  if (pathView === "assessment" && activeAssessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <AssessmentTest examData={activeAssessment} onComplete={() => { setActiveAssessment(null); setPathView("path"); load(); }} />
      </div>
    );
  }

  if (pathView === "result" && selectedAssessmentResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <AssessmentResultView testId={selectedAssessmentResult.testId || selectedAssessmentResult.test_id || ""} examType={selectedAssessmentResult.examType} difficulty={selectedAssessmentResult.difficulty} initialData={selectedAssessmentResult.evaluation} onBack={() => { setSelectedAssessmentResult(null); setPathView("path"); }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      {/* HEADER SECTION */}
      <div className="py-8 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
             <EnvironmentSwitcher mode={envMode} onChange={setEnvMode} />
             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${levelConfig[data.proficiencyLevel].bg} ${levelConfig[data.proficiencyLevel].color} border ${levelConfig[data.proficiencyLevel].border}`}>
               Tier: {levelConfig[data.proficiencyLevel].label}
             </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Your Learning Path</h1>
          <p className="text-muted-foreground text-sm max-w-lg">
             Master {envMode} skills through sequenced missions and AI-driven practice.
          </p>
        </div>

        <div className="flex items-center gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm">
           <div className="text-right space-y-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Overall Mastery</p>
              <span className={`text-4xl font-bold ${theme.text}`}>{progress}%</span>
           </div>
           <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
              <Trophy size={24} />
           </div>
        </div>
      </div>

      {(isOutOfSync || syncHint || incompleteSkillStatus.length > 0) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
           <div className="space-y-1">
              <p className="text-sm text-amber-900 font-medium">
                 {syncHint || `You have unsynced local progress (${localProgress}% vs ${progress}%).`}
              </p>
              {incompleteSkillStatus.length > 0 && (
                 <div className="text-[11px] text-amber-900/70">
                    Pending: {incompleteSkillStatus.map(s => s.skill).join(", ")}
                 </div>
              )}
           </div>
           <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSyncAllCompletedSections} disabled={syncingAll || completing}>
                 {syncingAll ? "Syncing..." : "Sync All"}
              </Button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 space-y-8">
           <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm grid grid-cols-2 gap-4">
              {['reading', 'listening', 'writing', 'speaking'].map(s => {
                  const val = calculateSkillProgress(data, s, practiceAnswers);
                  const isIELTS = envMode === "IELTS";
                  const colors: Record<string, string> = isIELTS 
                     ? { reading: '#10B981', listening: '#3B82F6', writing: '#F43F5E', speaking: '#F59E0B' }
                     : { reading: '#3B82F6', listening: '#0EA5E9', writing: '#8B5CF6', speaking: '#D946EF' };
                  return <SkillGauge key={s} label={s} value={val} examType={currentExamType} color={colors[s]} />;
              })}
           </div>

           <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Dimensions</p>
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
                 {Object.keys(data.skills).map((skill) => {
                    const Icon = skillIcons[skill];
                    const active = activeTab === skill;
                    const saved = completedSections[skill];
                    return (
                       <button
                         key={skill}
                         onClick={() => setActiveTab(skill)}
                         className={`flex items-center justify-between p-4 rounded-2xl transition-all border shrink-0 min-w-[140px] lg:w-full ${active ? 'bg-primary text-white border-primary shadow-md' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-muted-foreground hover:bg-slate-50'}`}
                       >
                          <div className="flex items-center gap-3">
                             <Icon size={16} />
                             <span className="font-bold uppercase text-[11px] tracking-wide">{skill}</span>
                          </div>
                          {saved && <CheckCircle2 size={16} />}
                       </button>
                    );
                 })}
              </div>
           </div>
           
           <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-4">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                 <BarChart3 size={16} />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold uppercase tracking-widest">Target</p>
                 <p className="text-[11px] text-muted-foreground leading-relaxed">Complete all 4 skill sections to unlock your final mock exam.</p>
              </div>
           </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3 space-y-12">
           <div className="space-y-12">
              {/* 01 ANALYSIS SECTION */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3 px-2">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Strategic Overview</h2>
                 </div>

                 <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm space-y-8">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <TrendingUp size={14} /> Gap Analysis
                       </div>
                       <h3 className="text-xl font-bold leading-snug">
                          {data.competencyGapAnalysis?.proficiency_profile || "Analyzing your assessment results..."}
                       </h3>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {data.competencyGapAnalysis?.weaknesses?.map((w: string, i: number) => (
                             <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
                                Focus: {w}
                             </span>
                          ))}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 space-y-6">
                       <div className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <BookMarked size={16} /> Strategic Directive
                         </div>
                         <Button
                           size="sm"
                           variant={currentSkill?.isNoteCompleted ? "secondary" : "outline"}
                           onClick={handleToggleNote}
                           className="h-9 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                         >
                           {currentSkill?.isNoteCompleted ? <><CheckCircle2 size={12} className="mr-2" /> Directive Logged</> : "Acknowledge"}
                         </Button>
                       </div>
                       <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {data.competencyGapAnalysis?.section_analysis?.[activeTab] || currentSkill?.notes}
                       </div>
                    </div>
                 </div>
              </section>

              {/* 02 MISSIONS SECTION */}
              <section className="space-y-8">
                 <div className="flex items-center gap-3 px-2">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Skill Missions</h2>
                 </div>

                 <PathfinderTip level={data.proficiencyLevel} tab={activeTab} />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentSkill.missions?.map((m: any, i: number) => {
                       const isLocked = i > 0 && !currentSkill.missions[i - 1].isCompleted;
                       const isActive = activeMission === i && !isLocked;
                       const isDone = m.isCompleted;
                       return (
                          <div key={i} className={`p-6 rounded-2xl border transition-all ${isLocked ? 'bg-slate-50/50 opacity-50' : isActive ? 'bg-white border-primary shadow-md' : 'bg-white hover:border-slate-300'} relative`}>
                             <div className="flex items-start justify-between mb-4">
                                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isLocked ? 'bg-slate-100 text-slate-400' : isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                   {isLocked ? <Lock size={18} /> : isDone ? <CheckCircle2 size={20} /> : <Target size={20} />}
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Mission {i + 1}</span>
                             </div>
                             <h4 className="font-bold text-lg mb-2">{m.title}</h4>
                             <p className="text-xs text-muted-foreground mb-6 line-clamp-2">{m.objective}</p>
                             <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleStartMission(i)} disabled={isLocked} className="flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-widest h-10">
                                   {isDone ? 'Review' : 'Start'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleTakeUnitTest(i)} 
                                  disabled={isLocked || m.isUnitTestCompleted || isSubmittingTest} 
                                  className="flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-widest h-10"
                                >
                                   {m.isUnitTestCompleted ? 'Verified' : loadingUnitTestIndex === i ? <Loader2 size={16} className="animate-spin" /> : 'Test'}
                                </Button>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </section>

              {/* 03 CONTENT FEED SECTION */}
              <section className="space-y-12" id="curriculum-modules-section">
                 <div className="flex items-center gap-3 px-2">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Instructional Content</h2>
                 </div>

                 {/* Video Modules */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <h4 className="font-bold text-sm tracking-wide">Video Lessons</h4>
                       <span className="text-[10px] font-bold text-primary">{vComp} / {vTotal} COMPLETED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {currentSkill?.videos?.map((v, i) => (
                         <div key={v.id} className={`p-6 rounded-2xl border bg-white dark:bg-zinc-900 transition-all ${v.isCompleted ? 'border-emerald-200 bg-emerald-50/20' : ''}`}>
                            <div className="flex items-start gap-4 mb-4">
                               <div className="h-20 w-20 rounded-2xl overflow-hidden border bg-slate-100 shrink-0 relative group">
                                  <img src={v.thubnail} className="h-full w-full object-cover" />
                                  {v.videolink && (
                                    <a href={v.videolink} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all text-white">
                                       <PlayCircle size={24} />
                                    </a>
                                  )}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className={`font-bold text-sm mb-1 truncate ${v.isCompleted ? 'text-muted-foreground line-through' : ''}`}>{v.title || `Lesson ${i + 1}`}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Module {i + 1}</p>
                               </div>
                               <button onClick={() => handleToggleVideo(v.id)} className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${v.isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300 hover:text-primary'}`}>
                                  {v.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Practice Questions */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <h4 className="font-bold text-sm tracking-wide">Application Matrix</h4>
                       <span className="text-[10px] font-bold text-primary">{pComp} / {pTotal} RESOLVED</span>
                    </div>

                    <div className="space-y-6">
                       {pQues.length > 0 ? pQues.map((q: any, idx: number) => {
                         const scoreMeta = activeTab === 'speaking' && evaluationResults[idx] ? getSpeakingScoreMeta(evaluationResults[idx], currentExamType) : null;
                         return (
                           <div key={idx} className="p-8 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm space-y-8">
                              <div className="flex items-start gap-4">
                                 <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">0{idx + 1}</div>
                                 <h5 className="text-lg font-bold leading-tight">"{String(q.question || q.prompt)}"</h5>
                              </div>

                              {activeTab === 'listening' && listeningScript && (
                                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed">
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Transcript</p>
                                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">{listeningScript}</p>
                                </div>
                              )}

                              {(q.audio_base64 || listeningAudio) && (
                                <div className="p-4 bg-slate-50 rounded-2xl border max-w-xl">
                                   <audio controls className="w-full h-8" src={`data:audio/mp3;base64,${q.audio_base64 || listeningAudio}`} />
                                </div>
                              )}

                              {(q.options || q.choices) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                                   {(q.options || q.choices).map((opt: string) => {
                                     const rev = showExplanation[activeTab]?.[idx];
                                     const correct = isCorrectOption(q.answer || q.correct_answer || q.correctAnswer, opt, q.options || q.choices);
                                     const selected = practiceAnswers[activeTab]?.[idx] === opt;
                                     return (
                                        <button key={opt} disabled={rev} onClick={() => handleSelectAnswer(activeTab, idx, opt)}
                                                className={`text-left p-4 rounded-2xl text-sm font-medium transition-all border ${rev ? correct ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : selected ? 'bg-red-50 border-red-300 text-red-700' : 'bg-slate-50 border-transparent opacity-50' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                                           {opt}
                                        </button>
                                     );
                                   })}
                                </div>
                              ) : activeTab === 'speaking' ? (
                                <div className="space-y-6 max-w-2xl">
                                   {scoreMeta ? (
                                     <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                                           <div className="flex items-center justify-between mb-2">
                                              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Result: {scoreMeta.label} {scoreMeta.displayScore}</p>
                                              <span className="text-[9px] font-bold text-emerald-700/60">{scoreMeta.examType}</span>
                                           </div>
                                           <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                                              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${scoreMeta.percent}%` }} />
                                           </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['pronunciation', 'fluency', 'coherence'].map(key => (
                                                <div key={key} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                     <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{key}</p>
                                                     <p className="text-[10px] leading-tight text-slate-600 line-clamp-2">{(evaluationResults[idx] as any)[key] || "Feedback pending"}</p>
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                   ) : (
                                     <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-slate-50 border border-dashed text-center">
                                       {isRecording[idx] ? (
                                         <>
                                           <div className="flex items-center gap-4">
                                              <div className="size-2 bg-destructive rounded-full animate-pulse" />
                                              <span className="text-xl font-mono font-bold text-destructive">{Math.floor((recordingSeconds[idx] || 0) / 60)}:{(recordingSeconds[idx] || 0) % 60 < 10 ? '0' : ''}{(recordingSeconds[idx] || 0) % 60}</span>
                                           </div>
                                           <Button size="sm" onClick={() => stopRecording(idx)} variant="destructive" className="rounded-2xl px-6">
                                              Stop & Evaluate
                                           </Button>
                                         </>
                                       ) : (
                                         <>
                                           <p className="text-sm font-bold">Ready to Practice?</p>
                                           <p className="text-[11px] text-muted-foreground mb-2">Record your response for immediate AI scoring.</p>
                                           <Button size="sm" disabled={evaluating[idx]} onClick={() => startRecording(idx)} className="rounded-2xl px-8">
                                              {evaluating[idx] ? <><Loader2 size={14} className="mr-2 animate-spin" /> Evaluating...</> : <><Mic size={14} className="mr-2" /> Start Recording</>}
                                           </Button>
                                         </>
                                       )}
                                     </div>
                                   )}
                                </div>
                              ) : (
                                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border rounded-2xl space-y-4">
                                   <textarea 
                                      className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none min-h-[120px] resize-none"
                                      placeholder="Type your response here..." 
                                      value={practiceAnswers[activeTab]?.[idx] ?? (q.isCompleted ? "(Answer locked and saved.)" : "")}
                                      disabled={showExplanation[activeTab]?.[idx]}
                                      onChange={(e) => handleTextareaChange(activeTab, idx, e.target.value)} 
                                   />
                                   {!showExplanation[activeTab]?.[idx] ? (
                                      <div className="flex justify-end pt-2 border-t">
                                         <Button 
                                            size="sm"
                                            onClick={() => handleSubmitTextAnswer(activeTab, idx)}
                                            disabled={!practiceAnswers[activeTab]?.[idx]?.trim()}
                                            className="rounded-2xl px-6"
                                         >
                                            Submit Answer
                                         </Button>
                                      </div>
                                   ) : (
                                      <div className="flex justify-end pt-2 border-t text-[11px] font-bold text-emerald-600">
                                         <CheckCircle2 size={14} className="mr-2" /> Answer Saved
                                      </div>
                                   )}
                                </div>
                              )}

                              {showExplanation[activeTab]?.[idx] && (
                                <div className="p-6 bg-slate-50 border-l-4 border-slate-400 rounded-r-xl">
                                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">AI Explanation</p>
                                   <p className="text-sm text-slate-600 leading-relaxed italic">
                                      "{String(q.explanation || q.tips || q.sample_answer || q.sample_response)}"
                                   </p>
                                </div>
                              )}
                           </div>
                         );
                       }) : (
                         <div className="py-16 text-center bg-slate-50/50 border border-dashed rounded-2xl opacity-40">
                            <Lock size={24} className="mx-auto mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Protocol Sync Pending</p>
                         </div>
                       )}
                    </div>
                 </div>
              </section>

              {/* SAVE PROGRESS BUTTON */}
              <div className="flex flex-col items-center gap-6 pt-12">
                 {isSectionSaved ? (
                   <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3 px-8 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                         <CheckCircle2 size={20} className="text-emerald-500" />
                         <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">{activeTab} Mastery Logged</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                           try {
                              const res = await getAssessmentProgress(envMode);
                              const items = Array.isArray(res) ? res : res?.data || [];
                              const latest = items.filter((i: any) => i.examType === envMode && i.evaluation?.score_breakdown?.[activeTab]).reverse()[0];
                              if (latest) { setSelectedAssessmentResult(latest); setPathView("result"); }
                              else toast.error("No result found.");
                           } catch (err) { toast.error("Failed to load."); }
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
                      >
                         <History size={12} className="mr-2" /> View Results
                      </Button>
                   </div>
                 ) : (
                   <Button
                     onClick={() => handleCompleteSection(activeTab)}
                     disabled={completing}
                     className="px-12 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs"
                   >
                     {completing ? "Saving..." : `Save ${activeTab} Progress`}
                   </Button>
                 )}
              </div>

              {/* FINAL ASSESSMENT CARD */}
              <div className={`mt-24 p-10 rounded-2xl border transition-all ${canLevelUp ? 'bg-primary text-white border-primary shadow-xl' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 opacity-60'}`}>
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${canLevelUp ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {canLevelUp ? <Unlock size={12} /> : <Lock size={12} />} Final Mock Exam
                       </div>
                       <h3 className="text-3xl font-bold tracking-tight uppercase">Ready for Graduation?</h3>
                       <p className={`text-sm max-w-xl leading-relaxed ${canLevelUp ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {canLevelUp 
                            ? "You have completed the full curriculum for this tier. Take the final mock exam to validate your band score and graduate to the next level." 
                            : "Complete all skill missions and instructional logs to unlock your final comprehensive assessment."}
                       </p>
                    </div>
                    <Link href={canLevelUp ? "/dashboard/learning-path/final/assessment" : "#"}>
                       <Button 
                         disabled={!canLevelUp} 
                         variant={canLevelUp ? "secondary" : "outline"}
                         className="rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-xs"
                       >
                          {canLevelUp ? "START FINAL TEST" : "LOCKED"}
                       </Button>
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {activeMission !== null && (
         <UnitTestOverlay 
            show={showUnitTest} 
            onClose={() => setShowUnitTest(false)}
            unitTestContent={unitTestContent}
            setUnitTestContent={setUnitTestContent}
            unitTestResults={unitTestResults}
            onSubmit={handleSubmitUnitTest}
            isSubmitting={isSubmittingTest}
            activeTab={activeTab}
         />
      )}
    </div>
  );
}