"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  CheckCircle2,
  Mic,
  StopCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  BookOpen,
  Headphones,
  PenLine,
  Sparkles,
  BarChart3,
  Map,
  Target,
  Lock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { submitAssessment, getAssessmentResult, submitSection } from "@/features/assessments/api/assessment-api";

interface AssessmentQuestion {
  id: string | number;
  question: string;
  options: string[];
}

interface WritingSpeakingQuestion {
  id: string | number;
  prompt: string;
}

interface AssessmentSections {
  reading?: { passage?: string; questions?: AssessmentQuestion[] };
  listening?: { audio_base64?: string; questions?: AssessmentQuestion[] };
  writing?: { prompt?: string; questions?: WritingSpeakingQuestion[] };
  speaking?: { prompt?: string; questions?: WritingSpeakingQuestion[] };
}

interface AssessmentBlueprint {
  data?: AssessmentBlueprint;
  test_id?: string;
  sections?: AssessmentSections;
  exam_summary?: { type?: string; difficulty?: string };
}

interface Props {
  examData: AssessmentBlueprint;
  onComplete: () => void;
}

type SectionKey = "reading" | "listening" | "writing" | "speaking";

const SECTION_ORDER: SectionKey[] = [
  "reading",
  "listening",
  "writing",
  "speaking",
];

const SECTION_META: Record<
  SectionKey,
  { label: string; icon: React.ReactNode; timeMinutes: number }
