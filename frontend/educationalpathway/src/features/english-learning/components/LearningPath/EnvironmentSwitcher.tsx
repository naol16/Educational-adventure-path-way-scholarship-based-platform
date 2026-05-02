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
        className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
          mode === "IELTS" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "IELTS" && (
          <motion.div
            layoutId="activeEnv"
            className="absolute inset-0 bg-emerald-600 rounded-xl shadow-sm z-[-1]"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Sparkles size={12} className={mode === "IELTS" ? "text-white" : "opacity-40"} />
        IELTS Emerald
      </button>
      <button
        onClick={() => onChange("TOEFL")}
        className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
          mode === "TOEFL" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "TOEFL" && (
          <motion.div
            layoutId="activeEnv"
            className="absolute inset-0 bg-blue-600 rounded-xl shadow-sm z-[-1]"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Globe size={12} className={mode === "TOEFL" ? "text-white" : "opacity-40"} />
        TOEFL Electric
      </button>
    </div>
  );
}
