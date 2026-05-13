"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  BookMarked,
  Map,
  List,
  ChevronRight,
  ArrowRight,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getAssessmentResult } from "@/features/assessments/api/assessment-api";

interface AssessmentResultViewProps {
  testId: string;
  examType: string;
  difficulty: string;
  initialData?: any;
  onBack: () => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
  Reading: <BookOpen className="size-4" />,
  Listening: <Headphones className="size-4" />,
  Writing: <PenLine className="size-4" />,
  Speaking: <Mic className="size-4" />,
};

const difficultyColors: Record<string, string> = {
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Easy: "bg-success/10 text-success border-success/20",
};

function normalizeAssessmentResult(payload: any) {
  if (!payload) return null;
  if (
    payload.evaluation ||
    payload.overall_band !== undefined ||
    payload.feedback_report
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

export function AssessmentResultView({
  testId,
  examType,
  difficulty,
  initialData,
  onBack,
}: AssessmentResultViewProps) {
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(normalizeAssessmentResult(initialData));

  useEffect(() => {
    if (initialData) return;

    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await getAssessmentResult(testId);
        const normalized = normalizeAssessmentResult(res);
        if (normalized?.status === "failed") {
          setError(
            `Evaluation failed: ${normalized.reason || "Unknown error"}`,
          );
        } else if (normalized) {
          setResultData(normalized);
        } else {
          setError("Result not found or still processing.");
        }
      } catch (err: any) {
        setError("Could not load result. The result may have expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId, initialData]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary size-10" />
        <p className="text-muted-foreground">Loading result...</p>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="size-10 text-destructive" />
        </div>
        <h2 className="h3">Result Unavailable</h2>
        <p className="text-muted-foreground">
          {error ||
            "This result has expired from the cache. Complete a new assessment to track progress."}
        </p>
        <Button onClick={onBack} variant="outline" className="px-8 font-bold border-border/40 hover:bg-muted shadow-sm">
          <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const evaluation = resultData.evaluation || resultData;
  const examReport = evaluation.exam_report;
  const isTOEFL =
    examType === "TOEFL" || examReport?.exam_type === "TOEFL";
  const maxScore = isTOEFL ? 120 : 9;
  const maxSectionScore = isTOEFL ? 30 : 9;
  const threshold = isTOEFL ? 90 : 6.5;

  const subs = evaluation.score_breakdown || evaluation.subscores || {};
  const band = parseFloat(evaluation.overall_band || evaluation.overallBand || 0);
  const bandPercent = Math.min(100, (band / maxScore) * 100);

  const subscoredItems = [
    { name: "Reading", val: subs.reading },
    { name: "Listening", val: subs.listening },
    { name: "Writing", val: subs.writing },
    { name: "Speaking", val: subs.speaking },
  ];

  const getBandColor = (b: number) => {
    if (isTOEFL) {
      if (b >= 100) return "text-success";
      if (b >= 85) return "text-primary";
      if (b >= 70) return "text-warning";
      return "text-destructive";
    }
    if (b >= 7.5) return "text-success";
    if (b >= 6.5) return "text-primary";
    if (b >= 5.5) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 space-y-10 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={onBack} 
                variant="outline" 
                className="h-12 px-6 rounded-lg font-black uppercase tracking-widest text-[9px] border-border/60 hover:bg-muted shadow-sm bg-card transition-all active:scale-95"
              >
                <ArrowLeft size={14} className="mr-2" /> Back to Matrix
              </Button>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Result Calibration</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-none">
                {examType} <span className="text-muted-foreground/20 dark:text-zinc-800 ml-4">{evaluation.isDiagnostic ? "Diagnostic" : "Mock Exam"}</span>
              </h1>
              <div className="flex items-center gap-4">
                 <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                   Protocol ID: {testId.slice(0, 12).toUpperCase()}
                 </p>
                 <Badge className={`text-[10px] font-black uppercase tracking-widest border-none ${evaluation.isDiagnostic ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {evaluation.isDiagnostic ? "Initial Calibration" : "Final Graduation"}
                 </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Score Hero & Section Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "circOut" }}
          >
            <Card className="border border-border/40 rounded-2xl bg-card/50 backdrop-blur-md overflow-hidden shadow-xl h-full relative group">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <CardBody className="p-12 flex flex-col items-center justify-center text-center relative z-10">
                <div className={`size-24 rounded-3xl flex items-center justify-center mb-8 shadow-inner transition-all duration-700 group-hover:scale-110 ${band >= threshold ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                  {band >= threshold ? <Award size={48} /> : <TrendingUp size={48} />}
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-2">Overall Proficiency Index</p>
                <h2 className={`text-9xl font-black tracking-tighter leading-none ${getBandColor(band)}`}>
                  {evaluation.overall_band || "0"}
                </h2>
                
                <div className="flex items-center gap-3 mt-8 px-6 py-2 bg-muted/30 rounded-full border border-border/20">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">System Benchmark</span>
                  <div className="size-1 bg-muted-foreground/40 rounded-full" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Peak {maxScore}</span>
                </div>
                {examReport?.overall_rule && (
                  <p className="text-[10px] text-muted-foreground/80 max-w-sm mt-4 leading-relaxed text-center font-medium">
                    {examReport.overall_rule}
                  </p>
                )}

                <div className="w-full mt-12 space-y-4">
                  <div className="w-full bg-muted/40 h-4 rounded-full overflow-hidden p-1 border border-border/10 shadow-inner">
                    <motion.div
                      className="h-full primary-gradient rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${bandPercent}%` }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">
                    {bandPercent.toFixed(1)}% Capacity Reached
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Sectional Analysis */}
          <Card className="border border-border/40 rounded-2xl bg-card overflow-hidden shadow-sm">
            <CardBody className="p-12 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <BarChart3 className="text-primary" size={20} /> Sectional Matrix
                </h3>
                <Badge className="bg-muted text-muted-foreground border-none font-black px-3 py-1 rounded-full text-[8px] tracking-widest uppercase">Differential Data</Badge>
              </div>
              
              <div className="space-y-8">
                {subscoredItems.map((s, idx) => {
                  const val = parseFloat(s.val || 0);
                  const pct = Math.min(100, (val / maxSectionScore) * 100);
                  return (
                    <motion.div
                      key={s.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-muted rounded-2xl text-muted-foreground group-hover:text-primary transition-colors">
                            {sectionIcons[s.name]}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{s.name}</span>
                        </div>
                        <span className={`text-2xl font-black tracking-tighter ${getBandColor(val)}`}>
                          {s.val || "0.0"}
                        </span>
                      </div>
                      <div className="w-full bg-muted/30 h-2.5 rounded-full overflow-hidden p-0.5 border border-border/10">
                        <motion.div
                          className="h-full bg-primary rounded-full shadow-sm"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.3 + (0.1 * idx), ease: "circOut" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Milestone Indicator */}
        {band >= threshold && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={80} className="text-emerald-500" />
              </div>
              <CardBody className="p-8 flex items-center gap-8 relative z-10">
                <div className="p-5 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner">
                  <Award size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Scholarship Eligibility Unlocked</h4>
                  <p className="text-sm text-muted-foreground font-medium max-w-xl">
                    Your {isTOEFL ? "score" : "band score"} of {evaluation.overall_band} exceeds the high-tier scholarship threshold ({threshold}+). Your profile is now being prioritized in the matching engine.
                  </p>
                </div>
                <Button className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] h-12 px-8 rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 hidden lg:flex">
                  View Eligible Matches
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Intelligence Feedback & Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-border/40 rounded-2xl bg-card shadow-sm">
              <CardBody className="p-10 space-y-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-primary" size={20} />
                  <h3 className="text-xl font-black uppercase tracking-tight">AI Diagnostic Synthesis</h3>
                </div>
                <div className="p-8 bg-muted/20 rounded-2xl border border-border/30 relative">
                  <div className="absolute top-4 right-6 text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Neural Evaluation</div>
                  <p className="text-sm text-foreground font-medium leading-[1.8] italic">
                    "{evaluation.feedback_report || "Comprehensive analysis pending further data points."}"
                  </p>
                </div>

                {evaluation.adaptive_learning_tags && evaluation.adaptive_learning_tags.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 opacity-60">
                      <AlertCircle size={14} /> Critical Optimization Vectors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.adaptive_learning_tags.map((tag: string, i: number) => (
                        <Badge key={i} className="px-4 py-1.5 bg-destructive/10 text-destructive border border-destructive/10 text-[9px] font-black uppercase tracking-widest rounded-full">
                          {tag.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Competency Analysis */}
            {evaluation.competency_gap_analysis && (
              <Card className="border border-primary/20 bg-card rounded-2xl overflow-hidden">
                <CardBody className="p-10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Competency Matrix</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Proficiency Profile Delta</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {evaluation.competency_gap_analysis.section_analysis && Object.entries(evaluation.competency_gap_analysis.section_analysis).map(([skill, analysis]: [any, any]) => (
                      <div key={skill} className="p-8 rounded-2xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="size-8 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            {sectionIcons[skill.charAt(0).toUpperCase() + skill.slice(1)] || <List size={14} />}
                          </div>
                          <span className="font-black text-[10px] uppercase tracking-widest">{skill} Analysis</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{analysis}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Actionable Notes & Roadmap */}
          <div className="space-y-8">
            {evaluation.section_notes && (
              <Card className="border border-border/40 rounded-2xl bg-card shadow-sm">
                <CardBody className="p-10 space-y-8">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                    <BookMarked className="text-primary" size={20} /> Tactical Notes
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(evaluation.section_notes).map(([skill, note]: [any, any]) => (
                      <div key={skill} className="space-y-2 group">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{skill} Protocol</span>
                          <div className="h-px flex-1 bg-border/20" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            <Card className="primary-gradient rounded-2xl p-1 shadow-xl">
              <div className="bg-card rounded-2xl p-10 space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Strategic Evolution</p>
                  <h4 className="text-2xl font-black uppercase tracking-tight">Ready for Peak?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">Your current trajectory suggests an optimal window for high-stakes preparation. Optimize your learning path now.</p>
                </div>
                <Button className="w-full h-14 rounded-lg bg-foreground text-background font-black uppercase tracking-widest text-[9px] hover:bg-foreground/90 transition-all">
                  Optimize Roadmap
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Adaptive Roadmap Matrix */}
        {evaluation.adaptive_curriculum_map && (
          <div className="space-y-10 pt-10">
            <div className="flex items-center gap-4 px-2">
              <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                <Map size={24} />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Strategic Roadmap</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Personalized Evolutionary Curriculum</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {evaluation.adaptive_curriculum_map.sprints?.map((sprint: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Card className={`border border-border/40 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500 ${sprint.is_remedial ? 'bg-destructive/5' : 'bg-card'}`}>
                      <CardBody className="p-8 flex items-start gap-8">
                        <div className="flex flex-col items-center gap-3">
                          <div className={`size-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-500 ${sprint.is_remedial ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            W{sprint.week}
                          </div>
                          {sprint.is_remedial && <Badge className="bg-destructive/10 text-destructive border-none text-[7px] font-black uppercase tracking-widest px-2">Remedial</Badge>}
                        </div>
                        <div className="space-y-6 flex-1 pt-2">
                          <h5 className="text-xl font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{sprint.goal}</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {sprint.tasks?.map((task: string, j: number) => (
                              <div key={j} className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border border-border/10 text-xs text-muted-foreground font-medium group-hover:bg-muted/40 transition-colors">
                                <div className={`size-2 rounded-full shrink-0 ${sprint.is_remedial ? 'bg-destructive/30' : 'bg-primary/30'}`} />
                                {task}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center gap-3 px-4">
                  <div className="h-px flex-1 bg-border/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vocabulary Archive</span>
                  <div className="h-px flex-1 bg-border/20" />
                </div>
                
                {evaluation.adaptive_curriculum_map.vocabulary_packs?.map((pack: any, i: number) => (
                  <Card key={i} className="border border-border/40 rounded-2xl bg-card shadow-sm group overflow-hidden">
                    <CardBody className="p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <List size={16} />
                        </div>
                        <p className="font-black text-xs uppercase tracking-widest">{pack.topic}</p>
                      </div>
                      <div className="space-y-6 border-t border-border/10 pt-6">
                        {pack.words?.map((w: any, j: number) => (
                          <div key={j} className="space-y-1.5 group/word">
                            <p className="text-sm font-black text-primary group-hover/word:translate-x-1 transition-transform">{w.word}</p>
                            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic opacity-80">{w.meaning}</p>
                            <p className="text-[10px] font-bold text-muted-foreground/40 leading-relaxed">"{w.example}"</p>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

