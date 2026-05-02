"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, Check } from "lucide-react";

export function RoleSelection() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none">
            CHOOSE YOUR <span className="text-primary">PATH</span>
          </h1>
          <p className="text-muted-foreground/60 max-w-md mx-auto text-sm md:text-base font-bold uppercase tracking-[0.2em]">
            Select your journey to get started
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">

          {/* STUDENT */}
          <Link href="/register?role=student" className="group">
            <div className="h-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/60 p-10 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              
              {/* Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight group-hover:text-primary transition-colors">
                I'm a Student
              </h2>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed text-sm mb-8 font-medium">
                Unlock scholarships, master the IELTS/TOEFL path, and let AI guide your educational journey.
              </p>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {[
                  "Personalized Learning Paths",
                  "AI Assessment Engine",
                  "Scholarship Discovery",
                  "Progress Tracking",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-xs font-bold text-foreground/70 uppercase tracking-wider">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" strokeWidth={4} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action */}
              <div className="flex items-center justify-center w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] transition-all group-hover:bg-primary group-hover:text-white">
                Enter as Student
              </div>
            </div>
          </Link>

          {/* COUNSELOR */}
          <Link href="/register?role=counselor" className="group">
            <div className="h-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/60 p-10 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              
              {/* Icon */}
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <Briefcase className="h-8 w-8 text-indigo-500" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight group-hover:text-indigo-500 transition-colors">
                I'm a Counselor
              </h2>

              {/* Description - Low Opacity until hover */}
              <div className="opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-muted-foreground leading-relaxed text-sm mb-8 font-medium">
                  Empower students, manage resources, and oversee the scholarship pipeline with precision tools.
                </p>

                {/* Features */}
                <ul className="space-y-4 mb-10">
                  {[
                    "Student Management Hub",
                    "Application Oversight",
                    "Advanced Analytics",
                    "Resource Library",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-xs font-bold text-foreground/70 uppercase tracking-wider">
                      <div className="h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-indigo-500" strokeWidth={4} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="flex items-center justify-center w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] transition-all group-hover:bg-indigo-500 group-hover:text-white">
                Enter as Counselor
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.3em]">
            Already part of the network?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
