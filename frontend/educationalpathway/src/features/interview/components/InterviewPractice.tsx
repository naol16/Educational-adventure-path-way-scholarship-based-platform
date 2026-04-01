"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Loader2,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getLearningPath } from "@/features/assessments/api/assessment-api";
import { generateInterview, submitInterview } from "../api/interview-api";

type ExamType = "IELTS" | "TOEFL";

interface LearningPathResponse {
  proficiencyLevel?: "easy" | "medium" | "hard";
  examType?: ExamType;
  current_progress_percentage?: number;
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
  const [interviewData, setInterviewData] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadLearningPath = async () => {
      try {
        setLoadingPath(true);
        const res = await getLearningPath();
        const path = res?.data ?? res ?? null;
        setLearningPath(path);
        if (path?.examType) {
          setExamType(path.examType);
        }
      } catch (pathError) {
        console.error("Unable to load learning path for interview", pathError);
        setLearningPath(null);
      } finally {
        setLoadingPath(false);
      }
    };

    loadLearningPath();
  }, []);

  const proficiencyLevel = learningPath?.proficiencyLevel;

  const handleGenerate = async () => {
    if (!proficiencyLevel) {
      setError(
        "Take an assessment first so the interview can match your level.",
      );
      return;
    }

    try {
      setError(null);
      setLoadingGenerate(true);
      const res = await generateInterview({
        examType,
        proficiencyLevel,
      });
      const normalized = res?.interview_id ? res : (res?.data ?? res);
      setInterviewData(normalized);
      setResponses({});
    } catch (generationError) {
      console.error("Interview generation failed", generationError);
      setError("Could not generate the interview right now. Please try again.");
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
      const normalized = res?.evaluation ? res : (res?.data ?? res);
      setInterviewData((current: any) => ({
        ...current,
        submittedResult: normalized,
      }));
    } catch (submissionError) {
      console.error("Interview submission failed", submissionError);
      setError("Could not submit interview answers. Please try again.");
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
            <Mic className="size-3.5" /> Interview Practice
          </div>
          <h1 className="h1">Separate IELTS and TOEFL interview coaching</h1>
          <p className="max-w-3xl text-muted-foreground">
            Generate an AI interview based on your current learning level,
            practice your answers, and submit them for targeted feedback.
          </p>
        </div>

        <Link href="/dashboard/learning-path">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Back to learning path
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border border-border lg:col-span-1">
          <CardBody className="space-y-5 p-6">
            <div className="space-y-1">
              <p className="text-label text-muted-foreground">
                Your current level
              </p>
              <div className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                <span className="text-xl font-black capitalize">
                  {proficiencyLevel || "Not set"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {loadingPath
                  ? "Loading assessment level..."
                  : proficiencyLevel
                    ? "This level is derived from your latest assessment result."
                    : "Complete an assessment first so the interview can be generated from your actual level."}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-label">Exam Type</p>
              <div className="grid grid-cols-2 gap-2">
                {(["IELTS", "TOEFL"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setExamType(type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                      examType === type
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loadingGenerate || loadingPath || !proficiencyLevel}
              className="w-full gap-2 primary-gradient"
            >
              {loadingGenerate ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating
                  interview
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate AI interview
                </>
              )}
            </Button>

            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">How it works</p>
              <p className="mt-1 leading-relaxed">
                The interview is separate from the assessment exam. Use
                assessment to set your learning level, then practice speaking
                here for IELTS or TOEFL.
              </p>
            </div>

            {!loadingPath && !proficiencyLevel && (
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Assessment required
                </p>
                <p className="mt-1 leading-relaxed">
                  Take the IELTS or TOEFL assessment first. The interview will
                  then use your measured level instead of a generic default.
                </p>
                <Link href="/dashboard/assessment" className="mt-3 inline-flex">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="size-4" /> Go to assessment
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {error && (
            <Card className="border border-destructive/20 bg-destructive/5">
              <CardBody className="flex items-start gap-3 p-4 text-sm text-destructive">
                <BadgeCheck className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </CardBody>
            </Card>
          )}

          {interviewData ? (
            <>
              <Card className="border border-border">
                <CardBody className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                      {interviewData.exam_summary?.type || examType}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                      {interviewData.exam_summary?.proficiency_level ||
                        proficiencyLevel}
                    </span>
                  </div>
                  <h2 className="h3">Interview Session</h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {interviewData.introduction}
                  </p>
                </CardBody>
              </Card>

              {[
                { title: "Warm-up", icon: BookOpen, items: warmUpQuestions },
                { title: "Core Questions", icon: Mic, items: coreQuestions },
                {
                  title: "Follow-up",
                  icon: MessageCircle,
                  items: followUpQuestions,
                },
              ].map((section) => (
                <Card key={section.title} className="border border-border">
                  <CardBody className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <section.icon className="size-4 text-primary" />
                      <h3 className="h4">{section.title}</h3>
                    </div>
                    <div className="space-y-4">
                      {section.items.map((item: any, index: number) => {
                        const questionKey = `${section.title}-${item.id || index}`;
                        return (
                          <div
                            key={questionKey}
                            className="rounded-xl border border-border bg-muted/20 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  Question {index + 1}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {item.question}
                                </p>
                                {item.objective && (
                                  <p className="text-xs text-muted-foreground">
                                    Objective: {item.objective}
                                  </p>
                                )}
                                {item.follow_up && (
                                  <p className="text-xs text-muted-foreground">
                                    Follow-up: {item.follow_up}
                                  </p>
                                )}
                                {item.tip && (
                                  <p className="text-xs text-primary">
                                    Tip: {item.tip}
                                  </p>
                                )}
                              </div>
                            </div>
                            <textarea
                              value={responses[questionKey] || ""}
                              onChange={(event) =>
                                setResponses((current) => ({
                                  ...current,
                                  [questionKey]: event.target.value,
                                }))
                              }
                              placeholder="Write your response here before speaking it aloud..."
                              className="mt-4 min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              ))}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Submit your answers to get AI feedback on fluency, coherence,
                  grammar, and lexical resource.
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={loadingSubmit || !interviewData?.interview_id}
                  className="gap-2"
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Reviewing
                    </>
                  ) : (
                    <>
                      <TrendingUp className="size-4" /> Submit interview
                    </>
                  )}
                </Button>
              </div>

              {submittedResult?.evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border border-border">
                    <CardBody className="space-y-4 p-6">
                      <h3 className="h4">Interview Feedback</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {submittedResult.evaluation.feedback}
                      </p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {Object.entries(
                          submittedResult.evaluation.score_breakdown || {},
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-lg border border-border bg-muted/20 p-3 text-center"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="mt-1 text-xl font-black text-primary">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Strengths
                          </p>
                          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                            {(submittedResult.evaluation.strengths || []).map(
                              (item: string, index: number) => (
                                <li key={index} className="flex gap-2">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success" />
                                  <span>{item}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Improvements
                          </p>
                          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                            {(
                              submittedResult.evaluation.improvements || []
                            ).map((item: string, index: number) => (
                              <li key={index} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </>
          ) : (
            <Card className="border border-dashed border-border bg-muted/20">
              <CardBody className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-primary/10 p-4 text-primary">
                  <Sparkles className="size-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="h3">Generate your interview first</h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Choose IELTS or TOEFL, generate the interview, and then
                    practice each response before submitting for AI feedback.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
