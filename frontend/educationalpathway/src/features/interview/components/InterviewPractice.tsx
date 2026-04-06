"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Target,
  TrendingUp,
  MessageCircle,
  Volume2,
  VolumeX,
  Play,
  Square,
  Ear,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getLearningPath } from "@/features/assessments/api/assessment-api";
import { generateInterview, submitInterview } from "../api/interview-api";
import { toast } from "react-hot-toast";

type ExamType = "IELTS" | "TOEFL";

interface LearningPathResponse {
  proficiencyLevel?: "easy" | "medium" | "hard";
  examType?: ExamType;
  current_progress_percentage?: number;
}

interface EvaluationResult {
  overall_score: number;
  score_breakdown: Record<string, number | string>;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface InterviewData {
  interview_id: string;
  introduction: string;
  exam_summary?: { type: string; proficiency_level: string };
  warm_up_questions: any[];
  core_questions: any[];
  follow_up_questions: any[];
  submittedResult?: { evaluation: EvaluationResult };
}

export function InterviewPractice() {
  const [examType, setExamType] = useState<ExamType>("IELTS");
  const [learningPath, setLearningPath] = useState<LearningPathResponse | null>(
    null,
  );
  const [loadingPath, setLoadingPath] = useState(true);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  
  // Voice State
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // We keep the transcript in state for background submission but don't render it
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const loadLearningPath = async () => {
      try {
        setLoadingPath(true);
        console.log("Loading learning path...");
        const res = await getLearningPath();
        const data = res?.status === "success" ? res.data : (res?.data ?? res);
        setLearningPath(data);
        if (data?.examType) setExamType(data.examType);
      } catch (pathError) {
        console.warn("Unable to load learning path", pathError);
      } finally {
        setLoadingPath(false);
      }
    };

    loadLearningPath();

    if (typeof window !== "undefined") {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        console.log("Voices ready");
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const proficiencyLevel = learningPath?.proficiencyLevel || "easy";

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !text) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                           voices.find(v => v.lang.startsWith('en')) || 
                           voices[0];
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95; // Slightly slower for better listening practice
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = (questionKey: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(questionKey);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }

        if (finalTranscript) {
          setResponses(prev => ({
            ...prev,
            [questionKey]: (prev[questionKey] || "") + " " + finalTranscript
          }));
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
           setIsRecording(null);
           toast.error(`Mic Error: ${event.error}`);
        }
      };

