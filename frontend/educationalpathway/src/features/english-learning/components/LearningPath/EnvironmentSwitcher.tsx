import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Globe } from "lucide-react";

interface EnvironmentSwitcherProps {
  mode: "IELTS" | "TOEFL";
  onChange: (mode: "IELTS" | "TOEFL") => void;
}

export function EnvironmentSwitcher({ mode, onChange }: EnvironmentSwitcherProps) {
  return (
    <div className="flex p-1 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/40 w-full max-w-[300px] shadow-sm">
      <button
        onClick={() => onChange("IELTS")}
        className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
          mode === "IELTS" ? "text-emerald-700" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "IELTS" && (
          <motion.div
            layoutId="activeEnv"
            className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Sparkles size={12} className={mode === "IELTS" ? "text-emerald-500" : "opacity-40"} />
        IELTS Emerald
      </button>
      <button
        onClick={() => onChange("TOEFL")}
        className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
          mode === "TOEFL" ? "text-blue-700" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "TOEFL" && (
          <motion.div
            layoutId="activeEnv"
            className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Globe size={12} className={mode === "TOEFL" ? "text-blue-500" : "opacity-40"} />
        TOEFL Electric
      </button>
    </div>
  );
}
