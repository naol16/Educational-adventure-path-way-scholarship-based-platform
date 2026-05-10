"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLearningPath } from "./LearningPathContext";
import { useRouter } from "next/navigation";

function SkillTab({ label, value, color, active, onClick }: { label: string, value: number, color: string, active?: boolean, onClick: () => void }) {
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference - (value * circumference);

    return (
        <button 
          onClick={onClick}
          className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-500 min-w-[160px] relative ${
            active 
              ? 'bg-card border border-border/50 shadow-sm' 
              : 'hover:bg-muted/30 border border-transparent'
          }`}
        >
            <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44">
                    <circle className="text-muted/10 stroke-current" strokeWidth="2.5" cx="22" cy="22" r="18" fill="transparent" />
                    <circle 
                        className="stroke-current transition-all duration-1000 ease-out" 
                        style={{ color, strokeDasharray: circumference, strokeDashoffset }}
                        strokeWidth="2.5" 
                        strokeLinecap="round" cx="22" cy="22" r="18" fill="transparent" 
                    />
                </svg>
                <span className="text-[9px] font-black text-foreground">{Math.round(value * 100)}%</span>
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{label}</span>
              <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${active ? 'text-emerald-500' : 'text-muted-foreground opacity-60'}`}>
                {active ? 'In Progress' : 'Pending'}
              </span>
            </div>
            {active && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary/20 pointer-events-none"
                />
            )}
        </button>
    );
}

export function SkillHorizontalNav() {
  const { data, activeTab } = useLearningPath();
  const router = useRouter();

  if (!data) return null;

  const handleSkillClick = (skill: string) => {
    router.push(`/dashboard/learning-path/${skill}`);
  };

  const colors: Record<string, string> = { 
    reading: '#10B981', 
    listening: '#3B82F6', 
    writing: '#8B5CF6', 
    speaking: '#F59E0B' 
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {Object.keys(data.skills).map((skill) => {
        const skillData = data.skills[skill];
        
        const getSkillQuestions = (learningMode: any, s: string) => {
          const modeData = learningMode?.[s];
          return Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
        };

        const vP = skillData?.videos?.length ? skillData.videos.filter(v => v.isCompleted).length / skillData.videos.length : 0;
        const lP = getSkillQuestions(data.learningMode, skill).filter((q: any) => q.isCompleted).length / Math.max(1, getSkillQuestions(data.learningMode, skill).length);
        const totalP = (vP * 0.5) + (lP * 0.5);

        return (
          <SkillTab 
            key={skill} 
            label={skill} 
            value={totalP} 
            color={colors[skill]} 
            active={activeTab === skill}
            onClick={() => handleSkillClick(skill)}
          />
        );
      })}
    </div>
  );
}
