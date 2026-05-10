"use client";

import React from "react";
import { Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import { useLearningPath } from "./LearningPathContext";
import { useRouter } from "next/navigation";

const levelConfig: Record<string, { label: string; color: string; border: string; bg: string }> = {
  easy: { label: "Foundation", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  medium: { label: "Intermediate", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  hard: { label: "Advanced", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

function SkillGauge({ label, value, color, active, onClick }: { label: string, value: number, color: string, active?: boolean, onClick: () => void }) {
    const circumference = 2 * Math.PI * 22;
    const strokeDashoffset = circumference - (value * circumference);

    return (
        <div 
          onClick={onClick}
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 cursor-pointer ${active ? 'bg-muted/50 border border-border/50 shadow-sm' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
        >
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

export function SkillSidebar() {
  const { data, envMode, setEnvMode } = useLearningPath();

  if (!data) return null;

  const progress = data.current_progress_percentage || 0;

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-border/40">
      {/* Branding & Environment */}
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest leading-tight">Pathfinder</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Smart Learning System</p>
          </div>
        </div>
        
        <div className="h-10 w-px bg-border/40 hidden sm:block" />
        
        <div className="flex items-center gap-4">
          <EnvironmentSwitcher mode={envMode} onChange={setEnvMode} />
          <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-block ${levelConfig[data.proficiencyLevel].bg} ${levelConfig[data.proficiencyLevel].color} border-border/40 whitespace-nowrap`}>
            Tier: {levelConfig[data.proficiencyLevel].label}
          </div>
        </div>
      </div>

      {/* Progress & Performance Card */}
      <div className="w-full md:w-auto min-w-[340px] p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-xl space-y-4 shadow-sm flex flex-col justify-center">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Progress</span>
            <div className="text-3xl font-black text-foreground leading-none">{progress}%</div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20 whitespace-nowrap">
            <TrendingUp size={10} />
            +12% Increase
          </div>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-500"
          />
        </div>
      </div>
    </div>
  );
}

