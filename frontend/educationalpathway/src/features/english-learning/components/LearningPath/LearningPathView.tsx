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
  Layers
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

  const load = async (mode: string) => {
    try {
      setLoading(true);
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
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? "Not found" : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(envMode); }, [envMode]);

  const handleToggleVideo = async (videoId: number) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const video = newData.skills[activeTab].videos.find((v: any) => v.id === videoId);
      if (video) video.isCompleted = !video.isCompleted;
      return newData;
    });
    try {
      const currentVideoStatus = data?.skills[activeTab]?.videos.find(v => v.id === videoId)?.isCompleted;
      await trackProgress({ videoId, section: activeTab, isCompleted: !currentVideoStatus, examType: envMode });
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
       const res = await submitUnitTest({ skill: activeTab, responses, missionIndex: activeMission });
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
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Journey Locked</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
               Execute the diagnostic assessment protocol to unlock your personalized learning matrix.
            </p>
         </div>
         <Link href="/dashboard/learning-path/diagnostic/assessment">
            <Button className="h-16 px-12 rounded-2xl primary-gradient text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl">Initialize Diagnostic</Button>
         </Link>
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

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary transition-colors duration-500 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full dark:opacity-100 opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 py-12 lg:py-20 flex flex-col lg:flex-row gap-16">
        
        {/* Sidebar Navigation */}
        <aside className="lg:w-[320px] shrink-0 space-y-16">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Brain size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-widest">Pathfinder</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Neural Adaptive System</p>
              </div>
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
                    reading: '#10B981', 
                    listening: '#3B82F6', 
                    writing: '#8B5CF6', 
                    speaking: '#F59E0B' 
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
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Progress</span>
                <span className="text-2xl font-black text-foreground">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-500"
                />
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                <TrendingUp size={12} />
                +12% Performance increase
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 space-y-20">
          
          {/* Header Section */}
          <section className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="text-amber-500 size-3 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Active Module Optimization</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-none">
                {activeTab} <span className="text-muted-foreground/20 dark:text-zinc-800 ml-4">Mastery</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-10">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground">
                  <Activity size={24} strokeWidth={1} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Data Stream</p>
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

          {/* Intelligence Insights (Collapsible) */}
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

          {/* Roadmap Pipeline */}
          <section className="space-y-12">
            <div className="flex items-center gap-3">
              <Compass size={18} className="text-muted-foreground" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Mission Pipeline</h3>
            </div>

            <div className="relative flex flex-col gap-8">
              {/* Vertical Connector Line */}
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
                      <div className={`size-20 rounded-full shrink-0 flex items-center justify-center relative z-10 border transition-all duration-700 ${isDone ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20' : isActive ? 'bg-foreground border-foreground text-background shadow-xl' : 'bg-muted border-border text-muted-foreground'}`}>
                        {isLocked ? <Lock size={24} /> : isDone ? <CheckCircle2 size={28} /> : <span className="text-lg font-black">{i + 1}</span>}
                      </div>
                      
                      <div className="flex-1 pt-4 space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-500' : 'text-muted-foreground'}`}>{isDone ? 'Mission Resolved' : isLocked ? 'Encryption Locked' : 'Protocol Active'}</span>
                            <div className="h-px flex-1 bg-border/20" />
                          </div>
                          <h4 className="text-3xl font-black text-foreground uppercase tracking-tighter">{m.title}</h4>
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">{m.objective}</p>
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
                              disabled={m.isUnitTestCompleted || isSubmittingTest}
                              className={`h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[9px] border transition-all ${m.isUnitTestCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-background border-border text-muted-foreground hover:border-border/80'}`}
                            >
                              {m.isUnitTestCompleted ? 'Test Verified' : loadingUnitTestIndex === i ? <Loader2 size={16} className="animate-spin" /> : 'Unit Test'}
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
                          className="overflow-hidden pt-8 px-8 space-y-16"
                        >
                          <div className="h-px w-full bg-border/40" />
                          
                          {/* Inner Video Section */}
                          <div className="space-y-8">
                            <div className="flex items-center gap-3">
                              <PlayCircle size={16} className="text-muted-foreground" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Embedded Intelligence</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {currentSkill?.videos?.map((v, vi) => (
                                <div key={v.id} className="group relative bg-card border border-border/50 rounded-[32px] p-6 flex items-center gap-6 hover:shadow-lg transition-all">
                                  <div className="size-24 rounded-2xl overflow-hidden bg-muted relative shrink-0 shadow-sm">
                                    <img src={v.thubnail} className="size-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                    {v.videolink && (
                                      <a href={v.videolink} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all">
                                        <PlayCircle size={20} className="text-white" fill="currentColor" />
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-lg font-black uppercase tracking-tight truncate">{v.title || 'Module Alpha'}</h5>
                                    <button 
                                      onClick={() => handleToggleVideo(v.id)}
                                      className={`flex items-center gap-2 mt-2 text-[9px] font-black uppercase tracking-widest ${v.isCompleted ? 'text-emerald-500' : 'text-muted-foreground'}`}
                                    >
                                      {v.isCompleted ? <><CheckCircle2 size={10} /> Verified</> : <><Circle size={10} /> Standby</>}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Inner Practice Section */}
                          <div className="space-y-10 pb-12">
                             <div className="flex items-center gap-3">
                               <Zap size={16} className="text-muted-foreground" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Practice Vectors</span>
                             </div>
                             <div className="space-y-12">
                                {pQues.map((q: any, idx: number) => (
                                  <div key={idx} className="space-y-6 relative">
                                    <div className="absolute -left-6 top-0 text-7xl font-black text-muted-foreground/10 leading-none select-none pointer-events-none">0{idx + 1}</div>
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
                                            className={`text-left p-6 rounded-2xl text-xs font-bold border transition-all duration-500 ${rev ? (correct ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : selected ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400' : 'opacity-20 border-border/20') : 'bg-muted/30 border-border/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground'}`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {showExplanation[activeTab]?.[idx] && (
                                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-muted/20 rounded-[32px] border-l border-border space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Calibration Note</span>
                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">"{q.explanation || q.tips || q.sample_answer}"</p>
                                      </motion.div>
                                    )}
                                  </div>
                                ))}
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Finalization Section */}
          <section className="flex flex-col items-center gap-20 py-40 border-t border-border/40">
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="size-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={40} strokeWidth={1.5} />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black uppercase tracking-tighter">Sector Finalization</h3>
                <p className="text-muted-foreground font-medium max-w-md">Seal your current module progress and synchronize with the global proficiency matrix.</p>
              </div>
              <Button
                onClick={() => handleCompleteSection(activeTab)}
                disabled={completing || completedSections[activeTab]}
                className={`px-16 h-20 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-700 shadow-xl ${completedSections[activeTab] ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-foreground text-background hover:bg-foreground/90 hover:scale-110 active:scale-95'}`}
              >
                {completing ? "Synchronizing..." : completedSections[activeTab] ? "Section Resolved" : `Seal ${activeTab} Protocol`}
              </Button>
            </div>

            <div className={`w-full max-w-5xl p-16 rounded-[80px] border transition-all duration-1000 ${canLevelUp ? 'bg-foreground text-background border-foreground shadow-2xl' : 'bg-muted/20 text-muted-foreground border-border/40'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                <div className="space-y-8 flex-1">
                  <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] ${canLevelUp ? 'bg-background/10 text-background' : 'bg-muted border border-border/40'}`}>
                    {canLevelUp ? <Unlock size={14} className="animate-bounce" /> : <Lock size={14} />} Universal Certification
                  </div>
                  <h3 className="text-6xl font-black tracking-tighter uppercase leading-[0.85]">Neural <br/> Graduation</h3>
                  <p className={`text-xl font-medium leading-tight ${canLevelUp ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {canLevelUp 
                      ? "Module synchronization complete. You are authorized for the final proficiency verification." 
                      : "Continue resolving sectors to reach 100% mastery and unlock the final graduation protocol."}
                  </p>
                </div>
                <Link href={canLevelUp ? "/dashboard/learning-path/final/assessment" : "#"}>
                  <Button 
                    disabled={!canLevelUp} 
                    className={`rounded-full h-24 px-16 font-black uppercase tracking-widest text-[11px] transition-all duration-700 ${canLevelUp ? 'bg-background text-foreground hover:scale-105 shadow-2xl' : 'bg-muted/50 border border-border/20 text-muted/20'}`}
                  >
                    {canLevelUp ? "Initialize Graduation" : "Protocol Encrypted"}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>

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
    </div>
  );
}
