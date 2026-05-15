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
  Unlock,
  Zap,
  Activity,
  Shield,
  Layout,
  Star,
  Brain,
  ChevronDown,
  Layers,
  Globe
} from "lucide-react";
import Link from "next/link";
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
import { SystemArchitectureOverlay } from "./SystemArchitectureOverlay";
import { AssessmentTest } from "@/features/assessments/components/AssessmentTest";
import { AssessmentResultView } from "@/features/assessments/components/AssessmentResultView";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  pdfs: any[];
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
  easy: { label: "Foundation", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  medium: { label: "Intermediate", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  hard: { label: "Advanced", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
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
   return false;
};

const getSkillQuestions = (learningMode: LearningPathData["learningMode"], skill: string) => {
    const modeData = learningMode?.[skill];
    return Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
};

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&enablejsapi=1&modestbranding=1`;
  }
  return url;
};

function SkillGauge({ label, value, color, active }: { label: string, value: number, color: string, active?: boolean }) {
    const circumference = 2 * Math.PI * 22;
    const strokeDashoffset = circumference - (value * circumference);

    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${active ? 'bg-muted/50 border border-border/50 shadow-sm' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}>
            <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 52 52">
                    <circle className="text-muted/20 stroke-current" strokeWidth="3" cx="26" cy="26" r="22" fill="transparent" />
                    <circle 
                        className="stroke-current transition-all duration-1000 ease-out" 
                        style={{ color, strokeDasharray: circumference, strokeDashoffset }}
                        strokeWidth="3" 
                        strokeLinecap="round" cx="26" cy="26" r="22" fill="transparent" 
                    />
                </svg>
                <span className="text-[10px] font-black text-foreground">{Math.round(value * 100)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{label}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{active ? 'Active Sector' : 'Standby'}</span>
            </div>
        </div>
    );
}

function IntelligenceInsight({ title, text }: { title: string, text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-muted/50 dark:bg-muted/30 border border-border/50 rounded-[32px] overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Strategic Directive</span>
            <h4 className="text-sm font-black uppercase tracking-tighter text-foreground">{title}</h4>
          </div>
        </div>
        <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-10 pb-8 overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
              "{text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LearningPathView() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("reading");
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, Record<number, string>>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, Record<number, boolean>>>({});
  
  const [evaluationResults, setEvaluationResults] = useState<Record<number, any>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [showUnitTest, setShowUnitTest] = useState(false);
  const [unitTestContent, setUnitTestContent] = useState<any>(null);
  const [unitTestResults, setUnitTestResults] = useState<any>(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [loadingUnitTestIndex, setLoadingUnitTestIndex] = useState<number | null>(null);
  const [envMode, setEnvMode] = useState<"IELTS" | "TOEFL">("IELTS");
  const [hasDiagnostic, setHasDiagnostic] = useState<{ IELTS: boolean, TOEFL: boolean }>({ IELTS: false, TOEFL: false });
  const [showArchModal, setShowArchModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeMissionTab, setActiveMissionTab] = useState<Record<number, 'videos' | 'pdfs' | 'practice'>>({});

  useEffect(() => {
    async function discoverEnvironment() {
      try {
        const [ieltsProg, toeflProg] = await Promise.all([
          getAssessmentProgress("IELTS"),
          getAssessmentProgress("TOEFL")
        ]);
        
        const ieltsOk = ieltsProg?.data?.length > 0;
        const toeflOk = toeflProg?.data?.length > 0;
        
        setHasDiagnostic({ IELTS: ieltsOk, TOEFL: toeflOk });

        if (!ieltsOk && toeflOk) {
          setEnvMode("TOEFL");
        }
      } catch (e) {
        console.error("Discovery failed", e);
      }
    }
    discoverEnvironment();
  }, []);

  const load = async (mode: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLearningPath(mode);
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
        setData(null);
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? "Not found" : "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (envMode) {
      load(envMode); 
    }
  }, [envMode]);

  const handleToggleVideo = async (videoId: number, mIndex: number) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const video = newData.skills[activeTab].videos.find((v: any) => v.id === videoId);
      if (video) video.isCompleted = true;
      const mVideo = newData.skills[activeTab].missions[mIndex]?.videos.find((v: any) => v.id === videoId);
      if (mVideo) mVideo.isCompleted = true;
      return newData;
    });
    try {
      await trackProgress({ videoId, section: activeTab, isCompleted: true, examType: envMode });
    } catch (error) {}
  };

  const handleTogglePdf = async (pdfId: number, mIndex: number) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const pdf = newData.skills[activeTab].pdfs?.find((p: any) => p.id === pdfId);
      if (pdf) pdf.isCompleted = true;
      const mPdf = newData.skills[activeTab].missions[mIndex]?.pdfs.find((p: any) => p.id === pdfId);
      if (mPdf) mPdf.isCompleted = true;
      return newData;
    });
    try {
      await trackProgress({ pdfId: pdfId, section: activeTab, isCompleted: true, examType: envMode });
    } catch (error) {}
  };

  const handleStartMission = (mIndex: number) => {
    setActiveMission(activeMission === mIndex ? null : mIndex);
  };

  const handleToggleNote = async () => {
    if (!data) return;
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      newData.skills[activeTab].isNoteCompleted = !newData.skills[activeTab].isNoteCompleted;
      return newData;
    });
    try {
      await trackProgress({ section: activeTab, isNote: true, isCompleted: !data.skills[activeTab].isNoteCompleted, examType: envMode });
    } catch (error) {}
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
      await trackProgress({ questionIndex: qIndex, section: skill, isCompleted: true, answer: answer, examType: envMode });
    } catch (error) {}
  };

  const handleEvaluateSpeaking = async (qIndex: number, blob: Blob) => {
    try {
      setEvaluating(prev => ({ ...prev, [qIndex]: true }));
      const result = await evaluateSpeakingPractice(qIndex, blob, envMode);
      const normalizedResult = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
      if (normalizedResult) {
        setEvaluationResults(prev => ({ ...prev, [qIndex]: normalizedResult }));
        setShowExplanation(prev => ({ ...prev, [activeTab]: { ...(prev[activeTab] || {}), [qIndex]: true } }));
        setData(prev => {
          if (!prev) return prev;
          const newData = JSON.parse(JSON.stringify(prev));
          const modeData = newData?.learningMode?.[activeTab];
          const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
          if (questions[qIndex]) questions[qIndex].isCompleted = true;
          return newData;
        });
      }
    } catch (err) {} finally {
      setEvaluating(prev => ({ ...prev, [qIndex]: false }));
    }
  };

  const handleTakeUnitTest = async (mIndex: number) => {
    try {
       setLoadingUnitTestIndex(mIndex);
       setIsSubmittingTest(true);
       const res = await generateUnitTest({ skill: activeTab, level: data?.proficiencyLevel || 'easy', examType: envMode });
       setUnitTestContent(res?.data || res);
       setActiveMission(mIndex);
       setShowUnitTest(true);
       setUnitTestResults(null);
    } catch (err) {} finally {
       setIsSubmittingTest(false);
       setLoadingUnitTestIndex(null);
    }
  };

  const handleSubmitUnitTest = async (responses: any[]) => {
    if (activeMission === null) return;
    try {
       setIsSubmittingTest(true);
       const res = await submitUnitTest({ skill: activeTab, responses, missionIndex: activeMission, examType: envMode });
       setUnitTestResults(res?.data || res);
       if (res?.data?.passed || res?.passed) await load(envMode);
    } catch (err) {} finally {
       setIsSubmittingTest(false);
    }
  };

  const handleCompleteSection = async (section: string) => {
    try {
      setCompleting(true);
      await completeSection(section, envMode);
      setCompletedSections(prev => ({ ...prev, [section]: true }));
      await load(envMode); 
      toast.success(`${section.toUpperCase()} phase synchronized.`);
    } catch (err) {} finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary/20" strokeWidth={1} />
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">Calibrating Neural Path...</p>
      </div>
    );
  }

  if (error === "Not found" || !data) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-10 px-6">
         <div className="mx-auto size-24 bg-muted rounded-[32px] flex items-center justify-center border border-border/50 shadow-xl">
            <Compass className="h-10 w-10 text-muted-foreground" />
         </div>
         <div className="space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">
              {hasDiagnostic[envMode] ? "Synchronizing Journey" : "Journey Locked"}
            </h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
               {hasDiagnostic[envMode] 
                 ? "We found your assessment data. The AI is calibrating your path. Please wait a moment and refresh."
                 : "Execute the diagnostic assessment protocol to unlock your personalized learning matrix."}
            </p>
         </div>
         {hasDiagnostic[envMode] ? (
            <Button 
              onClick={() => load(envMode)}
              className="h-16 px-12 rounded-2xl bg-muted border border-border/50 text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-muted/80 transition-all"
            >
              Refresh Status
            </Button>
         ) : (
           <Link href="/dashboard/learning-path/diagnostic/assessment">
              <Button className="h-16 px-12 rounded-2xl primary-gradient text-foreground font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl">
                Initialize Diagnostic
              </Button>
           </Link>
         )}
      </div>
    );
  }

  const currentSkill = data.skills[activeTab];
  const progress = data.current_progress_percentage || 0;
  const canLevelUp = progress >= 100;
  const modeData = data.learningMode?.[activeTab];
  const pQues = Array.isArray(modeData) ? modeData : (modeData?.questions || (modeData?.prompt ? [modeData] : []));
  const pComp = pQues.filter((q: any, idx: number) => (q.isCompleted || (practiceAnswers[activeTab]?.[idx] && practiceAnswers[activeTab]?.[idx].trim().length > 0))).length;
  const vTotal = currentSkill?.videos?.length || 0;
  const vComp = currentSkill?.videos?.filter(v => v.isCompleted).length || 0;

  const theme = {
    primary: envMode === "IELTS" ? "emerald" : "blue",
    text: envMode === "IELTS" ? "text-emerald-500" : "text-blue-500",
    bg: envMode === "IELTS" ? "bg-emerald-500/10" : "bg-blue-600/10",
    border: envMode === "IELTS" ? "border-emerald-500/20" : "border-blue-600/20",
    glow: envMode === "IELTS" ? "bg-emerald-500/5" : "bg-blue-600/5",
    gradient: envMode === "IELTS" ? "from-emerald-500 to-teal-500" : "from-blue-600 to-indigo-600",
    button: envMode === "IELTS" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500",
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary transition-colors duration-500 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={envMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${theme.glow} blur-[120px] rounded-full dark:opacity-100 opacity-50`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${theme.glow} blur-[150px] rounded-full dark:opacity-100 opacity-50`} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 py-12 lg:py-20 flex flex-col lg:flex-row gap-16">
        
        <aside className="lg:w-[320px] shrink-0 space-y-16">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl ${theme.bg} border ${theme.border} flex items-center justify-center ${theme.text}`}>
                  <Brain size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-widest">Pathfinder</h1>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{envMode} Intelligence</p>
                </div>
              </div>
              <button 
                onClick={() => setShowArchModal(true)}
                className="p-3 bg-muted hover:bg-muted/80 border border-border/50 rounded-xl transition-all text-muted-foreground hover:text-foreground shadow-sm"
                title="View System Architecture"
              >
                <Info size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <EnvironmentSwitcher mode={envMode} onChange={setEnvMode} />
              <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-block ${levelConfig[data.proficiencyLevel].bg} ${levelConfig[data.proficiencyLevel].color} border-border/40`}>
                Tier: {levelConfig[data.proficiencyLevel].label}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-2">Skill Domains</p>
              <div className="flex flex-col gap-1">
                {Object.keys(data.skills).map((skill) => {
                  const colors: Record<string, string> = { 
                    reading: envMode === "IELTS" ? '#10B981' : '#2563EB', 
                    listening: envMode === "IELTS" ? '#10B981' : '#2563EB', 
                    writing: envMode === "IELTS" ? '#10B981' : '#2563EB', 
                    speaking: envMode === "IELTS" ? '#10B981' : '#2563EB' 
                  };
                  
                  const skillData = data.skills[skill];
                  const vP = skillData?.videos?.length ? skillData.videos.filter(v => v.isCompleted).length / skillData.videos.length : 0;
                  const lP = getSkillQuestions(data.learningMode, skill).filter((q: any) => q.isCompleted).length / Math.max(1, getSkillQuestions(data.learningMode, skill).length);
                  const totalP = (vP * 0.5) + (lP * 0.5);

                  return (
                    <button 
                      key={skill}
                      onClick={() => setActiveTab(skill)}
                      className="w-full text-left"
                    >
                      <SkillGauge label={skill} value={totalP} color={colors[skill]} active={activeTab === skill} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-card border border-border/50 backdrop-blur-xl space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Path Progress</span>
                <span className={`text-2xl font-black ${theme.text}`}>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full bg-linear-to-r ${theme.gradient}`}
                />
              </div>
              <div className={`flex items-center gap-2 text-[9px] font-bold ${theme.text} uppercase tracking-widest`}>
                <TrendingUp size={12} />
                Focusing on {envMode} Mastery
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-20">
          
          <section className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className={`${theme.text} size-3 fill-current`} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Active Module Optimization</span>
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-none">
                {activeTab} <span className="text-muted-foreground/20 dark:text-zinc-800 ml-2 md:ml-4">Mastery</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-10">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground">
                  <Activity size={24} strokeWidth={1} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{envMode} Curriculum</p>
                  <p className="text-sm font-bold text-foreground uppercase tracking-tighter">Verified Protocol</p>
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground">
                  <Target size={24} strokeWidth={1} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Milestones</p>
                  <p className="text-sm font-bold text-foreground uppercase tracking-tighter">{vComp + pComp} / {vTotal + pQues.length} Resolved</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <IntelligenceInsight 
              title="Tactical Overview" 
              text={data.competencyGapAnalysis?.section_analysis?.[activeTab] || currentSkill?.notes || "Analyzing data stream for strategic insights..."} 
            />
            {currentSkill?.missions?.[0]?.objective && (
              <IntelligenceInsight 
                title="Current Objective" 
                text={currentSkill.missions[0].objective} 
              />
            )}
          </section>

          <section className="space-y-12">
            <div className="flex items-center gap-3">
              <Compass size={18} className="text-muted-foreground" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Mission Pipeline</h3>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <Globe className={envMode === 'IELTS' ? 'text-emerald-500' : 'text-blue-500'} size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Environment</p>
                <p className={`text-sm font-bold uppercase tracking-tighter ${envMode === 'IELTS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {envMode} Specialization Active
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-8 mt-6">
              <div className="absolute left-10 top-0 bottom-0 w-px bg-border/40 hidden md:block" />

              {currentSkill.missions?.map((m: any, i: number) => {
                const isLocked = i > 0 && !currentSkill.missions[i - 1].isCompleted;
                const isActive = activeMission === i && !isLocked;
                const isDone = m.isCompleted;
                
                return (
                  <motion.div 
                    key={i}
                    layout
                    className={`flex flex-col gap-4 p-4 rounded-[40px] transition-all duration-700 ${isActive ? 'bg-muted/30 border border-border/40 shadow-sm' : 'border border-transparent'}`}
                  >
                    <div className="flex items-start gap-8">
                      <div className={`size-20 rounded-full shrink-0 flex items-center justify-center relative z-10 border transition-all duration-700 ${isDone ? 'bg-emerald-500 border-emerald-400 text-foreground shadow-xl shadow-emerald-500/20' : isActive ? 'bg-foreground border-foreground text-background shadow-xl' : 'bg-muted border-border text-muted-foreground'}`}>
                        {isLocked ? <Lock size={24} /> : isDone ? <CheckCircle2 size={28} /> : <span className="text-lg font-black">{i + 1}</span>}
                      </div>
                      
                      <div className="flex-1 pt-4 space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-500' : 'text-muted-foreground'}`}>{isDone ? 'Mission Resolved' : isLocked ? 'Mission Locked' : 'Protocol Active'}</span>
                            <div className="h-px flex-1 bg-border/20" />
                          </div>
                          <h4 className="text-3xl font-black text-foreground uppercase tracking-tighter">{m.title}</h4>
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">{m.objective}</p>
                          
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {(() => {
                              const vDone = m.videos?.filter((v: any) => v.isCompleted).length || 0;
                              const vTotal = m.videos?.length || 0;
                              const pDone = m.pdfs?.filter((p: any) => p.isCompleted).length || 0;
                              const pTotal = m.pdfs?.length || 0;
                              const isQuizDone = m.isUnitTestCompleted;
                              
                              return (
                                <>
                                  <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition-all ${vDone === vTotal && vTotal > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-muted/50 border-border/50 text-muted-foreground'}`}>
                                    {vDone === vTotal && vTotal > 0 ? <CheckCircle2 size={12} /> : <PlayCircle size={12} />}
                                    Videos {vDone}/{vTotal}
                                  </div>
                                  <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition-all ${pDone === pTotal && pTotal > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-muted/50 border-border/50 text-muted-foreground'}`}>
                                    {pDone === pTotal && pTotal > 0 ? <CheckCircle2 size={12} /> : <BookOpen size={12} />}
                                    Resources {pDone}/{pTotal}
                                  </div>
                                  <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition-all ${isQuizDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-muted/50 border-border/50 text-muted-foreground'}`}>
                                    {isQuizDone ? <CheckCircle2 size={12} /> : <Zap size={12} />}
                                    Quiz {isQuizDone ? '1/1' : '0/1'}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Button 
                            onClick={() => handleStartMission(i)}
                            disabled={isLocked}
                            className={`h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${isDone ? 'bg-muted text-muted-foreground' : isActive ? 'bg-foreground text-background' : 'bg-muted border border-border text-foreground hover:bg-muted/80'}`}
                          >
                            {isActive ? 'Collapse Mission' : isDone ? 'Revisit' : 'Execute Mission'}
                          </Button>
                          {!isLocked && (
                            <Button 
                              onClick={() => handleTakeUnitTest(i)}
                              disabled={m.isUnitTestCompleted || isSubmittingTest || (!m.videos?.every((v:any) => v.isCompleted) || !m.pdfs?.every((p:any) => p.isCompleted))}
                              className={`h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all ${m.isUnitTestCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : (!m.videos?.every((v:any) => v.isCompleted) || !m.pdfs?.every((p:any) => p.isCompleted)) ? 'bg-muted/50 border-border/20 text-muted-foreground/30 cursor-not-allowed' : 'bg-background border-border text-muted-foreground hover:border-border/80'}`}
                            >
                              {m.isUnitTestCompleted ? 'Test Verified' : loadingUnitTestIndex === i ? <Loader2 size={16} className="animate-spin" /> : (!m.videos?.every((v:any) => v.isCompleted) || !m.pdfs?.every((p:any) => p.isCompleted)) ? <><Lock size={12} className="mr-2 inline" /> Unit Test</> : 'Unit Test'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pt-8 px-4 md:px-8 space-y-8"
                        >
                          <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-2xl w-fit border border-border/30">
                            {[
                              { id: 'videos', icon: PlayCircle, label: 'Intelligence' },
                              { id: 'pdfs', icon: BookOpen, label: 'Resources' },
                              { id: 'practice', icon: Zap, label: 'Practice' }
                            ].map((tab) => {
                              const areVideosDone = m.videos?.every((v: any) => v.isCompleted) || false;
                              const arePdfsDone = m.pdfs?.length > 0 ? m.pdfs.every((p: any) => p.isCompleted) : true;
                              const isTabLocked = (tab.id === 'practice' && (!areVideosDone || !arePdfsDone));

                              return (
                                <button
                                  key={tab.id}
                                  disabled={isTabLocked}
                                  onClick={() => setActiveMissionTab(prev => ({ ...prev, [i]: tab.id as any }))}
                                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                    (activeMissionTab[i] || 'videos') === tab.id 
                                      ? 'bg-foreground text-background shadow-lg' 
                                      : isTabLocked 
                                        ? 'text-muted-foreground/30 cursor-not-allowed opacity-50' 
                                        : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  {isTabLocked ? <Lock size={12} /> : <tab.icon size={12} />}
                                  {tab.label}
                                </button>
                              );
                            })}
                          </div>

              <div className="h-px w-full bg-border/20" />
                          
                          <div className="pb-10">
                            {(activeMissionTab[i] || 'videos') === 'videos' && (
                              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                  {m.videos?.map((v: any) => (
                                    <div key={v.id} className="group relative bg-card/40 border border-border/40 rounded-[40px] p-8 flex flex-col gap-6 hover:shadow-2xl transition-all duration-500 hover:border-primary/30">
                                      <div className="aspect-video rounded-[32px] overflow-hidden bg-background relative shadow-2xl border border-white/5">
                                        {v.videolink?.includes('youtube.com') || v.videolink?.includes('youtu.be') ? (
                                          <iframe 
                                            src={getYoutubeEmbedUrl(v.videolink)} 
                                            className="size-full"
                                            loading="lazy"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        ) : (
                                          <video 
                                            src={v.videolink} 
                                            controls 
                                            className="size-full"
                                            poster={v.thubnail}
                                          />
                                        )}
                                      </div>
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${envMode === 'IELTS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                              {v.examType || envMode} Protocol
                                            </span>
                                            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                              {v.duration || '10:00'}
                                            </span>
                                          </div>
                                          <button 
                                            onClick={() => handleToggleVideo(v.id, i)}
                                            className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors ${v.isCompleted ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'}`}
                                          >
                                            {v.isCompleted ? <><CheckCircle2 size={12} /> Resolved</> : <><Circle size={12} /> Standby</>}
                                          </button>
                                        </div>
                                        <h5 className="text-lg font-black text-foreground uppercase tracking-tighter line-clamp-1">{v.title || 'Mission Intelligence'}</h5>
                                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed line-clamp-2">
                                          {v.description || 'Analyze the provided intelligence stream to master the current tactical objective.'}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(activeMissionTab[i] || 'videos') === 'pdfs' && (
                              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {(m.pdfs || []).map((p: any) => (
                                    <div key={p.id} className="group relative bg-card border border-border/50 rounded-[32px] p-6 flex items-center gap-6 hover:shadow-lg transition-all hover:border-primary/20">
                                      <div className="size-16 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors shadow-sm">
                                        <BookOpen size={24} strokeWidth={1.5} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${envMode === 'IELTS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                            {p.examType || envMode}
                                          </span>
                                        </div>
                                        <h5 className="text-xs font-black uppercase tracking-tight truncate">{p.title || 'Technical Manual'}</h5>
                                        <div className="flex items-center gap-4 mt-2">
                                          <a 
                                            href={p.pdfLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={() => handleTogglePdf(p.id, i)}
                                            className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                                          >
                                            Open PDF <ExternalLink size={10} />
                                          </a>
                                          {p.isCompleted && (
                                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                              <CheckCircle2 size={10} /> Verified
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {(!m.pdfs || m.pdfs.length === 0) && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground/40 italic font-medium">
                                      <Layers size={40} strokeWidth={1} />
                                      <p className="text-[10px] uppercase tracking-widest">No PDF resources available for this sector</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {(activeMissionTab[i] || 'videos') === 'practice' && (
                              <div className="space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                 <div className="space-y-12 max-w-4xl">
                                    {pQues.map((q: any, idx: number) => (
                                      <div key={idx} className="space-y-6 relative">
                                        <div className="absolute -left-6 top-0 text-7xl font-black text-muted-foreground/10 leading-none select-none pointer-events-none">0{idx + 1}</div>
                                        <div className="flex items-center gap-2 mb-2 relative z-10">
                                          <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${envMode === 'IELTS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                            {envMode} Practice Vector
                                          </span>
                                        </div>
                                        <h5 className="text-2xl font-black text-foreground leading-tight tracking-tighter italic relative z-10">"{q.question || q.prompt}"</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {(q.options || q.choices)?.map((opt: string) => {
                                            const rev = showExplanation[activeTab]?.[idx];
                                            const correct = isCorrectOption(q.answer || q.correct_answer || q.correctAnswer, opt, q.options || q.choices);
                                            const selected = practiceAnswers[activeTab]?.[idx] === opt;
                                            return (
                                              <button 
                                                key={opt}
                                                disabled={rev}
                                                onClick={() => handleSelectAnswer(activeTab, idx, opt)}
                                                className={`group text-left p-6 rounded-2xl text-xs font-bold border transition-all duration-500 ${rev ? (correct ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : selected ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400' : 'opacity-20 border-border/20') : 'bg-muted/30 border-border/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground'}`}
                                              >
                                                <div className="flex items-center gap-4">
                                                  <div className={`size-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black transition-all duration-500 ${rev ? (correct ? 'bg-emerald-500 text-foreground' : selected ? 'bg-red-500 text-foreground' : 'bg-muted-foreground/10 text-muted-foreground opacity-50') : 'bg-muted-foreground/10 group-hover:bg-primary/20 group-hover:text-primary text-muted-foreground'}`}>
                                                    {String.fromCharCode(65 + (q.options || q.choices).indexOf(opt))}
                                                  </div>
                                                  <span>{opt}</span>
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {showExplanation[activeTab]?.[idx] && (
                                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="pt-4 space-y-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Calibration Note</span>
                                            <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">"{q.explanation || q.tips || q.sample_answer}"</p>
                                          </motion.div>
                                        )}
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col items-center gap-20 py-40 border-t border-border/40">
              <div className="flex flex-col items-center gap-8 text-center">
                <div className={`size-24 rounded-full ${theme.bg} border ${theme.border} flex items-center justify-center ${theme.text}`}>
                  <CheckCircle2 size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Sector Finalization</h3>
                  <p className="text-muted-foreground font-medium max-w-md">Seal your current module progress and synchronize with the global proficiency matrix.</p>
                </div>
                <Button
                  onClick={() => handleCompleteSection(activeTab)}
                  disabled={completing || completedSections[activeTab]}
                  className={`w-full sm:w-auto px-10 md:px-16 h-16 md:h-20 rounded-full font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px] transition-all duration-700 shadow-xl ${completedSections[activeTab] ? `${theme.bg} border ${theme.border} ${theme.text}` : 'bg-foreground text-background hover:bg-foreground/90 hover:scale-110 active:scale-95'}`}
                >
                  {completing ? "Synchronizing..." : completedSections[activeTab] ? "Section Resolved" : `Seal ${activeTab} Protocol`}
                </Button>
              </div>

            <div className={`w-full max-w-5xl p-8 md:p-16 rounded-[40px] md:rounded-[80px] border transition-all duration-1000 bg-foreground text-background border-foreground shadow-2xl`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                <div className="space-y-8 flex-1">
                  <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] bg-background/10 text-background`}>
                    <Unlock size={14} className="animate-bounce" /> Evaluation Hub
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85]">Mock Exam <br/> Protocol</h3>
                  <p className={`text-lg md:text-xl font-medium leading-tight opacity-70`}>
                    Take a full-length IELTS or TOEFL mock exam to verify your proficiency and synchronize with the global matrix.
                  </p>
                </div>
                <Link href="/dashboard/learning-path/mock-exam" className="w-full md:w-auto">
                  <Button 
                    className={`rounded-full h-20 md:h-24 w-full md:px-16 font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all duration-700 bg-background text-foreground hover:scale-105 shadow-2xl`}
                  >
                    Initialize Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-2xl"
          >
            <div className="relative w-full max-w-6xl aspect-video rounded-[40px] overflow-hidden bg-background shadow-2xl border border-border/20">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-8 right-8 z-10 size-12 rounded-full bg-muted hover:bg-muted/80 backdrop-blur-xl border border-border flex items-center justify-center text-foreground transition-all hover:scale-110 active:scale-95"
              >
                <StopCircle size={24} />
              </button>
              {selectedVideo.videolink.includes('youtube.com') || selectedVideo.videolink.includes('youtu.be') ? (
                <iframe 
                  src={getYoutubeEmbedUrl(selectedVideo.videolink)} 
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={selectedVideo.videolink} 
                  controls 
                  className="size-full"
                />
              )}
              <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between pointer-events-none">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em]">Active Stream</p>
                  <h4 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tighter">{selectedVideo.title}</h4>
                </div>
                <div className="pointer-events-auto">
                   <a 
                     href={selectedVideo.videolink} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-6 py-3 rounded-full bg-muted hover:bg-muted/80 backdrop-blur-xl border border-border text-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105"
                   >
                     Watch on YouTube <ExternalLink size={14} />
                   </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UnitTestOverlay 
        show={showUnitTest} 
        onClose={() => {
          setShowUnitTest(false);
          setUnitTestContent(null);
          setUnitTestResults(null);
          setActiveMission(null);
        }}
        unitTestContent={unitTestContent}
        setUnitTestContent={setUnitTestContent}
        unitTestResults={unitTestResults}
        isSubmitting={isSubmittingTest}
        activeTab={activeTab}
        onSubmit={handleSubmitUnitTest}
      />

      <SystemArchitectureOverlay 
        isOpen={showArchModal} 
        onClose={() => setShowArchModal(false)} 
      />
    </div>
  );
}
