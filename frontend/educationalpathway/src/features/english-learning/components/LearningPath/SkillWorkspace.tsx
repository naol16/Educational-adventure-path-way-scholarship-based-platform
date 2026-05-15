"use client";

import React, { useState } from "react";
import { 
  Star, 
  Activity, 
  Target, 
  Compass, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  Circle, 
  Zap, 
  Loader2,
  Unlock,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useLearningPath } from "./LearningPathContext";
import { IntelligenceInsight } from "./IntelligenceInsight";
import { UnitTestOverlay } from "./LearningPathOverlays";
import Link from "next/link";

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

// ✅ CHANGE 1: Helper to calculate true mission completion (all videos + PDFs)
const calculateMissionCompletion = (mission: any): {
  isFullyComplete: boolean;
  completedResources: number;
  totalResources: number;
} => {
  const videos = mission.videos || [];
  const pdfs = mission.pdfs || [];
  const totalResources = videos.length + pdfs.length;
  
  const completedVideos = videos.filter((v: any) => v.isCompleted).length;
  const completedPdfs = pdfs.filter((p: any) => p.isCompleted).length;
  const completedResources = completedVideos + completedPdfs;
  
  return {
    isFullyComplete: completedResources === totalResources && totalResources > 0,
    completedResources,
    totalResources
  };
};

