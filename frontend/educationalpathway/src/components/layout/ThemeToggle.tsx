"use client";

import { useTheme } from "@/providers/theme-context";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const toggleTheme = () => {
    // Toggle between light and dark only
    setMode(mode === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 group overflow-hidden border border-border/50 shadow-sm"
      title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mode === "light" ? (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <Sun className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <Moon className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle glow effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${mode === 'light' ? 'bg-orange-500' : 'bg-indigo-500'}`} />
    </button>
  );
}