> = {
  reading: {
    label: "Reading",
    icon: <BookOpen className="size-4" />,
    timeMinutes: 20,
  },
  listening: {
    label: "Listening",
    icon: <Headphones className="size-4" />,
    timeMinutes: 15,
  },
  writing: {
    label: "Writing",
    icon: <PenLine className="size-4" />,
    timeMinutes: 40,
  },
  speaking: {
    label: "Speaking",
    icon: <Mic className="size-4" />,
    timeMinutes: 15,
  },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function normalizeAssessmentResult(payload: any) {
  if (!payload) return null;
  if (
    payload.evaluation ||
    payload.overall_band !== undefined ||
    payload.feedback_report ||
    payload.status === "failed"
  ) {
    return payload;
  }
  if (
    payload.data &&
    (payload.data.evaluation ||
      payload.data.overall_band !== undefined ||
      payload.data.feedback_report)
  ) {
    return payload.data;
  }
  return payload;
}

export function AssessmentTest({ examData, onComplete }: Props) {
  const blueprint = examData.data || examData;
  const testId = blueprint.test_id || "";
  const sections = blueprint.sections || {};
  const examType = blueprint.exam_summary?.type || "IELTS";

  const isTOEFL = examType === "TOEFL";
  const theme = {
    primary: isTOEFL ? "bg-blue-600" : "bg-emerald-500",
    text: isTOEFL ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400",
    border: isTOEFL ? "border-blue-200 dark:border-blue-500/20" : "border-emerald-200 dark:border-emerald-500/20",
    accent: isTOEFL ? "text-blue-500 dark:text-blue-400" : "text-emerald-500 dark:text-emerald-400",
    bg: isTOEFL ? "bg-blue-500/10" : "bg-emerald-500/10",
    btn: isTOEFL ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-500 hover:bg-emerald-600",
    optionSelected: isTOEFL ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400" : "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  };

  const [currentSection, setCurrentSection] = useState<SectionKey>("reading");
  const [responses, setResponses] = useState<any>({
    reading: {},
    listening: {},
    writing: "",
    speaking: "",
  });

  const [timeLeft, setTimeLeft] = useState(
    SECTION_META.reading.timeMinutes * 60,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<SectionKey>>(
    new Set(),
  );
  const [showSectionSummary, setShowSectionSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({});
  const [isEvaluatingSection, setIsEvaluatingSection] = useState(false);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const sectionTime = SECTION_META[currentSection].timeMinutes * 60;
    setTimeLeft(sectionTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSection]);

  const isSectionComplete = (sec: SectionKey): boolean => {
    if (sec === "reading") {
      const qs = sections.reading?.questions || [];
      return qs.length > 0 && qs.every((q: any, i: number) => responses.reading[q.id ?? i]);
    }
    if (sec === "listening") {
      const qs = sections.listening?.questions || [];
      return qs.length > 0 && qs.every((q: any, i: number) => responses.listening[q.id ?? i]);
    }
    if (sec === "writing") return responses.writing.trim().length >= 50;
    if (sec === "speaking") return !!audioBlob || responses.speaking.trim().length > 10;
    return false;
  };

  const handleSectionChange = useCallback(
    (next: SectionKey) => {
      if (isSectionComplete(currentSection)) {
        setCompletedSections((prev) => new Set(prev).add(currentSection));
      }
      setCurrentSection(next);
      setShowSectionSummary(false); // Reset summary when moving to next
    },
    [currentSection, responses, audioBlob, sections]
  );

  const handleOptionSelect = (
    section: "reading" | "listening",
    questionId: number | string,
    option: string,
  ) => {
    setResponses((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [questionId]: option,
      },
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const getSupportedMimeType = () => {
        const types = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
          "audio/ogg;codecs=opus"
        ];
        for (const type of types) {
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
            return type;
          }
        }
        return "";
      };
      
      const mimeType = getSupportedMimeType();
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const finalMimeType = mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: finalMimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
      toast.success("Recording started");
    } catch (err) {
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const evaluateCurrentSection = async () => {
    try {
      setIsEvaluatingSection(true);
      setError(null);
      
      const skillResponse = currentSection === "reading" || currentSection === "listening" 
        ? responses[currentSection] 
        : currentSection === "writing" 
          ? responses.writing 
          : responses.speaking;

      const res = await submitSection(testId, currentSection, skillResponse, currentSection === "speaking" ? audioBlob : undefined);
      
      if (res.status === "success") {
        setSectionScores(prev => ({ ...prev, [currentSection]: res.score }));
        setShowSectionSummary(true);
      } else {
        throw new Error(res.error || "Evaluation failed");
      }
    } catch (err: any) {
      toast.error(`Evaluation failed for ${currentSection}.`);
      setError(`We couldn't grade your ${currentSection} section. You can retry or skip to the next section.`);
    } finally {
      setIsEvaluatingSection(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      // Final submission just ensures everything is synced, but we've been doing it step-by-step
      await submitAssessment(testId, responses, audioBlob);
      toast.success("Finalizing assessment...");
      pollResult();
    } catch (error: any) {
      toast.error("Finalization failed.");
      setIsSubmitting(false);
    }
  };

  const pollResult = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await getAssessmentResult(testId);
        const normalized = normalizeAssessmentResult(res);
        if (normalized?.status === "failed") {
          clearInterval(pollIntervalRef.current!);
          setIsSubmitting(false);
          setError(normalized.error || "The AI Evaluator encountered an error while grading. Please try again.");
        } else if (normalized && (normalized.evaluation || normalized.overall_band !== undefined)) {
          clearInterval(pollIntervalRef.current!);
          setResult(normalized);
          setIsSubmitting(false);
        }
      } catch (err) {}
    }, 3000);
  };

  useEffect(() => {
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, []);

  if (result) {
    const evaluation = result.evaluation || result;
    const subs = evaluation.score_breakdown || {};
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center space-y-2 mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex p-4 bg-success/10 rounded-full mb-4">
            <CheckCircle2 className="size-12 text-success" />
          </motion.div>
          <h1 className="h2">Assessment Complete!</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card><CardBody className="p-8 text-center"><p className="text-label">Overall Band</p><h2 className="text-7xl font-black text-primary">{evaluation.overall_band || "0.0"}</h2></CardBody></Card>
          <Card><CardBody className="p-6"><p className="font-bold mb-4">Sectional Analysis</p>
            {Object.entries(subs).map(([k, v]: any) => (
              <div key={k} className="flex justify-between py-2 border-b border-border/40 text-sm">
                <span className="capitalize">{k}</span><span className="font-bold">{v}</span>
              </div>
            ))}
          </CardBody></Card>
        </div>
        <Card><CardBody className="p-6"><h3 className="font-bold mb-4">AI Feedback</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{evaluation.feedback_report}</p></CardBody></Card>
        <div className="text-center"><Button onClick={onComplete} variant="outline">Back to Dashboard</Button></div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-primary size-14" />
        <div className="text-center space-y-2">
          <h2 className="h3">AI Evaluator is grading your exam</h2>
          <p className="text-sm text-muted-foreground animate-pulse">This typically takes 30-60 seconds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center">
        <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <AlertCircle size={40} />
        </div>
        <h2 className="h3">Grading Failed</h2>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex gap-4">
          <Button onClick={() => { setError(null); handleSubmit(); }} className="primary-gradient text-white">Retry Grading</Button>
          <Button onClick={() => window.location.reload()} variant="outline">Restart Test</Button>
        </div>
      </div>
    );
  }

  const currentIdx = SECTION_ORDER.indexOf(currentSection);
  const timerPct = (timeLeft / (SECTION_META[currentSection].timeMinutes * 60)) * 100;
  const isTimeLow = timeLeft <= 120;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-10 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] ${theme.bg} ${theme.text} ${theme.border}`}>
                Live Assessment Protocol
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <Target size={12} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{examType} Standard</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase leading-none">
                Exam <span className="text-muted-foreground/20 dark:text-zinc-800 ml-4">In Progress</span>
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center gap-4 px-8 h-20 rounded-2xl border-2 font-mono text-2xl font-black shadow-xl transition-all duration-500 ${isTimeLow ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" : "bg-card border-border/40"}`}>
              <Clock className={isTimeLow ? "animate-spin-slow" : "opacity-40"} size={28} />
              {formatTime(timeLeft)}
            </div>
            <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden p-0.5 border border-border/10">
              <motion.div 
                className={`h-full ${isTimeLow ? "bg-destructive" : "primary-gradient"} rounded-full`} 
                animate={{ width: `${timerPct}%` }} 
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showSectionSummary ? (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto py-24 text-center space-y-12"
            >
              <div className={`mx-auto size-32 rounded-[40px] ${theme.bg} flex items-center justify-center shadow-inner`}>
                <CheckCircle2 className={`size-16 ${theme.accent}`} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{SECTION_META[currentSection].label} Complete</h2>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Section Score</span>
                  <div className="text-6xl font-black tabular-nums tracking-tighter">
                    {sectionScores[currentSection] !== undefined ? sectionScores[currentSection] : "--"}
                    <span className="text-xl text-muted-foreground/40 ml-1">/{isTOEFL ? "30" : "9.0"}</span>
                  </div>
                </div>
              </div>
              
              {currentIdx < SECTION_ORDER.length - 1 ? (
                <>
                  <div className="p-10 bg-card rounded-2xl border border-border/40 shadow-sm space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Next Objective</p>
                    <h3 className="text-3xl font-black uppercase tracking-tight">{SECTION_ORDER[currentIdx + 1]} Analysis</h3>
                  </div>

                  <Button 
                    onClick={() => handleSectionChange(SECTION_ORDER[currentIdx + 1])}
                    className={`rounded-lg px-16 h-20 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 primary-gradient text-white w-full`}
                  >
                    Execute {SECTION_META[SECTION_ORDER[currentIdx + 1]]?.label} Protocol <ArrowRight className="ml-4" />
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="p-10 bg-success/5 rounded-2xl border border-success/20 shadow-sm space-y-4">
                    <Sparkles className="mx-auto text-success size-8" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Diagnostic Concluded</h3>
                    <p className="text-sm text-muted-foreground font-medium">Your full performance matrix and adaptive learning path are being synthesized.</p>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    className="rounded-lg px-16 h-20 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 bg-foreground text-background w-full"
                  >
                    Finalize Diagnostic & View Performance <BarChart3 className="ml-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ) : isEvaluatingSection ? (
            <div className="max-w-2xl mx-auto py-32 text-center space-y-8">
              <Loader2 className="animate-spin text-primary size-16 mx-auto opacity-20" />
              <div className="space-y-2">
                <h2 className="h3 uppercase tracking-tighter">Analyzing Performance</h2>
                <p className="text-sm text-muted-foreground animate-pulse">Our AI is scoring your {currentSection} responses...</p>
              </div>
            </div>
          ) : (
            <motion.div 
              key={currentSection} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              transition={{ duration: 0.4, ease: "circOut" }}
              className="space-y-8"
            >
              {/* Top Horizontal Skills Info */}
              <Card className="border border-border/40 rounded-2xl bg-card overflow-hidden shadow-sm">
                <CardBody className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Active Phase</p>
                      <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <span className={theme.text}>{SECTION_META[currentSection].icon}</span>
                        {SECTION_META[currentSection].label}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 md:gap-8">
                    {SECTION_ORDER.map((sec, idx) => (
                      <div key={sec} className="flex items-center gap-3 group">
                        <div className={`size-8 rounded-lg flex items-center justify-center font-black text-xs border transition-all ${currentSection === sec ? theme.bg + " " + theme.text + " " + theme.border : completedSections.has(sec) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted/30 border-transparent text-muted-foreground"}`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${currentSection === sec ? "text-foreground" : "text-muted-foreground opacity-40"}`}>
                          {sec}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Main Content Area */}
              <div className="space-y-8">
                {currentSection === "reading" && (
                  <div className="space-y-10">
                    <Card className="border border-border/40 rounded-2xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                      <CardBody className="p-10 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                          <p className="text-lg leading-[1.8] text-foreground/80 font-medium whitespace-pre-wrap">
                            {sections.reading?.passage}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                    
                    <div className="space-y-12 pb-12">
                      {sections.reading?.questions?.map((q: any, i: number) => {
                        const qId = q.id || i;
                        return (
                          <div key={qId} className="space-y-8 p-2">
                            <div className="flex items-start gap-6">
                              <span className="size-10 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</span>
                              <h4 className="text-xl font-bold tracking-tight leading-relaxed first-letter:uppercase">{q.question}</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3 ml-0 md:ml-16">
                              {q.options?.map((opt: string, j: number) => {
                                const isSelected = responses.reading[qId] === opt;
                                return (
                                  <label 
                                    key={j} 
                                    onClick={() => handleOptionSelect("reading", qId, opt)}
                                    className={`text-left p-4 rounded-lg border transition-all duration-300 flex items-center gap-4 cursor-pointer ${isSelected ? theme.optionSelected : "border-border/40 hover:border-primary/40 bg-card/50 hover:bg-muted/10"}`}
                                  >
                                     <div className={`size-8 rounded-lg flex items-center justify-center font-black text-xs border transition-all ${isSelected ? "bg-primary text-white border-primary" : "bg-muted/30 border-border/40 text-muted-foreground"}`}>
                                       {String.fromCharCode(65 + j)}
                                     </div>
                                     <span className="flex-1 text-base font-medium leading-relaxed">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentSection === "listening" && (
                  <div className="space-y-10">
                    <Card className="border border-border/40 rounded-2xl bg-card overflow-hidden shadow-sm">
                      <CardBody className="p-10 text-center space-y-6">
                        <div className="size-20 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                          <Headphones size={32} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black uppercase tracking-tight">Audio Diagnostic</h3>
                          <p className="text-sm text-muted-foreground font-medium">Verify audio fidelity before proceeding to synthesis.</p>
                        </div>
                        <div className="max-w-md mx-auto p-4 bg-muted/20 rounded-2xl border border-border/10">
                          <audio controls className="w-full h-10" src={`data:audio/mp3;base64,${sections.listening?.audio_base64}`} />
                        </div>
                      </CardBody>
                    </Card>

                    <div className="space-y-12 pb-12">
                      {sections.listening?.questions?.map((q: any, i: number) => {
                        const qId = q.id || i;
                        return (
                          <div key={qId} className="space-y-8 p-2">
                            <div className="flex items-start gap-6">
                              <span className="size-10 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</span>
                              <h4 className="text-xl font-bold tracking-tight leading-relaxed first-letter:uppercase">{q.question}</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3 ml-0 md:ml-16">
                              {q.options?.map((opt: string, j: number) => {
                                const isSelected = responses.listening[qId] === opt;
                                return (
                                  <label 
                                    key={j} 
                                    onClick={() => handleOptionSelect("listening", qId, opt)}
                                    className={`text-left p-4 rounded-lg border transition-all duration-300 flex items-center gap-4 cursor-pointer ${isSelected ? theme.optionSelected : "border-border/40 hover:border-primary/40 bg-card/50 hover:bg-muted/10"}`}
                                  >
                                     <div className={`size-8 rounded-lg flex items-center justify-center font-black text-xs border transition-all ${isSelected ? "bg-primary text-white border-primary" : "bg-muted/30 border-border/40 text-muted-foreground"}`}>
                                       {String.fromCharCode(65 + j)}
                                     </div>
                                     <span className="flex-1 text-base font-medium leading-relaxed">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentSection === "writing" && (
                  <div className="space-y-8 pb-12">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Module Synthesis: Task 01</span>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <PenLine size={12} /> Live Composition
                      </div>
                    </div>
                    <Card className="border border-border/40 rounded-2xl bg-muted/10 shadow-inner">
                      <CardBody className="p-10 italic text-lg text-foreground/70 font-medium leading-relaxed">
                        {sections.writing?.questions?.[0]?.prompt || sections.writing?.prompt}
                      </CardBody>
                    </Card>
                    <textarea 
                      value={responses.writing} 
                      onChange={(e) => setResponses({ ...responses, writing: e.target.value })} 
                      placeholder="Begin composition synthesis here..." 
                      className="w-full h-[500px] p-12 rounded-2xl border-2 border-border/40 bg-card text-lg font-medium text-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none shadow-xl custom-scrollbar"
                    />
                  </div>
                )}

                {currentSection === "speaking" && (
                  <div className="space-y-12 py-12 flex flex-col items-center">
                    <div className="space-y-2 text-center">
                      <span className="text-[10px] font-black text-muted-foreground tracking-[0.3em]">Aural Diagnostic: Task 01</span>
                      <h3 className="text-3xl font-black tracking-tight">Vocal Analysis</h3>
                    </div>
                    
                    <Card className="border border-border/40 rounded-2xl bg-muted/10 shadow-inner max-w-2xl w-full">
                      <CardBody className="p-10 text-xl font-black tracking-tight text-center leading-relaxed">
                        {sections.speaking?.questions?.[0]?.prompt || sections.speaking?.prompt}
                      </CardBody>
                    </Card>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative size-48 p-2 rounded-full border-2 border-border/20 bg-card shadow-2xl flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {isRecording ? (
                            <motion.button 
                              key="stop"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              onClick={stopRecording} 
                              className="size-full rounded-full bg-destructive text-white flex flex-col items-center justify-center gap-3 shadow-2xl shadow-destructive/20 active:scale-95 transition-transform"
                            >
                              <StopCircle size={48} className="animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{formatTime(recordingSeconds)}</span>
                            </motion.button>
                          ) : (
                            <motion.button 
                              key="start"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              onClick={startRecording} 
                              className={`size-full rounded-full ${theme.primary} text-white flex flex-col items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all`}
                            >
                              <Mic size={48} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Initiate Stream</span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {audioBlob && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Audio Stream Captured & Encrypted</span>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        {!showSectionSummary && (
          <div className="mt-16 py-10 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-20">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentIdx > 0) handleSectionChange(SECTION_ORDER[currentIdx - 1]);
              }}
              disabled={currentIdx === 0 || isEvaluatingSection}
              className="h-16 px-10 rounded-lg font-black uppercase tracking-widest text-[10px] border-border/60 hover:bg-muted transition-all shadow-sm bg-card disabled:opacity-20"
            >
              <ArrowLeft className="mr-3 size-4" /> Previous Module
            </Button>
            
            <div className="flex gap-3">
              {SECTION_ORDER.map((sec, idx) => (
                <div 
                  key={sec} 
                  className={`h-2 rounded-full transition-all duration-700 ${currentSection === sec ? "w-16 " + theme.primary : completedSections.has(sec) ? "w-4 bg-emerald-500" : "w-4 bg-muted/40"}`} 
                />
              ))}
            </div>

            {currentIdx < 3 ? (
              <Button 
                onClick={() => setShowSectionSummary(true)} 
                className={`h-16 px-16 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-xl hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 ${theme.btn} text-white`}
              >
                Proceed <ArrowRight className="ml-3 size-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="h-16 px-16 rounded-lg font-black uppercase tracking-widest text-[10px] bg-foreground text-background shadow-xl hover:scale-[1.05] active:scale-95 transition-all"
              >
                Finalize Diagnostic <CheckCircle2 className="ml-3 size-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

