import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Globe } from "lucide-react";

interface EnvironmentSwitcherProps {
  mode: "IELTS" | "TOEFL";
  onChange: (mode: "IELTS" | "TOEFL") => void;
}

export function EnvironmentSwitcher({ mode, onChange }: EnvironmentSwitcherProps) {
  return (
    <div className="flex p-1.5 bg-muted/20 backdrop-blur-2xl rounded-2xl border border-border/40 w-full shadow-2xl relative overflow-hidden group">
      <button
        onClick={() => onChange("IELTS")}
        className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-500 z-10 ${
          mode === "IELTS" ? "text-white shadow-xl" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "IELTS" && (
          <motion.div
            layoutId="activeEnv"
            className="absolute inset-0 bg-emerald-600 rounded-xl z-[-1]"
            transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
          />
        )}
        <div className="flex items-center gap-2">
          <Sparkles size={14} className={mode === "IELTS" ? "text-emerald-200" : "opacity-40"} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">IELTS</span>
        </div>
        <span className={`text-[8px] font-bold uppercase tracking-widest opacity-60 ${mode === "IELTS" ? 'text-emerald-100' : ''}`}>Emerald</span>
      </button>

      <button
        onClick={() => onChange("TOEFL")}
        className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-500 z-10 ${
          mode === "TOEFL" ? "text-white shadow-xl" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {mode === "TOEFL" && (
          <motion.div
            layoutId="activeEnv"
            className="absolute inset-0 bg-blue-600 rounded-xl z-[-1]"
            transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
          />
        )}
        <div className="flex items-center gap-2">
          <Globe size={14} className={mode === "TOEFL" ? "text-blue-200" : "opacity-40"} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">TOEFL</span>
        </div>
        <span className={`text-[8px] font-bold uppercase tracking-widest opacity-60 ${mode === "TOEFL" ? 'text-blue-100' : ''}`}>Electric</span>
      </button>
    </div>
  );
}

