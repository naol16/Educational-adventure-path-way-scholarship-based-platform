"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, StopCircle, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UnitTestOverlayProps {
  show: boolean;
  onClose: () => void;
  unitTestContent: any;
  setUnitTestContent: (content: any) => void;
  unitTestResults: any;
  onSubmit: (responses: any[]) => void;
  isSubmitting: boolean;
  activeTab: string;
}

export const UnitTestOverlay = ({
  show,
  onClose,
  unitTestContent,
  setUnitTestContent,
  unitTestResults,
  onSubmit,
  isSubmitting,
  activeTab
}: UnitTestOverlayProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl border"
          >
            <div className="p-8 border-b border-border/40 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight uppercase">Unit Test: {activeTab} Mastery</h2>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-40">Verification Protocol Active</p>
              </div>
                <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X size={20} className="text-muted-foreground" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12">
              {unitTestResults ? (
                <div className="text-center space-y-8 py-12">
                  <div className={`mx-auto size-24 rounded-full flex items-center justify-center ${unitTestResults.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {unitTestResults.passed ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-bold">{unitTestResults.score}%</h3>
                    <p className="text-xl font-medium">{unitTestResults.passed ? 'Mastery Verified' : 'Standard Not Met'}</p>
                    <p className="text-muted-foreground max-w-md mx-auto">{unitTestResults.feedback}</p>
                  </div>
                  <Button onClick={onClose} className="px-12 rounded-2xl primary-gradient text-white">
                    Close Protocol
                  </Button>
                </div>
              ) : (
                <div className="space-y-12">
                  {unitTestContent?.passage && (
                    <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-border/40 text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed shadow-sm">
                      {unitTestContent.passage}
                    </div>
                  )}
                  {unitTestContent?.script && (
                    <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-border/40 text-zinc-800 dark:text-zinc-200 text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm">
                      {unitTestContent.script}
                    </div>
                  )}
                  
                    <div className="space-y-12">
                      {unitTestContent?.questions?.map((q: any, qi: number) => (
                        <div key={qi} className="space-y-6">
                          <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex gap-3">
                            <span className="opacity-20">{qi + 1}.</span>
                            <span>{q.question}</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {q.options?.map((opt: string, oi: number) => (
                              <button 
                                key={oi}
                                onClick={() => {
                                  const newR = [...(unitTestContent.userResponses || [])];
                                  newR[qi] = { selected: oi, isCorrect: oi === q.correct_answer };
                                  setUnitTestContent({ ...unitTestContent, userResponses: newR });
                                }}
                                className={`text-left p-6 rounded-2xl border transition-all text-sm font-medium ${unitTestContent.userResponses?.[qi]?.selected === oi ? 'border-primary bg-primary/5 text-primary' : 'border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  <div className="flex justify-center pt-12 pb-8">
                    <Button 
                      onClick={() => onSubmit(unitTestContent.userResponses || [])}
                      disabled={isSubmitting || (unitTestContent?.questions?.length !== unitTestContent?.userResponses?.filter(Boolean).length)}
                      className="px-20 h-16 rounded-[25px] primary-gradient text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-primary/40 hover:scale-105 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Authorize Verification'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface DynamicMissionOverlayProps {
  show: boolean;
  onClose: () => void;
  onGenerate: (topic: string) => void;
  isGenerating: boolean;
}

export const DynamicMissionOverlay = ({
  show,
  onClose,
  onGenerate,
  isGenerating
}: DynamicMissionOverlayProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl p-10 space-y-8 shadow-xl border overflow-hidden relative"
          >
            <div className="text-center space-y-4 relative">
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="absolute -top-4 -right-4 rounded-full h-10 w-10 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={20} className="text-muted-foreground" />
              </Button>
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <Sparkles size={32} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold uppercase tracking-tight">AI Content Protocol</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Personalized Curricula Synthesis</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40 px-2">Focus Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g. Climate Change, Academic Research..."
                  className="w-full p-5 rounded-2xl border border-border/60 bg-slate-50/50 focus:outline-none focus:border-primary/40 transition-all text-sm font-medium"
                  id="missionTopicInput"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-14 font-medium">Cancel</Button>
              <Button 
                onClick={() => {
                  const topic = (document.getElementById('missionTopicInput') as HTMLInputElement).value;
                  if (topic) onGenerate(topic);
                }}
                disabled={isGenerating}
                className="flex-1 primary-gradient text-white rounded-2xl h-14 font-bold uppercase tracking-widest"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : 'Synthesize'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