      recognition.onend = () => setIsRecording(null);
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      toast.error("Could not start microphone.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleGenerate = async () => {
    try {
      setError(null);
      setLoadingGenerate(true);
      const res = await generateInterview({ examType, proficiencyLevel });
      const data = (res?.status === "success" ? res.data : res) as InterviewData;
      setInterviewData(data);
      setResponses({});
      if (data.introduction) speakText(data.introduction);
    } catch (err) {
      setError("Unable to initialize session.");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSubmit = async () => {
    if (!interviewData?.interview_id) return;
    try {
      setLoadingSubmit(true);
      setError(null);
      const res = await submitInterview(interviewData.interview_id, responses);
      const data = (res?.status === "success" ? res.data : res);
      setInterviewData((current: any) => ({
        ...current,
        submittedResult: { evaluation: data?.evaluation || data },
      }));
      toast.success("AI Evaluation Complete!");
    } catch (err) {
      setError("Submission failed.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const warmUpQuestions = interviewData?.warm_up_questions || [];
  const coreQuestions = interviewData?.core_questions || [];
  const followUpQuestions = interviewData?.follow_up_questions || [];
  const submittedResult = interviewData?.submittedResult;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Ear className="size-3.5" /> Listening Intensive Mode
          </div>
          <h1 className="h1">Interview Immersion</h1>
          <p className="max-w-3xl text-muted-foreground">
            Focus purely on the AI examiner's voice. Text prompts are hidden to maximize listening development.
          </p>
        </div>

        <Link href="/dashboard/learning-path">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Exit Studio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-border lg:col-span-1">
          <CardBody className="space-y-5 p-6">
            <div className="space-y-1">
              <p className="text-label text-muted-foreground">Session Intensity</p>
              <div className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                <span className="text-xl font-black capitalize">{String(proficiencyLevel)} Level</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-label">Target Exam</p>
              <div className="grid grid-cols-2 gap-2">
                {(["IELTS", "TOEFL"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setExamType(type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                      examType === type ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={loadingGenerate || loadingPath} className="w-full gap-2 primary-gradient">
              {loadingGenerate ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loadingGenerate ? "Initializing Audio..." : "Start Studio Session"}
            </Button>
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {interviewData ? (
            <>
              {/* Voice-First Header */}
              <Card className="border-border bg-primary/5">
                <CardBody className="p-10 flex flex-col items-center text-center gap-6">
                  <div className="relative">
                     <div className={`absolute -inset-8 rounded-full blur-2xl transition-all duration-1000 ${isSpeaking ? 'bg-primary/40' : 'bg-primary/5'}`} />
                     <div className={`h-24 w-24 rounded-full flex items-center justify-center border-4 border-primary/20 bg-background shadow-xl ${isSpeaking ? 'animate-pulse' : ''}`}>
                       {isSpeaking ? <Waves className="text-primary size-10" /> : <Ear className="text-muted-foreground size-10" />}
                     </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black">AI Examiner Active</h2>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                      Listen carefully to the instructions
                    </p>
                  </div>
                  <Button 
                    variant="gold" 
                    size="lg" 
                    className="h-14 px-8 rounded-2xl gap-3 shadow-lg shadow-amber-500/20"
                    onClick={() => speakText(interviewData.introduction)}
                  >
                    <Volume2 size={20} /> Replay Intro
                  </Button>
                </CardBody>
              </Card>

              {/* Speech-Only Questions */}
              {[
                { title: "Warm-up Phase", icon: BookOpen, items: warmUpQuestions },
                { title: "Core Interview", icon: Target, items: coreQuestions },
                { title: "Follow-up", icon: MessageCircle, items: followUpQuestions },
              ].map((section) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-2">
                    <section.icon size={12} className="text-primary" /> {section.title}
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {section.items.map((item: any, index: number) => {
                      const questionKey = `${section.title}-${item.id || index}`;
                      const active = isRecording === questionKey;
                      const hasResponse = !!responses[questionKey];
                      
                      return (
                        <Card key={questionKey} className={`border-2 transition-all duration-300 ${active ? 'border-primary bg-primary/5 shadow-2xl' : 'border-border bg-background'}`}>
                          <CardBody className="p-6 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Task {index + 1}</span>
                              {active && <div className="flex gap-1 items-center"><div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" /><span className="text-[10px] font-black text-red-500 uppercase">Live</span></div>}
                            </div>

                            <div className="flex flex-col items-center justify-center py-4 gap-4">
                               <Button 
                                 variant="outline" 
                                 size="lg" 
                                 className="h-20 w-20 rounded-full border-2 hover:bg-primary/5"
                                 onClick={() => speakText(item.question)}
                               >
                                 <Volume2 size={32} className="text-primary" />
                               </Button>
                               <span className="text-xs font-bold text-muted-foreground">Listen to Question</span>
                            </div>

                            <div className="space-y-4">
                              <Button
                                variant={active ? "destructive" : hasResponse ? "gold" : "primary"}
                                size="lg"
                                className={`w-full h-14 rounded-2xl gap-3 shadow-lg ${active ? 'animate-pulse' : ''}`}
                                onClick={() => active ? stopRecording() : startRecording(questionKey)}
                              >
                                {active ? <Square size={16} fill="white" /> : <Mic size={16} />}
                                {active ? "I'm Done Speaking" : hasResponse ? "Re-record Answer" : "Speak Now"}
                              </Button>
                              
                              {hasResponse && !active && (
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-success">
                                  <BadgeCheck size={14} /> Answer Captured
                                </div>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-6 pt-12 items-center text-center border-t border-border mt-16 max-w-xl mx-auto">
                <div className="space-y-2">
                  <h4 className="font-black text-2xl">End Audio Session</h4>
                  <p className="text-muted-foreground font-medium">Ready to see how your spoken answers measure up against exam criteria?</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={loadingSubmit || Object.keys(responses).length === 0}
                  size="xl"
                  className="w-full gap-3 primary-gradient h-16 rounded-2xl shadow-2xl shadow-primary/30"
                >
                  {loadingSubmit ? <Loader2 className="size-6 animate-spin" /> : <TrendingUp className="size-6" />}
                  {loadingSubmit ? "Evaluating Pronunciation..." : "Obtain AI Score"}
                </Button>
              </div>

              {submittedResult?.evaluation && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pt-24 pb-32">
                  <Card className="border-4 border-primary/20 rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="primary-gradient p-12 text-white">
                      <h3 className="text-4xl font-black">Performance Analytics</h3>
                      <p className="opacity-70 mt-2 font-medium">AI Breakdown of your spoken response</p>
                    </div>
                    <CardBody className="p-12 space-y-12">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(submittedResult.evaluation.score_breakdown || {}).map(([key, val]) => (
                          <div key={key} className="p-6 bg-muted/20 rounded-3xl text-center border border-border/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{key.replace(/_/g, " ")}</p>
                            <p className="text-4xl font-black text-primary mt-2">{String(val)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 italic font-medium text-xl leading-relaxed text-center">
                        "{String(submittedResult.evaluation.feedback)}"
                      </div>

                      <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-6">
                           <h5 className="text-xs font-black uppercase tracking-widest text-success">Audio Strengths</h5>
                           <div className="space-y-3">
                             {submittedResult.evaluation.strengths?.map((s: any, i: number) => (
                               <div key={i} className="p-4 bg-success/5 border-l-4 border-success rounded-xl text-sm font-semibold">{String(s)}</div>
                             ))}
                           </div>
                        </div>
                        <div className="space-y-6">
                           <h5 className="text-xs font-black uppercase tracking-widest text-primary">Listening Tips</h5>
                           <div className="space-y-3">
                             {submittedResult.evaluation.improvements?.map((im: any, i: number) => (
                               <div key={i} className="p-4 bg-primary/5 border-l-4 border-primary rounded-xl text-sm font-semibold">{String(im)}</div>
                             ))}
                           </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </>
          ) : (
            <Card className="border-dashed border-border bg-muted/10 rounded-[3.5rem]">
              <CardBody className="flex min-h-[550px] flex-col items-center justify-center p-20 text-center gap-10">
                <div className="h-40 w-40 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse rounded-full" />
                  <Ear size={70} className="text-primary relative z-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black uppercase tracking-tight">Listening Intensive</h3>
                  <p className="text-muted-foreground text-lg font-medium max-w-sm">
                    In this mode, all questions are delivered via audio only. Click to generate and focus your ears.
                  </p>
                </div>
                <Button onClick={handleGenerate} size="xl" className="primary-gradient px-12 h-16 rounded-2xl shadow-xl hover:scale-105 transition-transform">
                  Enter Audio Studio
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
