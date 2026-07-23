'use client';

import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Zap,
  ShieldCheck,
  Target,
  Globe,
  PlayCircle,
  CheckCircle2,
  HelpCircle,
  Quote,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import api from "@/lib/api";
import useSWR from "swr";
import { AIChatBot } from "@/components/AIChatBot";
import { useTheme } from "@/providers/theme-context";

interface LandingPageData {
  stats: { label: string; value: string }[];
  testimonials: { name: string; role: string; text: string; avatar: string }[];
  faqs: { question: string; answer: string }[];
}

const features = [
  {
    icon: Award,
    title: "Smart Scholarship Match",
    description: "Our AI finds the best scholarships for you based on your grades, leadership, and personal goals.",
    color: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Users,
    title: "Expert Counselor Network",
    description: "Talk to verified mentors who have secured global scholarships. Get direct advice on your CV and interview prep.",
    color: "from-teal-500 to-cyan-600",
    iconColor: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-500/10 dark:bg-teal-500/20",
    shadow: "shadow-teal-500/20",
  },
  {
    icon: BookOpen,
    title: "Academic Path Planning",
    description: "See all your deadlines, eligibility requirements, and milestones in one seamless dashboard.",
    color: "from-indigo-500 to-blue-600",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
    shadow: "shadow-indigo-500/20",
  },
  {
    icon: Zap,
    title: "AI-Powered Practice & Feedback",
    description: "Take practice exams and scholarship interviews with AI. Receive instant scores and tailored recommendations.",
    color: "from-amber-500 to-orange-600",
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    shadow: "shadow-amber-500/20",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Profile",
    description: "Share your academic background and global study preferences.",
    icon: Target,
  },
  {
    step: "02",
    title: "AI Discovery",
    description: "Our engine maps you to opportunities worldwide instantly.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Expert Strategy",
    description: "Refine your approach with specialized admission counselors.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Apply & Win",
    description: "Submit flawless applications and secure your academic future.",
    icon: TrendingUp,
  },
];

