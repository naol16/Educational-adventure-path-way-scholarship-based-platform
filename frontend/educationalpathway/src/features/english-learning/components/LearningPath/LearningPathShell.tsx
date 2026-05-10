"use client";

import React, { useState } from "react";
import { Loader2, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useLearningPath } from "./LearningPathContext";
import { SkillSidebar } from "./SkillSidebar";
import { SkillHorizontalNav } from "./SkillHorizontalNav";

export function LearningPathShell({ children }: { children: React.ReactNode }) {
  const { data, loading, error } = useLearningPath();

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary/20" strokeWidth={1} />
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">Loading your learning path...</p>
      </div>
    );
  }

  if (error === "Not found" || !data) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-10 px-6">
         <div className="mx-auto size-24 bg-muted rounded-2xl flex items-center justify-center border border-border/50 shadow-xl">
            <Compass className="h-10 w-10 text-muted-foreground" />
         </div>
         <div className="space-y-4">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Journey Locked</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
               Take the diagnostic test to unlock your personalized learning path.
            </p>
         </div>
         <Link href="/dashboard/learning-path/diagnostic/assessment">
            <Button className="h-11 px-10 rounded-lg primary-gradient text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl">Start Diagnostic Test</Button>
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary transition-colors duration-500 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full dark:opacity-100 opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full dark:opacity-100 opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-12 lg:py-16 flex flex-col gap-12">
        {/* Global Performance Header */}
        <SkillSidebar />
        
        <div className="space-y-12">
          <SkillHorizontalNav />
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
