'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

interface PracticeDrillOverlayProps {
  skill: string;
  examType: string;
  questions: any[];
  onClose: () => void;
  onComplete: () => void;
}

export function PracticeDrillOverlay({ skill, examType, questions, onClose, onComplete }: PracticeDrillOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Fallback to default questions if empty
  const drillQuestions = questions && questions.length > 0 ? questions : [
    {
      question: 'What does the author suggest about the decline in coal usage?',
      options: [
        'It aligned with the steady, incremental projections of leading analysts.',
        'It represented a sharp and unexpected decrease compared to estimates.',
        'It was driven entirely by advancements in industrial metallurgical processes.',
        'It occurred simultaneously and uniformly across all global economic sectors.'
      ],
      correct_answer: 1, // index 1 (B)
      explanation: 'The author uses "plummeted" as a synonym for "sharp decrease", directly contrasting with the "steady, incremental displacement" projected by experts.'
    }
  ];

  const currentQ = drillQuestions[currentIndex];
  // Ensure options is an array
  const currentOptions = Array.isArray(currentQ.options) ? currentQ.options : (currentQ.choices || []);

  const handleSelect = (idx: number) => {
    setSelectedOption(idx.toString());
    setShowFeedback(true);
    // Trigger haptic feedback if available
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleNext = () => {
    if (currentIndex < drillQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#0B1F2A] text-foreground overflow-hidden flex flex-col font-sans"
         style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border bg-[#0B1F2A]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center border border-[#10B981]/30">
            <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
          </div>
          <span className="text-sm font-medium tracking-widest text-foreground/70 uppercase">Active Protocol: Reading Comprehension</span>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded border border-border hover:bg-muted/50 transition-colors text-sm font-medium"
        >
          ABORT DRILL <X className="w-4 h-4" />
        </button>
      </header>

      {/* Progress Bar & Timer */}
      <div className="px-12 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-light">Question {currentIndex + 1} of {drillQuestions.length}</h2>
          <div className="flex items-center gap-2 text-[#10B981]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
            </span>
            <span className="font-mono text-lg">Active</span>
          </div>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-[#10B981] shadow-[0_0_10px_#10B981] transition-all duration-500" style={{ width: `${((currentIndex + 1) / drillQuestions.length) * 100}%` }} />
        </div>
      </div>

      {/* Dual-Pane Body */}
      <div className="flex-1 flex overflow-hidden px-12 pb-12 gap-12 mt-6">
        
        {/* Left: Source Document (Optional, only if passage/script exists) */}
        {(currentQ.passage || currentQ.script || currentQ.prompt) && (
        <div className="flex-1 bg-muted/50 border border-border rounded-xl p-8 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-6 text-[#10B981]">
            <div className="w-5 h-5 rounded flex items-center justify-center border border-[#10B981]/50 bg-[#10B981]/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <span className="text-xs font-bold tracking-wider uppercase">Reference Material</span>
          </div>
          
          <div className="space-y-6 text-lg text-foreground/80 font-serif leading-relaxed">
            <p className="whitespace-pre-wrap">
              {currentQ.passage || currentQ.script || currentQ.prompt}
            </p>
          </div>
        </div>
        )}

        {/* Right: Question Console */}
        <div className="flex-1 flex flex-col relative">
          <h3 className="text-xl font-medium mb-8 leading-relaxed">
            {currentQ.question || "Answer the following question based on the material:"}
          </h3>
          
          <div className="space-y-4">
            {currentOptions.map((optText: string, idx: number) => {
              const optId = idx.toString();
              const isSelected = selectedOption === optId;
              
              // Helper to normalize the correct answer from backend (could be string like "A", index like 0, or the string itself)
              const getIsCorrect = () => {
                if (currentQ.correct_answer !== undefined) {
                  if (typeof currentQ.correct_answer === 'number') return idx === currentQ.correct_answer;
                  const letterMatch = ['A','B','C','D'].indexOf(currentQ.correct_answer.toString().toUpperCase());
                  if (letterMatch !== -1) return idx === letterMatch;
                  return currentQ.correct_answer.toString().toLowerCase() === optText.toLowerCase();
                }
                return false; // If no correct answer provided, we don't show correct/incorrect styling accurately
              };
              
              const isCorrect = getIsCorrect();
              const displayLetter = ['A','B','C','D'][idx] || idx.toString();
              
              let borderClass = 'border-border';
              let bgClass = 'bg-muted/50 hover:bg-muted';
              
              if (isSelected && showFeedback) {
                if (isCorrect) {
                  borderClass = 'border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                  bgClass = 'bg-[#10B981]/10';
                } else {
                  borderClass = 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
                  bgClass = 'bg-red-500/10';
                }
              } else if (showFeedback && isCorrect) {
                borderClass = 'border-[#10B981]/50';
                bgClass = 'bg-[#10B981]/5';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showFeedback}
                  className={`w-full text-left p-6 rounded-xl border transition-all duration-300 flex items-start gap-6 cursor-pointer ${borderClass} ${bgClass}`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-lg border transition-colors
                    ${isSelected && showFeedback && isCorrect ? 'bg-[#10B981] border-[#10B981] text-foreground' : 
                      isSelected && showFeedback && !isCorrect ? 'bg-red-500 border-red-500 text-foreground' : 
                      'border-border text-muted-foreground'}`}
                  >
                    {displayLetter}
                  </div>
                  <span className="text-lg text-foreground leading-relaxed pt-1">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Verification Feedback Panel */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-[#0B1F2A]/95 border border-[#10B981] rounded-xl p-6 shadow-[0_-10px_40px_rgba(16,185,129,0.15)] backdrop-blur-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#10B981] font-bold tracking-wide flex items-center gap-2">
                        DATA VERIFIED <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                      </span>
                    </div>
                    <p className="text-foreground mb-2">
                      Your logic matches <span className="text-[#10B981] font-bold border-b border-[#10B981]">Band 8.5</span> standards.
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Explanation: {currentQ.explanation || 'Review the source document to understand why this option is correct.'}
                    </p>
                  </div>
                  <button 
                    onClick={handleNext}
                    className="shrink-0 bg-linear-to-r from-[#10B981] to-[#0FB58C] hover:from-[#0FB58C] hover:to-[#0a9471] text-foreground px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  >
                    {currentIndex < drillQuestions.length - 1 ? 'NEXT METRIC' : 'COMPLETE DRILL'} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
