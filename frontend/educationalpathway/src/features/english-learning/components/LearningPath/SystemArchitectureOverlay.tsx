import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Database, 
  BrainCircuit, 
  Network, 
  LayoutTemplate,
  Activity,
  ArrowRight
} from "lucide-react";

interface SystemArchitectureOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemArchitectureOverlay({ isOpen, onClose }: SystemArchitectureOverlayProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-xl transition-all"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-card border border-border/50 shadow-2xl rounded-[40px] overflow-hidden my-auto z-10"
        >
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-border/40 bg-muted/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-emerald-500 to-purple-500" />
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-emerald-500 mb-4">
                  <Network size={24} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Architecture</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tighter">
                  Pipeline Operations
                </h2>
                <p className="text-muted-foreground font-medium max-w-2xl text-sm leading-relaxed">
                  A breakdown of how the Assessment and Learning Path systems are architected and interact together on the backend, operating as a continuous, AI-driven pipeline.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-muted hover:bg-muted/80 rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto space-y-12 bg-background/50">
            
            {/* Phase 1 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">1. Assessment Phase</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Data Collection & AI Grading</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-tight">Submission & Pipeline</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The frontend sends raw test answers to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">AssessmentController</code>. The backend passes the submission to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">AIService</code> asynchronously via a BullMQ worker queue to prevent timeouts.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-tight">The AI Report & Storage</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The LLM evaluates answers returning: Band Scores, Competency Gap Analysis, Section Notes, and dynamic Learning Mode Sections. Saved to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">AssessmentResult</code> bound to the specific examType.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">2. The Generation Engine</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Building the Curriculum</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-tight">Lookup & Generation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Checks the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">LearningPath</code> table. If no path exists, it finds the diagnostic result and triggers auto-generation based on the user's mapped proficiency tier (easy, medium, hard).
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-tight">Material Assembly</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Queries <code className="text-xs bg-muted px-1.5 py-0.5 rounded">VideoService</code> and <code className="text-xs bg-muted px-1.5 py-0.5 rounded">PdfService</code> for tier-matching materials. Injects custom practice questions generated by the AI during assessment.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-tight">Database Persistence</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Assembled curriculum is saved. IELTS and TOEFL are stored as strictly separate rows, ensuring data integrity and zero cross-contamination.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                  <LayoutTemplate size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">3. Mission Formatting</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery to the UI</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-tight">Catalogs & Ruleset</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Backend uses static catalogs to define narrative structure. It chunks raw database materials into strict Missions, enforcing exactly 5 videos and 1 PDF per mission.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-tight">Dynamic Placeholders</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If the database lacks sufficient materials for a specific tier/skill, the backend generates placeholders on the fly to preserve UI layout integrity.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">4. Tracking & Micro-Evaluations</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time Synchronization</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Progress Tracking:</strong> Actions hit <code className="text-xs bg-muted px-1.5 py-0.5 rounded">markComplete</code>, inserting rows into <code className="text-xs bg-muted px-1.5 py-0.5 rounded">LearningPathProgress</code>. The backend dynamically calculates <code className="text-xs bg-muted px-1.5 py-0.5 rounded">isCompleted</code> booleans to lock/unlock missions.
                </p>
                <div className="h-px bg-border/40 w-full" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Unit Tests & Speaking:</strong> Completed missions unlock tests. Submissions are sent back to the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">AIService</code> for micro-evaluations, providing real-time feedback without full diagnostic tests.
                </p>
              </div>
            </div>

            {/* Summary Flow */}
            <div className="pt-8 border-t border-border/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 text-center">Summary Workflow Map</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span className="px-3 py-1.5 rounded-lg bg-muted">Diagnostic Test</span>
                <ArrowRight size={14} className="text-border" />
                <span className="px-3 py-1.5 rounded-lg bg-muted">AI JSON</span>
                <ArrowRight size={14} className="text-border" />
                <span className="px-3 py-1.5 rounded-lg bg-muted">Level Mapping</span>
                <ArrowRight size={14} className="text-border" />
                <span className="px-3 py-1.5 rounded-lg bg-muted">Assemble DB</span>
                <ArrowRight size={14} className="text-border" />
                <span className="px-3 py-1.5 rounded-lg bg-muted">Format Missions</span>
                <ArrowRight size={14} className="text-emerald-500/50" />
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Deliver to UI</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
