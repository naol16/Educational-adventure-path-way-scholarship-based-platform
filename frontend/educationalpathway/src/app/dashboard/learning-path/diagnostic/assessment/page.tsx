"use client";

import { useState, useEffect } from "react";
import { AssessmentDashboard } from "@/features/assessments/components/AssessmentDashboard";
import { AssessmentTest } from "@/features/assessments/components/AssessmentTest";
import { AssessmentResultView } from "@/features/assessments/components/AssessmentResultView";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type View = "setup" | "test" | "result";

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

export default function DiagnosticAssessmentPage() {
  const [view, setView] = useState<View>("setup");
  const [activeTest, setActiveTest] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<ProgressItem | null>(null);

  // Transition to test
  const handleStartTest = (data: any) => {
    setActiveTest(data);
    setView("test");
  };

  // Transition to result
  const handleViewResult = (item: ProgressItem) => {
    setSelectedResult(item);
    setView("result");
  };

  if (view === "test" && activeTest) {
    return (
      <AssessmentTest
        examData={activeTest}
        onComplete={() => {
          setActiveTest(null);
          setView("setup");
        }}
      />
    );
  }

  if (view === "result" && selectedResult) {
    return (
      <AssessmentResultView
        testId={selectedResult.testId || selectedResult.test_id || ""}
        examType={selectedResult.examType}
        difficulty={selectedResult.difficulty}
        initialData={selectedResult.evaluation}
        onBack={() => {
          setSelectedResult(null);
          setView("setup");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="pb-20"
        >
          {/* Immersive Header for Diagnostic */}
          <div className="bg-muted/30 border-b border-border/40 py-12 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link 
                href="/dashboard/learning-path"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-black uppercase tracking-widest mb-8"
              >
                <ChevronLeft size={14} /> Back to Learning Path
              </Link>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Compass size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Your Starting Point</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">
                    Assessment <span className="text-muted-foreground/30 ml-2">Hub</span>
                  </h1>
                  <p className="text-muted-foreground max-w-xl font-medium">
                    Take this test to identify your strengths and weaknesses. We will use your results to create a personalized study plan just for you.
                  </p>
                </div>
                
                <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Duration</p>
                    <p className="text-sm font-bold text-foreground">45-60 Minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AssessmentDashboard
            onStartTest={handleStartTest}
            onViewResult={handleViewResult}
            isDiagnostic={true}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
