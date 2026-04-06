"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getLearningPath, trackProgress } from "@/features/assessments/api/assessment-api";
import Link from "next/link";

interface Video {
  id: number;
  videolink: string;
  thubnail: string;
  title?: string;
  isCompleted?: boolean;
}

interface SkillData {
  videos: Video[];
  notes: string;
}

interface LearningPathData {
  proficiencyLevel: 'easy' | 'medium' | 'hard';
  skills: Record<string, SkillData>;
  learningMode?: Record<string, any[]>;
  competencyGapAnalysis?: any;
  curriculumMap?: any;
  current_progress_percentage?: number;
}

const levelConfig: Record<string, { label: string; color: string; border: string; bg: string }> = {
  easy: { label: "Beginner", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  medium: { label: "Intermediate", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  hard: { label: "Advanced", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
};

const skillIcons: Record<string, any> = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenLine,
  speaking: Mic,
};

export function LearningPathView() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("reading");
  const [error, setError] = useState<string | null>(null);
  
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, Record<number, string>>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, Record<number, boolean>>>({});

  const load = async () => {
    try {
      setLoading(true);
      const res = await getLearningPath();
      const pathData = res?.skills ? res : (res?.data?.skills ? res.data : null);
      if (pathData) {
        setData(pathData);
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

  useEffect(() => { load(); }, []);

  const handleToggleComplete = async (videoId: number, currentState: boolean) => {
    try {
      if (data) {
        const newData = { ...data };
        const video = newData.skills[activeTab].videos.find(v => v.id === videoId);
        if (video) {
          video.isCompleted = !currentState;
          setData(newData);
        }
      }
      await trackProgress(videoId, activeTab.charAt(0).toUpperCase() + activeTab.slice(1), !currentState);
    } catch (err) { load(); }
  };

  const handleSelectAnswer = (skill: string, qIndex: number, answer: string) => {
    setPracticeAnswers(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: answer } }));
    setShowExplanation(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: true } }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Constructing Curriculum Matrix...</p>
      </div>
    );
  }

  if (error === "Not found") {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-10">
         <div className="mx-auto w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary/60" />
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Active Matrix Required</h2>
            <p className="text-muted-foreground font-normal text-base leading-relaxed">
               Please complete your diagnostic assessment to initialize your specialized curriculum roadmap.
            </p>
         </div>
         <Link href="/dashboard/assessment">
            <Button size="lg" className="primary-gradient px-12 h-12 rounded-xl shadow-none font-medium">
               Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
         </Link>
      </div>
    );
  }

  if (!data || !data.skills) return null;

  const currentSkill = data.skills[activeTab];
  const vComp = currentSkill?.videos?.filter(v => v.isCompleted).length || 0;
  const vTotal = currentSkill?.videos?.length || 0;
  const pQues = data.learningMode?.[activeTab] || [];
  const pComp = Object.keys(practiceAnswers[activeTab] || {}).length;
  const pTotal = pQues.length;
  const progress = vTotal + pTotal > 0 ? Math.round(((vComp + pComp) / (vTotal + pTotal)) * 100) : 0;
  const canLevelUp = progress >= 80;

  return (
    <div className="space-y-16 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      {/* PROFESSIONAL FEED HEADER */}
      <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-end justify-between border-b border-border/60 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <span className={`px-4 py-1 rounded-full border text-[10px] font-medium uppercase tracking-widest ${levelConfig[data.proficiencyLevel].color} ${levelConfig[data.proficiencyLevel].bg} ${levelConfig[data.proficiencyLevel].border}`}>
               Level: {levelConfig[data.proficiencyLevel].label}
             </span>
             <span className="flex items-center gap-1.5 text-muted-foreground font-medium text-[10px] uppercase tracking-widest opacity-40">
               <History size={12} /> Sync Status: Active
             </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight leading-none uppercase">Curriculum Feed</h1>
            <p className="text-muted-foreground font-normal text-base">Results-driven study roadmap for specialized domains.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
           <div className="text-right space-y-1">
              <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-[0.2em] opacity-40">Total Mastery</p>
              <p className="text-4xl font-semibold text-primary leading-none">{progress}%</p>
           </div>
           <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                 <circle className="text-muted/10 stroke-current" strokeWidth="4" cx="50" cy="50" r="46" fill="transparent" />
                 <circle className="text-primary stroke-current transition-all duration-1000 ease-out" 
                         strokeWidth="4" strokeDasharray={`${progress * 2.89} 289`} 
                         strokeLinecap="round" cx="50" cy="50" r="46" fill="transparent" />
              </svg>
              <Trophy size={20} className="text-primary" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-1 space-y-12">
           <div className="space-y-4">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] px-2 text-muted-foreground opacity-40">Skill Selection</h4>
              <div className="space-y-1">
                 {Object.keys(data.skills).map((skill) => {
                    const Icon = skillIcons[skill];
                    const active = activeTab === skill;
                    return (
                       <button 
                         key={skill}
                         onClick={() => setActiveTab(skill)}
                         className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 font-medium uppercase text-[11px] tracking-widest ${active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/40"}`}
                       >
                          <div className="flex items-center gap-4">
                             <Icon size={14} className={active ? "text-white" : "text-primary/70"} />
                             <span>{skill}</span>
                          </div>
                          <ChevronRight size={12} className={active ? "opacity-100" : "opacity-0"} />
                       </button>
                    )
                 })}
              </div>
           </div>

           <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6 grayscale opacity-80">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary/60">
                 <BarChart3 size={18} />
              </div>
              <div className="space-y-2">
                 <h5 className="text-[10px] font-medium uppercase tracking-widest leading-none">Promotion Target</h5>
                 <p className="text-[11px] font-normal text-muted-foreground leading-relaxed">Coverage &gt; 80% initiates specialized tier-elevation evaluation protocol.</p>
              </div>
           </div>
        </div>

        {/* MAIN FEED */}
        <div className="lg:col-span-3 space-y-24">
           <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-24">
                 
                 {/* COMPETENCY STRATEGY */}
                 <section className="space-y-10">
                    <div className="flex items-center gap-2 px-2">
                       <span className="h-1 w-4 bg-primary/40 rounded-full" />
                       <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/70">01 / Competency Strategy</h2>
                    </div>

                    <div className="space-y-12">
                       <div className="space-y-6">
                          <h3 className="text-2xl font-semibold tracking-tight">Gap Analysis Summary</h3>
                          <div className="max-w-4xl text-lg font-normal leading-relaxed text-foreground/80 italic">
                             "{data.competencyGapAnalysis?.proficiency_profile || "Analyzing student response profile..."}"
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                             {data.competencyGapAnalysis?.weaknesses?.map((w: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-red-500/5 text-red-600 rounded-full text-[10px] font-medium uppercase border border-red-200/10 tracking-widest">{w}</span>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4 pt-10 border-t border-border/50">
                          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-primary/50">
                             <BookMarked size={14} /> Subject Directive
                          </div>
                          <div className="text-sm font-normal text-muted-foreground/90 leading-relaxed max-w-4xl whitespace-pre-wrap">
                             {data.competencyGapAnalysis?.section_analysis?.[activeTab] || currentSkill?.notes}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* CURRICULUM MODULES */}
                 <section className="space-y-10">
                    <div className="flex items-center gap-2 px-2">
                       <span className="h-1 w-4 bg-primary/40 rounded-full" />
                       <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/70">02 / Curriculum Modules</h2>
                    </div>

                    <div className="space-y-24">
                       {/* Video Modules */}
                       <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                             <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-40">Instructional Log Feed</h4>
                             <span className="text-[9px] font-medium uppercase tracking-widest text-primary/60">{vComp} / {vTotal} COMPLETED</span>
                          </div>
                          
                          <div className="divide-y divide-border/60">
                             {currentSkill?.videos?.map((v, i) => (
                               <div key={v.id} className="flex items-center py-6 gap-8 group">
                                  <button onClick={() => handleToggleComplete(v.id, !!v.isCompleted)} className={`${v.isCompleted ? 'text-primary' : 'text-muted-foreground/10 hover:text-primary transition-colors'}`}>
                                     {v.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                  </button>
                                  <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-8">
                                     <div className="h-14 w-14 bg-slate-50 rounded-full shrink-0 flex items-center justify-center text-slate-300 overflow-hidden relative border border-border/40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all">
                                        <img src={v.thubnail} className="h-full w-full object-cover" />
                                        {v.videolink && (
                                          <a href={v.videolink} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 text-white transition-all opacity-0 hover:opacity-100"><PlayCircle size={18} /></a>
                                        )}
                                     </div>
                                     <div className="flex-1 space-y-1">
                                        <p className={`text-lg font-medium tracking-tight ${v.isCompleted ? 'text-muted-foreground line-through opacity-40' : 'text-foreground/90'}`}>{v.title || `Instructional Module 0${i + 1}`}</p>
                                        <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-widest text-muted-foreground opacity-30">
                                           <span>TIER {data.proficiencyLevel.toUpperCase()}</span>
                                           <span className="h-1 w-1 bg-border rounded-full" />
                                           <span>LOG MODULE</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Practice Matrix */}
                       <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                             <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-40">Practical Application Matrix</h4>
                             <span className="text-[9px] font-medium uppercase tracking-widest text-primary/60">{pComp} / {pTotal} RESOLVED</span>
                          </div>
                          
                          <div className="divide-y divide-border/60">
                             {pQues.length > 0 ? pQues.map((q, idx) => (
                               <div key={idx} className="py-12 space-y-8">
                                  <div className="space-y-4">
                                     <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full border border-primary/20 flex items-center justify-center text-[9px] font-medium text-primary opacity-60">0{idx + 1}</div>
                                        <h5 className="text-xl font-medium tracking-tight leading-tight italic text-foreground/80">"{String(q.question || q.prompt)}"</h5>
                                     </div>
                                     
                                     {q.options ? (
                                       <div className="grid md:grid-cols-2 gap-3 max-w-3xl pt-2">
                                          {q.options.map((opt: string) => {
                                            const rev = showExplanation[activeTab]?.[idx];
                                            const correct = opt === q.answer;
                                            const selected = practiceAnswers[activeTab]?.[idx] === opt;
                                            return (
                                               <button key={opt} disabled={rev} onClick={() => handleSelectAnswer(activeTab, idx, opt)}
                                                       className={`text-left p-4 rounded-xl text-sm font-medium transition-all border tracking-tight ${rev ? correct ? 'bg-success/5 border-success text-success' : selected ? 'bg-destructive/5 border-destructive text-destructive' : 'bg-muted border-transparent opacity-40' : 'bg-muted/20 border-transparent hover:border-primary/40'}`}>
                                                  {opt}
                                               </button>
                                            )
                                          })}
                                       </div>
                                     ) : (
                                       <div className="p-8 bg-slate-50/50 border border-border/60 rounded-2xl">
                                          <textarea className="w-full bg-transparent text-lg font-normal placeholder:text-muted-foreground/20 focus:outline-none min-h-[120px] tracking-tight"
                                                    placeholder="Input formalized response transcript..." onBlur={(e) => handleSelectAnswer(activeTab, idx, e.target.value)} />
                                       </div>
                                     )}

                                     {showExplanation[activeTab]?.[idx] && (
                                       <div className="p-6 bg-indigo-50/40 border-l border-indigo-400 rounded-r-2xl animate-in fade-in duration-700">
                                          <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-indigo-500 mb-3 opacity-60">
                                             <Sparkles size={12} /> Evaluative Appraisal
                                          </div>
                                          <div className="text-base font-normal text-indigo-900 leading-relaxed italic max-w-4xl opacity-90">
                                             "{String(q.explanation || q.tips || q.sample_answer || q.sample_response)}"
                                          </div>
                                       </div>
                                     )}
                                  </div>
                               </div>
                             )) : (
                               <div className="py-20 flex flex-col items-center justify-center text-center opacity-10">
                                  <Lock size={32} className="mb-4" />
                                  <p className="text-[10px] font-medium uppercase tracking-widest">Protocol Sync Pending</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* PROMOTION PROTOCOL */}
                 <div className="pt-24 border-t border-border/40">
                    <div className="flex flex-col items-center text-center space-y-10 py-8">
                       <div className="relative">
                          <div className={`absolute -inset-8 rounded-full blur-3xl transition-all duration-1000 ${canLevelUp ? 'bg-primary/10' : 'bg-neutral-50'}`} />
                          <div className={`relative h-20 w-20 rounded-full border-2 flex items-center justify-center bg-white transition-all ${canLevelUp ? 'border-primary text-primary' : 'border-slate-100 text-slate-200'}`}>
                             {canLevelUp ? <ArrowUpCircle size={44} /> : <Lock size={32} />}
                          </div>
                       </div>
                       
                       <div className="space-y-3 max-w-xl">
                          <h3 className="text-3xl font-semibold tracking-tighter uppercase leading-none">{canLevelUp ? "Tier Promotion Authorization" : "Mastery Protocol Active"}</h3>
                          <p className="text-muted-foreground font-normal text-base leading-relaxed opacity-80">
                             {canLevelUp ? `Metric threshold verified. Authorization for ${data.proficiencyLevel.toUpperCase()} Tier Re-Assessment is currently active.`
                                         : `System adherence required. Cumulative module coverage must exceed 80% to authorize specialized evaluation.`}
                          </p>
                       </div>

                       <Link href={canLevelUp ? "/dashboard/assessment" : "#"}>
                          <Button disabled={!canLevelUp} size="lg" className={`px-16 h-14 rounded-full transition-all border-0 shadow-none font-medium ${canLevelUp ? 'primary-gradient text-white' : 'bg-muted text-muted-foreground opacity-50'}`}>
                             {canLevelUp ? "Initialize Re-Assessment" : "Progress Insufficient"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                       </Link>
                    </div>
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
