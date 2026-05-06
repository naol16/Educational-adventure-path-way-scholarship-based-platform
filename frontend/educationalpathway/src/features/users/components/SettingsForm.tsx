"use client";

import { useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Palette
} from "lucide-react";

import { useTheme } from "@/providers/theme-context";
import { useAuth } from "@/providers/auth-context";
import { motion, AnimatePresence } from "framer-motion";

export const SettingsForm = () => {
  const { mode, setMode } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("appearance");

  const tabs = [
    { id: "appearance", title: "Appearance", icon: Palette },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-4 px-4">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${
                      active
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted font-medium hover:text-foreground"
                    }
                  `}
                >
                  <Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                  {tab.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 max-w-2xl">
          <AnimatePresence mode="wait">
            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground">
                    Appearance
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    Customize the look and feel of the platform.
                  </p>
                </div>

                <div className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground">Theme Mode</span>
                      <span className="text-xs text-muted-foreground font-medium mt-0.5">Switch between light, dark, or system mode</span>
                    </div>

                    <div className="flex gap-1 p-1 bg-muted rounded-2xl">
                       <button 
                         onClick={() => setMode('light')}
                         className={`p-2 rounded-xl transition-all ${mode === 'light' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                       >
                         <Sun size={20} />
                       </button>
                       <button 
                         onClick={() => setMode('dark')}
                         className={`p-2 rounded-xl transition-all ${mode === 'dark' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                       >
                         <Moon size={20} />
                       </button>
                       <button 
                         onClick={() => setMode('system')}
                         className={`p-2 rounded-xl transition-all ${mode === 'system' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                       >
                         <Monitor size={20} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};


