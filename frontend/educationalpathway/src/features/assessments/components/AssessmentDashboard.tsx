"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  PlayCircle,
  Loader2,
  AlertCircle,
  Eye,
  BarChart2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  generateAssessment,
  getAssessmentProgress,
} from "../api/assessment-api";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { EnvironmentSwitcher } from "../../english-learning/components/LearningPath/EnvironmentSwitcher";

interface ProgressItem {
  id: number;
  testId?: string;
  test_id?: string;
  examType: string;
  difficulty: string;
  overallBand: number | string;
  evaluation?: any;
  createdAt: string;
}

interface Props {
  onStartTest: (examData: any) => void;
  onViewResult: (item: ProgressItem) => void;
}

const difficultyColors: Record<string, string> = {
  Hard: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Easy: "bg-success/10 text-success",
};

export function AssessmentDashboard({ onStartTest, onViewResult }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [examType, setExamType] = useState<"IELTS" | "TOEFL">("IELTS");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [envMode, setEnvMode] = useState<"IELTS" | "TOEFL">("IELTS");
  const [learningPathError, setLearningPathError] = useState<string | null>(null);

  // Theme configuration
  const theme = {
    primary: envMode === "IELTS" ? "emerald" : "blue",
    text: envMode === "IELTS" ? "text-emerald-600" : "text-blue-600",
    accent: envMode === "IELTS" ? "text-emerald-500" : "text-blue-500",
    bg: envMode === "IELTS" ? "bg-emerald-500/10" : "bg-blue-600/10",
    border: envMode === "IELTS" ? "border-emerald-200" : "border-blue-200",
    gradient: envMode === "IELTS" ? "from-emerald-500 to-emerald-600" : "from-blue-600 to-blue-700",
    btn: envMode === "IELTS" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700",
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getAssessmentProgress();
      const progressItems = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setProgressData(progressItems);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleStartExam = async () => {
    try {
      setLearningPathError(null);
      setLoading(true);
      toast.loading("Generating your personalized assessment...", {
        id: "generating",
      });
      const res = await generateAssessment({ examType, difficulty });
      toast.dismiss("generating");
      toast.success("Assessment ready!");
      onStartTest(res);
    } catch (error: any) {
      toast.dismiss("generating");
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
      if (status === 403) {
        // Learning path not 100% complete
        const progress = error?.response?.data?.currentProgress ?? null;
        const msg = progress !== null
          ? `Your learning path is only ${progress}% complete. You must reach 100% across all sections (Reading, Writing, Listening, Speaking) before generating a mock exam.`
          : "You must complete 100% of your learning path (Reading, Writing, Listening & Speaking) before generating a mock exam.";
        setLearningPathError(msg);
      } else {
        toast.error(serverMessage || "Failed to generate assessment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getOverallAverages = () => {
    const filtered = progressData.filter((d) => d.examType === examType);
    if (filtered.length === 0)
      return { band: "0", tests: 0, best: "0" };
    const numericBands = filtered.map((d) =>
      parseFloat(String(d.overallBand)),
    );
    const sum = numericBands.reduce((a, b) => a + b, 0);
    const best = Math.max(...numericBands);
    return {
      band: (sum / filtered.length).toFixed(isTOEFL ? 0 : 1),
      tests: filtered.length,
      best: best.toFixed(isTOEFL ? 0 : 1),
    };
  };

  const isTOEFL = examType === "TOEFL";
  const averages = getOverallAverages();
  const maxScore = isTOEFL ? 120 : 9;
  const thresholdBand = isTOEFL ? 90 : 6.5;
  const bandPercent = Math.min(100, (parseFloat(averages.band) / maxScore) * 100);

  // Last 7 items for chart (filtered by type)
  const chartData = progressData.filter((d) => d.examType === examType).slice(-7);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border/60 pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <EnvironmentSwitcher mode={envMode} onChange={setEnvMode} />
            <span className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
              Diagnostic Protocol
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter leading-none uppercase bg-linear-to-r from-foreground to-foreground/40 bg-clip-text text-transparent">
              Assessment Matrix
            </h1>
            <p className="text-muted-foreground font-medium text-sm flex items-center gap-2">
               <Sparkles size={14} className={theme.accent} /> 
               Validate your {envMode} proficiency through high-stakes AI evaluations.
            </p>
          </div>
        </div>
        <Button
          onClick={fetchStats}
          variant="outline"
          size="sm"
          className="font-bold uppercase tracking-widest text-[10px] border-border/40 hover:bg-muted/50 transition-all shadow-sm"
        >
          <Loader2 className={`mr-2 size-3 ${loadingStats ? 'animate-spin' : ''}`} />
          Refresh Data Stream
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border border-border/60 rounded-[32px] overflow-hidden shadow-xs">
          <CardBody className="p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-40">
                  Avg {isTOEFL ? "Score" : "Band"}
                </p>
                <h3 className={`text-5xl font-black ${theme.text}`}>
                  {averages.band}
                </h3>
              </div>
              <div className={`${theme.bg} p-4 rounded-2xl ${theme.accent} shadow-sm`}>
                <Target size={24} />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-6 opacity-60">
              Personal Best: <span className="text-foreground">{averages.best}</span>
            </p>
          </CardBody>
        </Card>

        <Card className="border border-border/60 rounded-[32px] overflow-hidden shadow-xs">
          <CardBody className="p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-40">Tests Processed</p>
                <h3 className="text-5xl font-black">{averages.tests}</h3>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-600 shadow-sm">
                <TrendingUp size={24} />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-6 opacity-60">
              Diagnostic Frequency: <span className="text-foreground">Optimal</span>
            </p>
          </CardBody>
        </Card>

        <Card className={`border ${theme.border} rounded-[32px] overflow-hidden shadow-xs bg-linear-to-br ${envMode === "IELTS" ? 'from-emerald-50 to-emerald-500/5' : 'from-blue-50 to-blue-500/5'}`}>
          <CardBody className="p-8 flex flex-col justify-between h-full gap-6">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${theme.text}`}>
                <Award size={14} /> Goal Optimization
              </p>
              <p className="text-sm font-bold mt-2">
                Target {isTOEFL ? "Score" : "Band"}:{" "}
                <span className="text-foreground">
                  {thresholdBand}{!isTOEFL && ".0"}+
                </span>
              </p>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-muted-foreground">Performance Level</span>
                <span className={theme.text}>{averages.band} / {maxScore}{!isTOEFL && ".0"}</span>
              </div>
              <div className="w-full bg-muted/30 h-3 rounded-full overflow-hidden p-0.5 border border-border/20">
                <motion.div
                  className={`h-full rounded-full ${envMode === "IELTS" ? 'bg-emerald-500' : 'bg-blue-600'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${bandPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              {parseFloat(averages.band) >= thresholdBand && (
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5 ${theme.text}`}>
                  <Sparkles size={12} /> Target Efficiency Met
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Generate New Exam */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-primary/20 bg-card">
            <CardBody className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="h4 flex items-center gap-2">
                  <PlayCircle className="text-primary" /> Start New Exam
                </h3>
                <p className="text-small text-muted-foreground mt-1">
                  Configure your mock assessment below.
                </p>
              </div>

              <div className="space-y-8">
                {/* Exam Type Toggle */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40 px-2">Exam Protocol</label>
                  <div className="flex gap-2 p-1 bg-muted/20 rounded-2xl border border-border/40">
                    {(["IELTS", "TOEFL"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setExamType(t)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${
                          examType === t
                            ? "text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {examType === t && (
                          <motion.div
                            layoutId="activeExamType"
                            className={`absolute inset-0 rounded-xl shadow-md z-[-1] ${t === 'IELTS' ? 'bg-emerald-600' : 'bg-blue-600'}`}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Complexity level selection removed for standardized assessments */}
              </div>

              {/* Learning Path Error Banner */}
              {learningPathError && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm">
                  <XCircle className="text-destructive shrink-0 mt-0.5" size={18} />
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-destructive">Mock Exam Generation Failed</p>
                    <p className="text-muted-foreground leading-relaxed">{learningPathError}</p>
                    <Link
                      href="/dashboard/learning-path"
                      className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs hover:underline mt-1"
                    >
                      Go to Learning Path <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              <Button
                onClick={handleStartExam}
                disabled={loading}
                className={`w-full py-6 text-base font-bold mt-2 shadow-lg hover:shadow-xl transition-all duration-300 ${theme.btn} text-white`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 size-5" /> Generating
                    Exam...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-5" /> Generate Assessment
                  </>
                )}
              </Button>
            </CardBody>
          </Card>

          {/* Band Score Chart */}
          {chartData.length > 1 && (
            <Card className="border border-border">
              <CardBody className="p-6">
                <h3 className="h4 mb-4 flex items-center gap-2">
                  <BarChart2 className="text-primary size-5" /> Score Trend
                </h3>
                <div className="flex items-end gap-2 h-24">
                  {chartData.map((item, i) => {
                    const h = Math.max(
                      8,
                      (parseFloat(String(item.overallBand)) / maxScore) * 96,
                    );
                    return (
                      <motion.div
                        key={item.id || i}
                        className="flex-1 flex flex-col items-center gap-1 group cursor-default"
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                      >
                        <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.overallBand}
                        </span>
                        <div
                          className="w-full bg-primary/20 rounded-t-sm relative overflow-hidden"
                          style={{ height: `${h}px` }}
                        >
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm"
                            initial={{ height: 0 }}
                            animate={{ height: "100%" }}
                            transition={{ delay: 0.05 * i, duration: 0.5 }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right: History */}
        <div className="lg:col-span-3">
          <Card className="border border-border min-h-[400px]">
            <CardBody className="p-6">
              <h3 className="h4 mb-5">Assessment History</h3>

              {loadingStats ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="animate-spin text-primary size-8" />
                </div>
              ) : progressData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground gap-3">
                  <AlertCircle className="size-12 opacity-20" />
                  <p className="font-medium">No assessments yet</p>
                  <p className="text-sm">
                    Generate your first exam to start tracking your progress.
                  </p>
                </div>
              ) : (
                 <div className="space-y-4">
                   {[...progressData].reverse().map((item, index) => (
                     <motion.div
                       key={item.id || index}
                       initial={{ opacity: 0, y: 12 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.05 * index }}
                       className="flex items-center justify-between p-6 rounded-[32px] border border-border/60 hover:bg-muted/40 transition-all duration-300 group"
                     >
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                         {/* Band Badge */}
                         <div className={`w-16 h-16 rounded-2xl ${parseFloat(String(item.overallBand)) >= 7 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'} flex flex-col items-center justify-center shrink-0 border border-current/10 shadow-xs`}>
                           <span className="text-2xl font-black leading-none">
                             {parseFloat(String(item.overallBand)).toFixed(1)}
                           </span>
                           <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-60">SCORE</span>
                         </div>
 
                         <div className="flex-1 min-w-0 space-y-1">
                           <div className="flex items-center gap-3">
                             <span className="font-bold text-sm tracking-tight">
                               {item.examType} PROCTOR
                             </span>
                             <span
                               className="text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest bg-primary/10 text-primary"
                             >
                               Standard
                             </span>
                           </div>
                           <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-40">
                             DATED {new Date(item.createdAt).toLocaleDateString(
                               "en-US",
                               {
                                 year: "numeric",
                                 month: "short",
                                 day: "numeric",
                               },
                             )}
                           </p>
                         </div>
                       </div>
 
                        <Button
                          onClick={() => {
                            const normalizedItem = {
                              ...item,
                              testId: item.testId || item.test_id
                            };
                            onViewResult(normalizedItem);
                          }}
                          variant="secondary"
                          size="sm"
                          className={`gap-2 px-6 h-12 rounded-2xl font-bold uppercase tracking-widest text-[9px] transition-all border border-border/40 shadow-sm ${theme.text} hover:bg-muted`}
                        >
                          <Eye size={14} />
                          View Matrix
                          <ChevronRight size={14} />
                        </Button>
                     </motion.div>
                   ))}
                 </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