export const LandingPageContent = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const y = useTransform(springScroll, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(springScroll, [0, 0.2], [1, 0]);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode, setMode } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const { data: landingData } = useSWR<LandingPageData>('/marketing/landing-page');

  const currentStats = landingData?.stats || [];
  const currentTestimonials = landingData?.testimonials || [];
  const currentFaqs = landingData?.faqs || [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden" ref={containerRef}>
      
      {/* ─── DYNAMIC BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none mesh-gradient opacity-60">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] sm:w-[40vw] h-[50vw] sm:h-[40vw] rounded-full bg-emerald-500/20 dark:bg-emerald-600/10 blur-[100px] sm:blur-[120px] animate-pulse-soft" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] sm:w-[50vw] h-[60vw] sm:h-[50vw] rounded-full bg-teal-500/15 dark:bg-teal-600/10 blur-[120px] sm:blur-[150px]" />
         <div className="absolute top-[40%] left-[60%] w-[40vw] sm:w-[30vw] h-[40vw] sm:h-[30vw] rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-[90px] sm:blur-[100px]" />
      </div>

      {/* ─── GLASS NAVBAR ─── */}
      <motion.header 
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
         className="px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-2xl"
      >
        <Link className="flex items-center gap-3 group" href="/">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-900/40 border border-emerald-500/30 group-hover:border-emerald-500/60 transition-colors shadow-sm">
            <Image
              src="/admas.png"
              alt="Path Finder Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
           <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-foreground to-foreground/80 tracking-tight font-serif">
            Path Finder
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden lg:flex items-center gap-6 lg:gap-8">
            <Link className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" href="/#features">
              Features
            </Link>
            <Link className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" href="/#how">
              Methodology
            </Link>
            <div className="h-6 w-px bg-border" />
            <Link href="/login">
              <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                Sign In
              </button>
            </Link>
            <Link href="/role-selection">
              <button className="relative overflow-hidden group px-5 py-2.5 rounded-xl font-bold text-sm text-foreground bg-card border border-border/60 hover:border-emerald-500/60 transition-all shadow-sm hover:shadow-emerald-500/20">
                <span className="absolute inset-0 w-full h-full bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                Get Started
              </button>
            </Link>
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={() => setMode(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-border/60 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            {mounted ? (isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />) : <Moon size={16} />}
          </button>

          {/* Mobile & Tablet Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center border border-border/60 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* ─── MOBILE & TABLET RIGHT-SIDE DRAWER ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 lg:hidden"
            />

            {/* Right-Side Smooth Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-background/98 backdrop-blur-3xl border-l border-border z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Image
                        src="/admas.png"
                        alt="Path Finder Logo"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-serif font-black text-lg text-foreground">Menu</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav Links */}
                <div className="flex flex-col gap-2 py-6">
                  <Link 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-base font-bold text-foreground/90 hover:text-emerald-600 dark:hover:text-emerald-400 py-3.5 px-4 rounded-xl hover:bg-muted/60 transition-colors flex items-center justify-between border-b border-border/30" 
                    href="/#features"
                  >
                    <span>Features</span>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </Link>
                  <Link 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-base font-bold text-foreground/90 hover:text-emerald-600 dark:hover:text-emerald-400 py-3.5 px-4 rounded-xl hover:bg-muted/60 transition-colors flex items-center justify-between border-b border-border/30" 
                    href="/#how"
                  >
                    <span>Methodology</span>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Action Buttons at bottom of right drawer */}
              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full text-center text-sm font-bold text-foreground bg-muted hover:bg-muted/80 py-3.5 rounded-xl transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/role-selection" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full text-center text-sm font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 py-3.5 rounded-xl shadow-lg transition-all">
                    Get Started
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 relative z-10">

        {/* ─── HERO SECTION ─── */}
        <section className="relative pt-20 pb-16 md:pt-36 md:pb-28 px-4 overflow-hidden">
          <motion.div style={{ y, opacity }} className="container mx-auto max-w-5xl text-center space-y-6 sm:space-y-8 relative z-10">
            

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-[1.05] font-serif max-w-4xl mx-auto wrap-break-word"
            >
              Unlock Your{" "}
              <span className="relative inline-block">
                <span className="absolute -inset-2 sm:-inset-4 bg-linear-to-r from-emerald-500/20 to-teal-500/20 blur-2xl rounded-full opacity-60" />
                <span className="relative text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                  Global Future.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium px-2"
            >
              The premier platform for international students. Discover top scholarships, pass your exams, and gain admission to top universities worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-6 sm:gap-7 md:gap-8 lg:gap-6 justify-center items-center pt-6 sm:pt-8 w-full sm:w-auto px-4 sm:px-0"
            >
              <Link href="/role-selection" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black tracking-wide flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/30">
                  START NOW
                  <ArrowRight size={20} />
                </button>
              </Link>
              <Link href="/#how" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-card border border-border text-foreground font-bold tracking-wide flex items-center justify-center gap-3 hover:bg-muted transition-all backdrop-blur-md">
                  <PlayCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                  EXPLORE PLATFORM
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Elements (Hidden on small screens to prevent layout overlap) */}
          <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
            <motion.div 
              animate={{ y: [0, -20, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-6 xl:left-12 w-20 xl:w-24 h-20 xl:h-24 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl flex items-center justify-center shadow-xl"
            >
              <GraduationCap className="text-emerald-600 dark:text-emerald-400" size={36} />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0] }} 
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-6 xl:right-12 w-24 xl:w-28 h-24 xl:h-28 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 backdrop-blur-xl flex items-center justify-center shadow-xl"
            >
              <Globe className="text-teal-600 dark:text-teal-400" size={40} />
            </motion.div>
          </div>
        </section>


        {/* ─── FEATURES GRID ─── */}
        <section id="features" className="py-20 sm:py-32 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-14 sm:mb-20 text-center md:text-left">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tighter mb-4 sm:mb-6 font-serif">
                Smarter tools. <br />
                <span className="text-emerald-600/80 dark:text-emerald-400/80">Get better results.</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl font-medium">
                We provide the most effective tools for global education and scholarship success, built for ambitious students worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative p-1 rounded-2xl overflow-hidden bg-card border border-border hover:border-emerald-500/50 transition-all duration-500 shadow-md hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative h-full bg-card rounded-[calc(1rem-1px)] p-6 sm:p-8 md:p-10 flex flex-col gap-6 sm:gap-8">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${f.bgColor} p-px shadow-md ${f.shadow} group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20`}>
                      <div className="w-full h-full bg-card rounded-[15px] flex items-center justify-center">
                        <f.icon className={f.iconColor} size={28} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight font-serif">{f.title}</h3>
                      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-medium">{f.description}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                      Learn More <ChevronRight size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STATS SECTION ─── */}
        {currentStats.length > 0 && (
          <section className="py-20 sm:py-32 bg-emerald-500/5 dark:bg-emerald-950/20 relative overflow-hidden border-y border-border/50">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-emerald-500/10 blur-[120px] rounded-full" />
             <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
                   {currentStats.map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center space-y-2 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/40"
                      >
                         <div className="text-3xl sm:text-5xl md:text-7xl font-black text-foreground font-serif tracking-tighter">{stat.value}</div>
                         <div className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs sm:text-sm">{stat.label}</div>
                      </motion.div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {/* ─── PROCESS TIMELINE ─── */}
        <section id="how" className="py-20 sm:py-32 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16 sm:mb-24 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tighter mb-4 sm:mb-6 font-serif">
                Your journey, <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">mastered.</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg font-medium">A proven 4-step framework to unlock global scholarship opportunities.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 relative">
              <div className="hidden lg:block absolute top-15 left-20 right-20 h-px bg-linear-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />

              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, type: "spring" }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 sm:mb-8 relative group-hover:border-emerald-500/50 transition-all duration-500 shadow-md group-hover:-translate-y-2">
                    <div className="absolute inset-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center transition-colors">
                       <s.icon size={32} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">{s.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium px-2">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        {currentTestimonials.length > 0 && (
          <section className="py-20 sm:py-32 relative overflow-hidden bg-muted/30 border-y border-border">
             <div className="container mx-auto max-w-7xl px-4 sm:px-6">
                <div className="text-center mb-14 sm:mb-20">
                   <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-4 sm:mb-6 font-serif">Success Stories</h2>
                   <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">Join thousands of students who have already secured their academic scholarships.</p>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                   {currentTestimonials.map((t, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 sm:p-8 rounded-2xl bg-card border border-border relative group shadow-sm hover:shadow-md transition-all"
                      >
                         <Quote className="absolute top-6 right-6 sm:top-8 sm:right-8 text-emerald-600/20 dark:text-emerald-400/20 w-10 h-10 sm:w-12 sm:h-12" />
                         <div className="flex items-center gap-4 mb-6 sm:mb-8">
                            <img src={t.avatar} alt={t.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-emerald-500/30 object-cover" />
                            <div>
                               <h4 className="text-foreground font-bold text-base sm:text-lg">{t.name}</h4>
                               <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">{t.role}</p>
                            </div>
                         </div>
                         <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium italic">"{t.text}"</p>
                      </motion.div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {/* ─── FAQ SECTION ─── */}
        {currentFaqs.length > 0 && (
          <section className="py-20 sm:py-32 relative">
             <div className="container mx-auto max-w-4xl px-4 sm:px-6">
                <div className="text-center mb-14 sm:mb-20">
                   <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-4 sm:mb-6 font-serif">Frequently Asked Questions</h2>
                   <p className="text-muted-foreground text-base sm:text-lg">Everything you need to know about the Path Finder scholarship platform.</p>
                </div>
                
                <div className="space-y-4">
                   {currentFaqs.map((faq, i) => (
                      <motion.div 
                        key={i}
                        className={`rounded-2xl border transition-all duration-300 ${activeFaq === i ? 'border-emerald-500/50 bg-card shadow-md' : 'border-border bg-card/60'}`}
                      >
                         <button 
                           onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                           className="w-full px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left gap-4"
                         >
                            <span className="text-base sm:text-xl font-bold text-foreground font-serif">{faq.question}</span>
                            <ChevronRight className={`text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-300 ${activeFaq === i ? 'rotate-90' : ''}`} />
                         </button>
                         {activeFaq === i && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="px-5 sm:px-8 pb-6 sm:pb-8 text-muted-foreground text-sm sm:text-base leading-relaxed font-medium"
                            >
                               {faq.answer}
                            </motion.div>
                         )}
                      </motion.div>
                   ))}
                </div>
             </div>
          </section>
        )}


      </main>

      <Footer />
      <AIChatBot />
    </div>
  );
};
