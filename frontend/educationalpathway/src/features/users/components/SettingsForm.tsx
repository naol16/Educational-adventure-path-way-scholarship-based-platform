"use client";

import { useState } from "react";
import {
  Palette,
  Briefcase,
  CalendarCheck,
} from "lucide-react";

import { useTheme } from "@/providers/theme-context";
import { useAuth } from "@/providers/auth-context";
import { motion, AnimatePresence } from "framer-motion";

// Import counselor components
import { CounselorProfile } from "@/features/counselor/components/CounselorProfile";
import { BookingManager } from "@/features/counselor/components/BookingManager";

export const SettingsForm = () => {
  const { mode, setMode } = useTheme();
  const { user } = useAuth();
  
  // Default to professional info if counselor, otherwise appearance
  const [activeTab, setActiveTab] = useState(user?.role === 'counselor' ? "professional" : "appearance");

  const counselorTabs = [
    { id: "professional", title: "Professional Brand", icon: Briefcase },
    { id: "availability", title: "Booking & Slots", icon: CalendarCheck },
  ];

  const defaultTabs = [
    { id: "appearance", title: "Appearance", icon: Palette },
  ];

  const tabs = user?.role === 'counselor' ? counselorTabs : defaultTabs;

  return (
    <div className="max-w-350 mx-auto pb-20 mt-4 px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-2">
            <div className="mb-6 px-4">
              <h2 className="text-xl font-black tracking-tight">Settings</h2>
              <p className="text-xs text-muted-foreground font-medium mt-1">Manage your platform preferences.</p>
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                    ${
                      active
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted font-medium hover:text-foreground"
                    }
                  `}
                >
                  <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-primary/20' : 'bg-transparent'}`}>
                    <Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  {tab.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            


            {activeTab === "professional" && (
              <motion.div
                key="professional"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CounselorProfile />
              </motion.div>
            )}

            {activeTab === "availability" && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <BookingManager />
              </motion.div>
            )}



            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 max-w-2xl"
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
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground font-medium">General settings will appear here. Theme settings have been moved to the top navigation bar.</p>
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



