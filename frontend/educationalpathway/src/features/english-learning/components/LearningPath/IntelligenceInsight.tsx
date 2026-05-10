"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function IntelligenceInsight({ title, text }: { title: string, text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-muted/50 dark:bg-muted/30 border border-border/50 rounded-2xl overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">AI Insight</span>
            <h4 className="text-sm font-black uppercase tracking-tighter text-foreground">{title}</h4>
          </div>
        </div>
        <ChevronDown size={18} className={`text-muted-foreground transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-10 pb-8 overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
              "{text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