export function SkillWorkspace() {
  const { 
    data, 
    activeTab, 
    toggleVideo, 
    selectAnswer, 
    takeUnitTest, 
    submitTest, 
    finalizeSection,
    practiceAnswers,
    showExplanation,
    completedSections,
    envMode
  } = useLearningPath();

  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [showUnitTest, setShowUnitTest] = useState(false);
  const [unitTestContent, setUnitTestContent] = useState<any>(null);
  const [unitTestResults, setUnitTestResults] = useState<any>(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [loadingUnitTestIndex, setLoadingUnitTestIndex] = useState<number | null>(null);

  if (!data) return null;

  const currentSkill = data.skills[activeTab];
  const progress = data.current_progress_percentage || 0;
  const canLevelUp = progress >= 100;
  const modeData = data.learningMode?.[activeTab];
  const pQues = Array.isArray(modeData) ? modeData : (modeData?.questions || (modeData?.prompt ? [modeData] : []));
  const pComp = pQues.filter((q: any, idx: number) => (q.isCompleted || (practiceAnswers[activeTab]?.[idx] && practiceAnswers[activeTab]?.[idx].trim().length > 0))).length;
  const vTotal = currentSkill?.videos?.length || 0;
  const vComp = currentSkill?.videos?.filter(v => v.isCompleted).length || 0;

  const handleStartMission = (mIndex: number) => {
    setActiveMission(activeMission === mIndex ? null : mIndex);
  };

  const handleTakeUnitTest = async (mIndex: number) => {
    try {
       setLoadingUnitTestIndex(mIndex);
       setIsSubmittingTest(true);
       const res = await takeUnitTest(mIndex, activeTab, envMode);
       setUnitTestContent(res);
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
       const res = await submitTest(responses, activeTab, activeMission);
       setUnitTestResults(res);
    } catch (err) {} finally {
       setIsSubmittingTest(false);
    }
  };

  return (
    <main className="w-full space-y-24 pb-32">
      {/* Header Section */}
      <section className="space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Activity className="text-emerald-500 size-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Learning Path / Current Module</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
              {activeTab} <span className="text-muted-foreground/20 dark:text-zinc-800 ml-4">Mastery</span>
            </h2>
          </div>
          
          {/* ✅ CHANGE 4: Add retake assessment button */}
          <Link href={`/dashboard/learning-path/diagnostic/assessment?force=true&exam=${envMode}`}>
            <Button 
              className="h-10 px-4 rounded-lg font-black uppercase tracking-widest text-[8px] bg-background border border-border/60 text-foreground hover:bg-muted/30 shadow-sm transition-all hover:scale-105"
              title="Retake the diagnostic assessment to refresh your learning path"
            >
              <RefreshCw size={14} className="mr-2" /> RETAKE
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-12 pt-4">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground shadow-inner">
              <Activity size={28} strokeWidth={1} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Video Lessons</p>
              <p className="text-lg font-black text-foreground uppercase tracking-tight">{vComp} / {vTotal} Completed</p>
            </div>
          </div>
          <div className="h-12 w-px bg-border/40" />
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground shadow-inner">
              <Target size={28} strokeWidth={1} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Practice Progress</p>
              <p className="text-lg font-black text-foreground uppercase tracking-tight">{vComp + pComp} / {vTotal + pQues.length} Resolved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Insights - Strategic Directive */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="size-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module Overview</span>
          </div>
          <IntelligenceInsight 
            title="Learning Focus" 
            text={data.competencyGapAnalysis?.section_analysis?.[activeTab] || currentSkill?.notes || "Analyzing your progress for insights..."} 
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="size-2 bg-blue-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Goal</span>
          </div>
          {currentSkill?.missions?.[0]?.objective && (
            <IntelligenceInsight 
              title="Key Takeaway" 
              text={currentSkill.missions[0].objective} 
            />
          )}
        </div>
      </section>

      {/* Mission Pipeline */}
      <section className="space-y-16">
        <div className="flex items-center justify-between border-b border-border/40 pb-6">
          <div className="flex items-center gap-4">
            <Compass size={20} className="text-primary" />
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-foreground">Learning Modules</h3>
          </div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-1.5 rounded-full border border-border/40">
            {currentSkill.missions?.length} Lessons Available
          </div>
        </div>

        <div className="relative flex flex-col gap-10">
          <div className="absolute left-[40px] top-0 bottom-0 w-px bg-linear-to-b from-border/80 via-border/20 to-transparent hidden md:block" />

          {currentSkill.missions?.map((m: any, i: number) => {
            // ✅ CHANGE 1: Check if ALL resources in previous mission are complete
            const prevMissionStatus = i > 0 ? calculateMissionCompletion(currentSkill.missions[i - 1]) : null;
            const isLocked = i > 0 && !prevMissionStatus?.isFullyComplete;
            const isActive = activeMission === i && !isLocked;
            const isDone = m.isCompleted;
            
            // ✅ CHANGE 2: Calculate mission completion status
            const missionStatus = calculateMissionCompletion(m);
            
            return (
              <motion.div 
                key={i}
                layout
                className={`flex flex-col gap-4 p-8 rounded-2xl transition-all duration-700 ${isActive ? 'bg-muted/20 border border-border/40 shadow-sm' : 'border border-transparent'}`}
              >
                <div className="flex items-start gap-10">
                  <div className={`size-20 rounded-2xl shrink-0 flex items-center justify-center relative z-10 border transition-all duration-700 ${isDone ? 'bg-emerald-500 border-emerald-400 text-white shadow-2xl shadow-emerald-500/20' : isActive ? 'bg-foreground border-foreground text-background shadow-2xl shadow-foreground/20' : 'bg-muted border-border text-muted-foreground'}`}>
                    {isLocked ? <Lock size={28} /> : isDone ? <CheckCircle2 size={32} /> : <span className="text-2xl font-black">{i + 1}</span>}
                  </div>
                  
                  <div className="flex-1 pt-2 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDone ? 'text-emerald-500' : 'text-muted-foreground'}`}>{isDone ? 'Completed' : isLocked ? 'Locked' : 'In Progress'}</span>
                        <div className="h-px flex-1 bg-border/20" />
                      </div>
                      <h4 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">{m.title}</h4>
                      <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-3xl">{m.objective}</p>
                      
                      {/* Show progress for locked mission */}
                      {isLocked && prevMissionStatus && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-muted/20 rounded-lg border border-border/20">
                          <Lock size={12} className="text-muted-foreground/60" />
                          <span className="text-[9px] text-muted-foreground/70">Complete {prevMissionStatus.totalResources - prevMissionStatus.completedResources} more resource(s) to unlock</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleStartMission(i)}
                        disabled={isLocked}
                        className={`h-11 px-6 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all duration-500 ${isActive ? 'bg-foreground text-background' : isDone ? 'bg-muted text-muted-foreground' : 'bg-muted border border-border text-foreground hover:bg-muted/80 shadow-sm'}`}
                      >
                        {isActive ? 'Minimize' : isDone ? 'Review' : 'Start'}
                      </Button>
                      
                      {/* ✅ CHANGE 2: Unit test disabled until mission is fully complete */}
                      <Button 
                        onClick={() => handleTakeUnitTest(i)}
                        disabled={!missionStatus.isFullyComplete || m.isUnitTestCompleted || isSubmittingTest}
                        className={`h-11 px-6 rounded-lg font-black uppercase tracking-widest text-[9px] border transition-all duration-500 ${
                          !missionStatus.isFullyComplete
                            ? 'bg-muted/20 border-border/30 text-muted-foreground/50 cursor-not-allowed' 
                            : m.isUnitTestCompleted 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner' 
                              : 'bg-background border-border text-muted-foreground hover:border-border/80 shadow-sm'
                        }`}
                        title={!missionStatus.isFullyComplete ? `Complete all ${missionStatus.totalResources} resources to unlock the quiz` : ''}
                      >
                        {!missionStatus.isFullyComplete 
                          ? `Quiz Locked (${missionStatus.completedResources}/${missionStatus.totalResources})`
                          : m.isUnitTestCompleted 
                            ? 'Passed' 
                            : loadingUnitTestIndex === i 
                              ? <Loader2 size={16} className="animate-spin" /> 
                              : 'Take Quiz'
                        }
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Rest of the mission content remains the same */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-12 px-2 md:px-10 space-y-20"
                    >
                      <div className="h-px w-full bg-border/40" />
                      
                      {/* Videos section */}
                      <div className="space-y-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <PlayCircle size={18} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Video Materials</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {currentSkill?.videos?.map((v: any) => (
                            <div key={v.id} className="group relative bg-card border border-border/50 rounded-2xl p-8 flex items-center gap-8 hover:shadow-2xl transition-all duration-700">
                              <div className="size-28 rounded-xl overflow-hidden bg-muted relative shrink-0 shadow-lg">
                                <img src={v.thubnail} className="size-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                {v.videolink && (
                                  <a href={v.videolink} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all">
                                    <PlayCircle size={28} className="text-white" fill="currentColor" />
                                  </a>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xl font-black uppercase tracking-tight leading-tight mb-2 truncate">{v.title || 'Module Alpha'}</h5>
                                <button 
                                  onClick={() => toggleVideo(v.id, activeTab)}
                                  className={`flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest ${v.isCompleted ? 'text-emerald-500' : 'text-muted-foreground'}`}
                                >
                                  {v.isCompleted ? <><CheckCircle2 size={12} /> Done</> : <><Circle size={12} /> Standby</>}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Practice questions section - same as before */}
                      <div className="space-y-12 pb-16">
                         <div className="flex items-center gap-3">
                           <Zap size={18} className="text-amber-500" />
                           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Practice Questions</span>
                         </div>
                         <div className="space-y-16">
                            {pQues.map((q: any, idx: number) => (
                              <div key={idx} className="space-y-8 relative">
                                <div className="absolute -left-12 -top-4 text-[120px] font-black text-muted-foreground/5 leading-none select-none pointer-events-none">0{idx + 1}</div>
                                <h5 className="text-3xl md:text-4xl font-black text-foreground leading-tight tracking-tighter italic relative z-10 max-w-4xl">"{q.question || q.prompt}"</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {(q.options || q.choices)?.map((opt: string) => {
                                    const rev = showExplanation[activeTab]?.[idx];
                                    const correct = isCorrectOption(q.answer || q.correct_answer || q.correctAnswer, opt, q.options || q.choices);
                                    const selected = practiceAnswers[activeTab]?.[idx] === opt;
                                    return (
                                      <button 
                                        key={opt}
                                        disabled={rev}
                                        onClick={() => selectAnswer(activeTab, idx, opt)}
                                        className={`text-left p-6 rounded-lg text-sm font-bold border transition-all duration-700 ${rev ? (correct ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-inner' : selected ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 shadow-inner' : 'opacity-20 border-border/20') : 'bg-muted/30 border-border/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground shadow-sm'}`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                {showExplanation[activeTab]?.[idx] && (
                                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-10 bg-muted/20 rounded-2xl border-l-4 border-emerald-500 space-y-3 shadow-sm">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400">Explanation</span>
                                    <p className="text-base text-muted-foreground font-medium leading-relaxed italic">"{q.explanation || q.tips || q.sample_answer}"</p>
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

      {/* Sector Finalization - same as before */}
      <section className="flex flex-col items-center gap-24 py-48 border-t border-border/40">
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="size-32 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10">
            <CheckCircle2 size={56} strokeWidth={1} />
          </div>
          <div className="space-y-6">
            <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Complete Module</h3>
            <p className="text-xl text-muted-foreground font-medium max-w-xl mx-auto">Save your progress and move on to the next level.</p>
          </div>
          <Button
            onClick={() => finalizeSection(activeTab)}
            disabled={completedSections[activeTab]}
            className={`px-12 h-11 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-700 shadow-xl ${completedSections[activeTab] ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-foreground/20'}`}
          >
            {completedSections[activeTab] ? "Completed" : `Finish ${activeTab}`}
          </Button>
        </div>

        {/* Final Exam section - same as before */}
        <div className={`w-full py-20 transition-all duration-1000 ${canLevelUp ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="space-y-8 flex-1">
              <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] ${canLevelUp ? 'bg-primary/10 text-primary' : 'bg-muted border border-border/40'}`}>
                {canLevelUp ? <Unlock size={14} className="animate-bounce" /> : <Lock size={14} />} Final Exam
              </div>
              <div className="space-y-3">
                <h3 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">Final <br/> Test</h3>
                <p className={`text-xl font-medium leading-tight max-w-2xl ${canLevelUp ? 'opacity-80' : 'text-muted-foreground/60'}`}>
                  {canLevelUp 
                    ? "You have completed all modules. You are now ready to take the final exam." 
                    : "Complete all sections to unlock the final exam."}
                </p>
              </div>
            </div>
            <Link href={canLevelUp ? "/dashboard/learning-path/final/assessment" : "#"}>
              <Button 
                disabled={!canLevelUp} 
                className={`rounded-lg h-11 px-10 font-black uppercase tracking-widest text-[11px] transition-all duration-700 ${canLevelUp ? 'bg-primary text-white hover:scale-105 shadow-2xl' : 'bg-muted/50 border border-border/20 text-muted/20'}`}
              >
                {canLevelUp ? "Start Final Exam" : "Locked"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
    </main>
  );
}
