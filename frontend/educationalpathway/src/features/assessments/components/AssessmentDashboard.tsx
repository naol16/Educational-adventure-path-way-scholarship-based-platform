"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  Sparkles,
  ArrowRight,
  XCircle,
  Trophy,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  generateAssessment,
  getAssessmentProgress,
} from "../api/assessment-api";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { EnvironmentSwitcher } from "@/features/english-learning/components/LearningPath/EnvironmentSwitcher";

interface ProgressItem {
  id: number;
  testId?: string;
  test_id?: string;
  examType: string;
  difficulty: string;
  overallBand: number | string;
  evaluation?: any;
  isDiagnostic?: boolean;
  createdAt: string;
}

interface Props {
  onStartTest: (examData: any) => void;
  onViewResult: (item: ProgressItem) => void;
  isDiagnostic?: boolean;
}

const difficultyColors: Record<string, string> = {
  Hard: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Easy: "bg-success/10 text-success",
};

export function AssessmentDashboard({ onStartTest, onViewResult, isDiagnostic }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [examType, setExamType] = useState<"IELTS" | "TOEFL">("IELTS");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [envMode, setEnvMode] = useState<"IELTS" | "TOEFL">("IELTS");
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 4;

  // Theme configuration
  const theme = {
    primary: envMode === "IELTS" ? "emerald" : "blue",
    text: envMode === "IELTS" ? "text-emerald-500" : "text-blue-600",
    accent: envMode === "IELTS" ? "text-emerald-500" : "text-blue-500",
    bg: envMode === "IELTS" ? "bg-emerald-500/10" : "bg-blue-600/10",
    border: envMode === "IELTS" ? "border-emerald-500/20" : "border-blue-600/20",
    glow: envMode === "IELTS" ? "bg-emerald-500/5" : "bg-blue-600/5",
    gradient:
      envMode === "IELTS"
        ? "from-emerald-500 to-emerald-600"
        : "from-blue-600 to-blue-700",
    btn:
      envMode === "IELTS"
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-blue-600 hover:bg-blue-700",
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setHistoryPage(1);
  }, [examType]);

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
      setLoading(true);
      toast.loading("Generating your personalized assessment...", {
        id: "generating",
      });

      // Determine if first-time diagnostic (no history for this examType)
      const historyForType = progressData.filter(p => p.examType === examType);
      const isFirstDiagnostic = isDiagnostic || historyForType.length === 0;

      // Always pass force:true for retakes — mirrors mobile which never gates on 100% completion
      const res = await generateAssessment({
        examType,
        difficulty,
        isDiagnostic: isFirstDiagnostic,
        force: !isFirstDiagnostic, // force=true bypasses the 100% gate on retakes
      });
      toast.dismiss("generating");
      toast.success("Assessment ready!");
      onStartTest(res);
    } catch (error: any) {
      toast.dismiss("generating");
      const serverMessage =
        error?.response?.data?.error || error?.response?.data?.message;
      toast.error(serverMessage || "Failed to generate assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getOverallAverages = () => {
    const filtered = progressData.filter((d) => d.examType === examType);
    if (filtered.length === 0) return { band: "0", tests: 0, best: "0" };
    const numericBands = filtered.map((d) => parseFloat(String(d.overallBand)));
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
  const bandPercent = Math.min(
    100,
    (parseFloat(averages.band) / maxScore) * 100,
  );

  // Filter data by current exam type
  const historyData = progressData.filter((d) => d.examType === examType);
  const totalHistoryPages = Math.max(
    1,
    Math.ceil(historyData.length / historyPageSize),
  );
  const safeHistoryPage = Math.min(historyPage, totalHistoryPages);
  const sortedHistoryData = [...historyData].reverse();
  const paginatedHistoryData = sortedHistoryData.slice(
    (safeHistoryPage - 1) * historyPageSize,
    safeHistoryPage * historyPageSize,
  );
  const historyStart =
    historyData.length === 0 ? 0 : (safeHistoryPage - 1) * historyPageSize + 1;
  const historyEnd = Math.min(
    safeHistoryPage * historyPageSize,
    historyData.length,
  );
  const chartData = historyData.slice(-7);

  useEffect(() => {
    if (historyPage > totalHistoryPages) {
      setHistoryPage(totalHistoryPages);
    }
  }, [historyPage, totalHistoryPages]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-x-hidden">
      {/* Immersive Background Elements - Dynamic Mode */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={envMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${theme.glow} blur-[120px] rounded-full dark:opacity-100 opacity-50`}
            />
            <div
              className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${theme.glow} blur-[120px] rounded-full dark:opacity-100 opacity-50`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <EnvironmentSwitcher
                mode={envMode}
                onChange={(mode) => {
                  setEnvMode(mode);
                  setExamType(mode);
                }}
              />
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <Sparkles size={12} className={`${theme.accent} animate-pulse`} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Strategic Placement
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
                {progressData.some((p) => !p.isDiagnostic)
                  ? "Practice"
                  : "Level"}{" "}
                <span className="text-muted-foreground/20 dark:text-zinc-800 ml-4">
                  Hub
                </span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Identify your English level across all 4 skills to unlock your personalized mission roadmap.
              </p>
            </div>
          </div>

        </div>

        {/* Intelligence Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border border-border/40 rounded-2xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-700">
            <CardBody className="p-10 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                    Current {isTOEFL ? "Score" : "Band"}
                  </p>
                  <h3
                    className={`text-6xl font-black ${theme.text} tracking-tighter`}
                  >
                    {averages.band}
                  </h3>
                </div>
                <div
                  className={`${theme.bg} p-5 rounded-2xl ${theme.accent} shadow-inner`}
                >
                  <Target size={28} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border/10">
                <Trophy size={14} className="text-amber-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Personal Best:{" "}
                  <span className="text-foreground">{averages.best}</span>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="border border-border/40 rounded-2xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-700">
            <CardBody className="p-10 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">
                    Tests Completed
                  </p>
                  <h3 className="text-6xl font-black tracking-tighter">
                    {averages.tests}
                  </h3>
                </div>
                <div className={`${theme.bg} p-5 rounded-2xl ${theme.accent} shadow-inner`}>
                  <TrendingUp size={28} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border/10">
                <BarChart2 size={14} className="text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Performance Status:{" "}
                  <span className="text-foreground">Great Progress!</span>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card
            className={`border ${theme.border} rounded-2xl overflow-hidden shadow-xl bg-card/30 backdrop-blur-md relative`}
          >
            <div
              className={`absolute inset-0 bg-linear-to-br ${envMode === "IELTS" ? "from-emerald-500/5 to-transparent" : "from-blue-500/5 to-transparent"}`}
            />
            <CardBody className="p-10 flex flex-col justify-between h-full gap-10 relative z-10">
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${theme.text}`}>
                  <Award size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Goal Optimization
                  </span>
                </div>
                <p className="text-lg font-black tracking-tight uppercase">
                  Target Goal:{" "}
                  <span className="text-foreground ml-2">
                    {thresholdBand}
                    {!isTOEFL && ".0"}+
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                  This is the score required for 90% of your saved scholarships.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">
                    Exam Readiness
                  </span>
                  <span className={theme.text}>
                    {averages.band} / {maxScore}
                    {!isTOEFL && ".0"}
                  </span>
                </div>
                <div className="w-full bg-muted/40 h-4 rounded-full overflow-hidden p-1 border border-border/20 shadow-inner">
                  <motion.div
                    className={`h-full rounded-full primary-gradient`}
                    initial={{ width: 0 }}
                    animate={{ width: `${bandPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                {parseFloat(averages.band) >= thresholdBand && (
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${theme.text}`}
                  >
                    <Sparkles size={12} /> Target Met! You're ready.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tactical Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Action Module */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border border-primary/20 bg-card rounded-2xl shadow-sm">
              <CardBody className="p-10 flex flex-col gap-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="text-primary" size={20} />
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      Take Assessment
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Help you identify your level of language proficiency across all four skills.
                  </p>
                </div>

                <Button
                  onClick={handleStartExam}
                  disabled={loading}
                  className={`w-full h-16 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/20 transition-all duration-500 primary-gradient text-white hover:scale-[1.02] active:scale-95`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-3 size-5" /> Preparing Assessment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 size-5" /> START ASSESSMENT
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>

            {/* Visual Analytics */}
            {chartData.length > 1 && (
              <Card className="border border-border/40 rounded-2xl bg-card overflow-hidden">
                <CardBody className="p-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                      <BarChart2 className="text-primary" size={20} />{" "}
                      Performance Trend
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Last 7 Cycles
                    </span>
                  </div>
                  <div className="flex items-end gap-3 h-32">
                    {chartData.map((item, i) => {
                      const h = Math.max(
                        15,
                        (parseFloat(String(item.overallBand)) / maxScore) * 100,
                      );
                      return (
                        <div
                          key={item.id || i}
                          className="flex-1 flex flex-col items-center gap-4 group"
                        >
                          <div className="w-full relative flex flex-col items-center">
                            <span className={`absolute -top-6 text-[10px] font-black ${theme.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                              {item.overallBand}
                            </span>
                            <div className="w-full bg-muted/30 rounded-full h-32 flex flex-col justify-end p-1 border border-border/10">
                              <motion.div
                                className={`w-full ${theme.gradient.includes('emerald') ? 'bg-emerald-500' : 'bg-blue-600'} rounded-full shadow-sm`}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{
                                  delay: 0.1 * i,
                                  duration: 1,
                                  ease: "circOut",
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-muted-foreground/40 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString("en", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Records Module */}
          <div className="lg:col-span-7">
            <Card className="border border-border/40 rounded-2xl bg-card min-h-150 shadow-sm">
              <CardBody className="p-10 space-y-8">
                <div className="flex items-center justify-between border-b border-border/10 pb-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight">
                    Your Previous Results
                  </h3>
                  <Badge className="bg-muted text-muted-foreground border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest">
                    {historyData.length} RECORDS
                  </Badge>
                </div>

                {loadingStats ? (
                  <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <Loader2 className="animate-spin text-primary size-10 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                      Syncing Archive...
                    </p>
                  </div>
                ) : historyData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center gap-6">
                    <div className="p-8 rounded-full bg-muted/20">
                      <AlertCircle className="size-16 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black uppercase tracking-widest text-foreground">
                        Archive Empty
                      </p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">
                        Initiate your first diagnostic protocol to populate the
                        performance archive.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedHistoryData.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border border-border/40 hover:bg-muted/30 transition-all duration-500 group relative overflow-hidden"
                      >
                        <div className="flex items-center gap-8 flex-1 w-full sm:w-auto">
                          {/* Performance Indicator */}
                          <div
                            className={`w-20 h-20 rounded-2xl ${parseFloat(String(item.overallBand)) >= thresholdBand ? `${theme.bg} ${theme.text}` : `${theme.bg} ${theme.text}`} flex flex-col items-center justify-center shrink-0 border border-current/10 shadow-sm relative group-hover:scale-105 transition-transform duration-500`}
                          >
                            <span className="text-3xl font-black tracking-tighter leading-none">
                              {parseFloat(String(item.overallBand)).toFixed(1)}
                            </span>
                            <span className="text-[7px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                              Result
                            </span>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-sm tracking-widest uppercase">
                                {item.examType}{" "}
                                {item.isDiagnostic ? "LEVEL CHECK" : "PRACTICE TEST"}
                              </span>
                              <Badge
                                className={`text-[8px] font-black uppercase tracking-widest border-none ${item.isDiagnostic ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"}`}
                              >
                                {item.isDiagnostic ? "INITIAL" : "GRADUATION"}
                              </Badge>
                              <Badge className="text-[8px] font-black uppercase tracking-widest bg-muted text-muted-foreground border-none">
                                {item.difficulty || "Standard"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="opacity-40" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">
                                  {new Date(item.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            const normalizedItem = {
                              ...item,
                              testId: item.testId || item.test_id,
                            };
                            onViewResult(normalizedItem);
                          }}
                          className="h-14 px-8 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all bg-foreground text-background hover:bg-foreground/90 mt-4 sm:mt-0 w-full sm:w-auto shadow-lg"
                        >
                          View Breakdown
                          <ChevronRight
                            size={14}
                            className="ml-2 group-hover:translate-x-1 transition-transform"
                          />
                        </Button>
                      </motion.div>
                    ))}

                    {historyData.length > historyPageSize && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Showing {historyStart}-{historyEnd} of{" "}
                          {historyData.length}
                        </p>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setHistoryPage((page) => Math.max(1, page - 1))
                            }
                            disabled={safeHistoryPage === 1}
                            className="h-11 px-4 rounded-lg font-black uppercase tracking-widest text-[9px] border-border/60 bg-card"
                          >
                            <ChevronLeft size={14} className="mr-2" />
                            Previous
                          </Button>

                          <div className="min-w-24 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Page {safeHistoryPage} / {totalHistoryPages}
                          </div>

                          <Button
                            variant="outline"
                            onClick={() =>
                              setHistoryPage((page) =>
                                Math.min(totalHistoryPages, page + 1),
                              )
                            }
                            disabled={safeHistoryPage === totalHistoryPages}
                            className="h-11 px-4 rounded-lg font-black uppercase tracking-widest text-[9px] border-border/60 bg-card"
                          >
                            Next
                            <ChevronRight size={14} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
