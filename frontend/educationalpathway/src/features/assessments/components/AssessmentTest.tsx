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
import { submitAssessment, getAssessmentResult } from "../api/assessment-api";

interface AssessmentQuestion {
  id: string | number;
  question: string;
  options: string[];
}

interface AssessmentSections {
  reading?: { passage?: string; questions?: AssessmentQuestion[] };
  listening?: { audio_base64?: string; questions?: AssessmentQuestion[] };
  writing?: { prompt?: string };
  speaking?: { prompt?: string };
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
    text: isTOEFL ? "text-blue-600" : "text-emerald-600",
    border: isTOEFL ? "border-blue-200" : "border-emerald-200",
    accent: isTOEFL ? "text-blue-500" : "text-emerald-500",
    bg: isTOEFL ? "bg-blue-50" : "bg-emerald-50",
    btn: isTOEFL ? "primary-gradient-blue" : "primary-gradient-emerald"
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
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<SectionKey>>(
    new Set(),
  );

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
      setCurrentQuestionIdx(0);
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
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
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

  const handleSubmit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await submitAssessment(testId, responses, audioBlob);
      toast.success("Submitted. Grading...");
      pollResult();
    } catch (error: any) {
      toast.error("Submission failed.");
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
        <h2 className="h3">AI Evaluator is grading your exam</h2>
      </div>
    );
  }

  const currentIdx = SECTION_ORDER.indexOf(currentSection);
  const timerPct = (timeLeft / (SECTION_META[currentSection].timeMinutes * 60)) * 100;
  const isTimeLow = timeLeft <= 120;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-0">
      <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
        <div><h1 className="h3">Mock Exam in Progress</h1><p className="text-xs text-muted-foreground">{examType} · {blueprint.exam_summary?.difficulty}</p></div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold ${isTimeLow ? "bg-red-50 text-red-600 animate-pulse" : "bg-muted"}`}>
          <Clock className="size-4" />{formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-full bg-muted h-1 rounded-full overflow-hidden mb-8">
        <motion.div className={`h-full ${isTimeLow ? "bg-red-500" : theme.primary} rounded-full`} animate={{ width: `${timerPct}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
          {currentSection === "reading" && (
            <div className="flex flex-col gap-8 max-w-3xl mx-auto">
              <Card className="border border-border/60 rounded-[32px] bg-muted/10">
                <CardBody className="p-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{sections.reading?.passage}</p>
                </CardBody>
              </Card>
              {sections.reading?.questions && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-muted-foreground">Question {currentQuestionIdx + 1} of {sections.reading?.questions?.length || 0}</span>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold">{sections.reading?.questions?.[currentQuestionIdx]?.question}</h4>
                    <div className="grid gap-3">
                      {sections.reading?.questions?.[currentQuestionIdx]?.options?.map((opt, j) => {
                        const qId = sections.reading?.questions?.[currentQuestionIdx]?.id || currentQuestionIdx;
                        const isSelected = responses.reading[qId] === opt;
                        return (
                          <button key={j} onClick={() => handleOptionSelect("reading", qId, opt)} className={`text-left p-4 sm:p-6 rounded-2xl border-2 transition-all flex items-center group ${isSelected ? theme.border + " " + theme.bg + " " + theme.text : "border-border/60 hover:border-primary/40 bg-card hover:bg-muted/50"}`}>
                             <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full mr-4 text-xs sm:text-sm font-black border-2 transition-all ${isSelected ? theme.border + " bg-white " + theme.text : "border-border text-muted-foreground group-hover:border-primary/30"}`}>
                                 {String.fromCharCode(65 + j)}
                             </div>
                             <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between pt-8 border-t border-border/40">
                    <Button variant="ghost" onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))} disabled={currentQuestionIdx === 0}><ArrowLeft className="mr-2" /> Previous</Button>
                    <Button onClick={() => {
                      if (currentQuestionIdx < (sections.reading?.questions?.length || 0) - 1) setCurrentQuestionIdx(prev => prev + 1);
                      else handleSectionChange("listening");
                    }} className={`${theme.primary} text-white`}>Continue <ArrowRight className="ml-2" /></Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === "listening" && (
            <div className="flex flex-col gap-8 max-w-3xl mx-auto">
              <Card className="border border-border/60 rounded-[32px] bg-muted/10 overflow-hidden text-center">
                <CardBody className="p-8 space-y-4">
                  <Headphones className="size-10 mx-auto opacity-40" />
                  <audio controls className="w-full" src={`data:audio/mp3;base64,${sections.listening?.audio_base64}`} />
                </CardBody>
              </Card>
              {sections.listening?.questions && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black text-muted-foreground">Question {currentQuestionIdx + 1} of {sections.listening?.questions?.length || 0}</span></div>
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold">{sections.listening?.questions?.[currentQuestionIdx]?.question}</h4>
                    <div className="grid gap-3">
                      {sections.listening?.questions?.[currentQuestionIdx]?.options?.map((opt, j) => {
                        const qId = sections.listening?.questions?.[currentQuestionIdx]?.id || currentQuestionIdx;
                        const isSelected = responses.listening[qId] === opt;
                        return (
                          <button key={j} onClick={() => handleOptionSelect("listening", qId, opt)} className={`text-left p-4 sm:p-6 rounded-2xl border-2 transition-all flex items-center group ${isSelected ? theme.border + " " + theme.bg + " " + theme.text : "border-border/60 hover:border-primary/40 bg-card hover:bg-muted/50"}`}>
                             <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-full mr-4 text-xs sm:text-sm font-black border-2 transition-all ${isSelected ? theme.border + " bg-white " + theme.text : "border-border text-muted-foreground group-hover:border-primary/30"}`}>
                                 {String.fromCharCode(65 + j)}
                             </div>
                             <span className="flex-1 text-sm sm:text-base font-medium leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between pt-8 border-t border-border/40">
                    <Button variant="ghost" onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))} disabled={currentQuestionIdx === 0}><ArrowLeft className="mr-2" /> Previous</Button>
                    <Button onClick={() => {
                      if (currentQuestionIdx < (sections.listening?.questions?.length || 0) - 1) setCurrentQuestionIdx(prev => prev + 1);
                      else handleSectionChange("writing");
                    }} className={`${theme.primary} text-white`}>Continue <ArrowRight className="ml-2" /></Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === "writing" && (
            <div className="max-w-3xl mx-auto space-y-8">
              <Card className="border border-border/60 rounded-[32px] bg-muted/10"><CardBody className="p-8 italic text-sm text-muted-foreground">{sections.writing?.prompt}</CardBody></Card>
              <textarea value={responses.writing} onChange={(e) => setResponses({ ...responses, writing: e.target.value })} placeholder="Composition synthesis..." className="w-full h-96 p-8 rounded-[40px] border-2 border-border/40 bg-card text-foreground focus:outline-none resize-none" />
              <div className="flex justify-end"><Button onClick={() => handleSectionChange("speaking")} className={`${theme.primary} text-white`}>Move to Speaking <ArrowRight className="ml-2" /></Button></div>
            </div>
          )}

          {currentSection === "speaking" && (
            <div className="max-w-3xl mx-auto space-y-8 text-center">
              <Card className="border border-border/60 rounded-[32px] bg-muted/10"><CardBody className="p-8 font-bold italic">{sections.speaking?.prompt}</CardBody></Card>
              <div className="p-12 bg-card rounded-[40px] border-2 border-border/40 shadow-xl space-y-6">
                {isRecording ? (
                  <button onClick={stopRecording} className="size-24 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse"><StopCircle size={32} /></button>
                ) : (
                  <button onClick={startRecording} className={`size-24 rounded-full ${theme.primary} text-white flex items-center justify-center shadow-xl`}><Mic size={32} /></button>
                )}
                {audioBlob && <p className="text-success text-xs font-bold uppercase tracking-widest">Audio Stream Captured</p>}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0">
        <Button variant="ghost" disabled={currentIdx === 0} onClick={() => handleSectionChange(SECTION_ORDER[currentIdx - 1])} className="rounded-2xl px-8 sm:px-10 h-14 font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100"><ArrowLeft className="mr-3" /> Back</Button>
        <div className="flex gap-2">
          {SECTION_ORDER.map((sec) => (
            <div key={sec} className={`h-1.5 rounded-full transition-all ${currentSection === sec ? "w-12 " + theme.primary : "w-4 bg-muted"}`} />
          ))}
        </div>
        {currentIdx < 3 ? (
          <Button onClick={() => handleSectionChange(SECTION_ORDER[currentIdx + 1])} className={`rounded-2xl px-8 sm:px-14 h-14 font-black uppercase tracking-widest text-[10px] ${theme.primary} text-white`}>Continue <ArrowRight className="ml-3" /></Button>
        ) : (
          <Button onClick={handleSubmit} className={`rounded-2xl px-8 sm:px-14 h-14 font-black uppercase tracking-widest text-[10px] bg-black text-white`}>Finalize Exam <CheckCircle2 className="ml-3" /></Button>
        )}
      </div>
    </div>
  );
}
