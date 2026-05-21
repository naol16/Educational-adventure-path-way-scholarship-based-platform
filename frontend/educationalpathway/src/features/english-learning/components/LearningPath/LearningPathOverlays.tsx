import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, StopCircle, Loader2, Sparkles, X, ChevronDown, BookOpen } from "lucide-react";
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
  const [showSource, setShowSource] = useState(true);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-card rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-border/50"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-border/40 flex items-center justify-between bg-muted/20">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Unit Test: {activeTab}</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Quiz in Progress</p>
              </div>
              <Button variant="ghost" onClick={onClose} className="rounded-lg h-11 w-11 p-0 hover:bg-muted">
                <X size={24} className="text-muted-foreground" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-12 custom-scrollbar">
              {unitTestResults ? (
                <div className="text-center space-y-10 py-20">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`mx-auto size-32 rounded-full flex items-center justify-center ${unitTestResults.passed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                  >
                    {unitTestResults.passed ? <CheckCircle2 size={64} strokeWidth={1} /> : <AlertCircle size={64} strokeWidth={1} />}
                  </motion.div>
                  <div className="space-y-4">
                    <h3 className="text-6xl font-black tracking-tighter">{unitTestResults.score}%</h3>
                    <p className="text-xl font-bold uppercase tracking-widest">{unitTestResults.passed ? 'Passed' : 'Needs Review'}</p>
                    <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed italic">"{unitTestResults.feedback}"</p>
                  </div>
                  <Button onClick={onClose} className="h-11 px-10 rounded-lg primary-gradient text-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all">
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-16">
                  {(unitTestContent?.passage || unitTestContent?.script) && (
                    <div className="bg-muted/30 rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                      <button 
                        onClick={() => setShowSource(!showSource)}
                        className="w-full p-8 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 opacity-60">
                          <BookOpen size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Reading Material</span>
                        </div>
                        <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-500 ${showSource ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showSource && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-10 pb-10"
                          >
                            <div className="text-foreground text-lg leading-relaxed font-medium italic">
                              {unitTestContent.passage || unitTestContent.script}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  <div className="space-y-16">
                    {unitTestContent?.questions?.map((q: any, qi: number) => (
                      <div key={qi} className="space-y-10 relative">
                        <div className="absolute -left-4 top-0 text-6xl font-black text-muted-foreground/5 leading-none select-none">0{qi + 1}</div>
                        <h4 className="text-2xl font-black text-foreground tracking-tighter max-w-3xl relative z-10">
                          {q.question}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options?.map((opt: string, oi: number) => (
                            <button 
                              key={oi}
                              onClick={() => {
                                const newR = [...(unitTestContent.userResponses || [])];
                                newR[qi] = { selected: oi, isCorrect: oi === q.correct_answer };
                                setUnitTestContent({ ...unitTestContent, userResponses: newR });
                              }}
                              className={`group text-left p-8 rounded-2xl border transition-all text-sm font-bold duration-500 ${unitTestContent.userResponses?.[qi]?.selected === oi ? 'border-primary bg-primary/10 text-primary shadow-xl shadow-primary/5' : 'border-border/50 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground'}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`size-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black transition-all duration-500 ${unitTestContent.userResponses?.[qi]?.selected === oi ? 'bg-primary text-foreground' : 'bg-muted-foreground/10 group-hover:bg-primary/20 group-hover:text-primary text-muted-foreground'}`}>
                                  {String.fromCharCode(65 + oi)}
                                </div>
                                <span>{opt}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-12">
                    <Button 
                      onClick={() => onSubmit(unitTestContent.userResponses || [])}
                      disabled={isSubmitting || (unitTestContent?.questions?.length !== unitTestContent?.userResponses?.filter(Boolean).length)}
                      className="h-11 px-10 rounded-lg primary-gradient text-foreground font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-110 active:scale-95 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Answers'}
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
          className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-card rounded-2xl w-full max-w-xl p-12 space-y-12 border border-border/50 relative overflow-hidden"
          >
            {/* Background Ambience inside modal */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-blue-500" />
            
            <div className="text-center space-y-6 relative">
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="absolute -top-6 -right-6 rounded-lg h-11 w-11 p-0 hover:bg-muted"
              >
                <X size={24} className="text-muted-foreground" />
              </Button>
              <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-inner">
                <Sparkles size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Generate Lesson</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">AI Learning Assistant</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 px-4">Topic of Interest</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cognitive Psychology, Quantum Ethics..."
                  className="w-full h-16 px-8 rounded-full border border-border/60 bg-muted/30 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
                  id="missionTopicInput"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={onClose} className="flex-1 rounded-lg h-11 font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground">Cancel</Button>
              <Button 
                onClick={() => {
                  const topic = (document.getElementById('missionTopicInput') as HTMLInputElement).value;
                  if (topic) onGenerate(topic);
                }}
                disabled={isGenerating}
                className="flex-1 primary-gradient text-foreground rounded-lg h-11 font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : 'Generate'}
              </Button>
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
