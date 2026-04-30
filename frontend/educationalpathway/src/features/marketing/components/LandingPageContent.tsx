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
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import api from "@/lib/api";
import { AIChatBot } from "@/components/AIChatBot";

interface LandingPageData {
  stats: { label: string; value: string }[];
  testimonials: { name: string; role: string; text: string; avatar: string }[];
  faqs: { question: string; answer: string }[];
}

const features = [
  {
    icon: Award,
    title: "Smart Scholarship Match",
    description: "Our AI finds the best scholarships for you based on your grades and goals.",
    color: "from-emerald-400 to-emerald-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Users,
    title: "Expert Counselor Network",
    description: "Talk to experts who have helped many students. Get advice on your CV and interview prep.",
    color: "from-teal-400 to-cyan-500",
    shadow: "shadow-cyan-500/20",
  },
  {
    icon: BookOpen,
    title: "Academic Path Planning",
    description: "See all your deadlines and requirements in one easy dashboard. Plan your journey to graduation.",
    color: "from-indigo-400 to-violet-500",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Zap,
    title: "AI-Powered Assessments",
    description: "Take practice exams with AI. Get your score and feedback instantly to help you improve fast.",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/20",
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

// Dynamic data will be fetched inside the component

export const LandingPageContent = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const y = useTransform(springScroll, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(springScroll, [0, 0.2], [1, 0]);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/marketing/landing-page');
        setLandingData(response.data);
      } catch (error) {
        console.error("Failed to fetch landing page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStats = landingData?.stats || [];
  const currentTestimonials = landingData?.testimonials || [];
  const currentFaqs = landingData?.faqs || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden" ref={containerRef}>
      
      {/* ─── DYNAMIC BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none mesh-gradient opacity-60">
         <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen animate-pulse-soft" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-600/10 blur-[150px] mix-blend-screen" />
         <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/5 blur-[100px] mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[radial-gradient(ellipse_at_center,white,transparent)] opacity-5" />
      </div>

      {/* ─── GLASS NAVBAR ─── */}
      <motion.header 
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
         className="px-6 lg:px-12 h-20 flex items-center border-b border-white/5 sticky top-0 z-50 bg-[#050505]/60 backdrop-blur-2xl"
      >
        <Link className="flex items-center gap-3 group" href="/">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400/20 to-teal-900/40 border border-emerald-500/20 group-hover:border-emerald-400/50 transition-colors">
            <Image
              src="/admas.png"
              alt="Admas Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-white/70 tracking-tight font-serif">
            አድማስ
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-bold text-white/60 hover:text-white transition-colors hidden md:block" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-bold text-white/60 hover:text-white transition-colors hidden md:block" href="/#how">
            Methodology
          </Link>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <Link href="/login">
            <button className="text-sm font-bold text-white/80 hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
          </Link>
          <Link href="/role-selection">
            <button className="relative overflow-hidden group px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/20">
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              Get Started
            </button>
          </Link>
        </nav>
      </motion.header>

      <main className="flex-1 relative z-10">

        {/* ─── HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
          <motion.div style={{ y, opacity }} className="container mx-auto max-w-5xl text-center space-y-10 relative z-10">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-xs font-bold tracking-widest uppercase mx-auto backdrop-blur-md"
            >
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-300 to-teal-200">
                A better way for students to succeed with AI
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.95] font-serif"
            >
              Unlock Your <br className="hidden md:block" />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-4 bg-linear-to-r from-emerald-500/30 to-teal-500/30 blur-3xl rounded-full opacity-50" />
                <span className="relative text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Global Future.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-2xl text-xl md:text-2xl text-white/50 leading-relaxed font-medium"
            >
              The best platform for students. Find great scholarships, pass your exams, and get into the world's top universities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8"
            >
              <Link href="/role-selection">
                <button className="h-16 px-10 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-black tracking-wide flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]">
                  START NOW
                  <ArrowRight size={20} />
                </button>
              </Link>
              <Link href="/#how">
                <button className="h-16 px-10 rounded-2xl bg-white/5 border border-white/10 text-white font-bold tracking-wide flex items-center gap-3 hover:bg-white/10 transition-all backdrop-blur-md">
                  <PlayCircle size={20} className="text-white/60" />
                  EXPLORE PLATFORM
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <motion.div 
              animate={{ y: [0, -20, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-10 w-24 h-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl flex items-center justify-center shadow-2xl"
            >
              <GraduationCap className="text-emerald-400" size={40} />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0] }} 
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-10 w-32 h-32 rounded-2xl bg-teal-500/10 border border-teal-500/20 backdrop-blur-xl flex items-center justify-center shadow-2xl"
            >
              <Globe className="text-teal-400" size={48} />
            </motion.div>
          </div>
        </section>


        {/* ─── FEATURES GRID ─── */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mb-20 text-center md:text-left">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 font-serif">
                Smarter tools. <br />
                <span className="text-white/40">Get better results.</span>
              </h2>
              <p className="text-white/50 text-lg max-w-2xl font-medium">
                We have the best tools for international education, made for the next generation of leaders.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative p-1 rounded-2xl overflow-hidden bg-linear-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative h-full bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[calc(1rem-1px)] p-10 md:p-12 flex flex-col gap-8">
                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${f.color} p-px shadow-2xl ${f.shadow} group-hover:scale-110 transition-transform duration-500`}>
                      <div className="w-full h-full bg-[#111] rounded-[15px] flex items-center justify-center">
                        <f.icon className="text-white" size={28} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4 tracking-tight font-serif">{f.title}</h3>
                      <p className="text-white/50 text-lg leading-relaxed font-medium">{f.description}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
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
          <section className="py-32 bg-emerald-500/5 relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-emerald-500/10 blur-[120px] rounded-full" />
             <div className="container mx-auto max-w-7xl px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                   {currentStats.map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center space-y-2"
                      >
                         <div className="text-5xl md:text-7xl font-black text-white font-serif tracking-tighter">{stat.value}</div>
                         <div className="text-emerald-400 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                      </motion.div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {/* ─── PROCESS TIMELINE ─── */}
        <section id="how" className="py-32 relative border-t border-white/5">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-24 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 font-serif">
                Your journey, <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">mastered.</span>
              </h2>
              <p className="text-white/50 text-lg font-medium">An easy, data-driven way to help you reach your goals.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-12 relative">
              <div className="hidden md:block absolute top-[60px] left-20 right-20 h-px bg-linear-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />

              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, type: "spring" }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-32 h-32 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center mb-10 relative group-hover:border-emerald-500/50 transition-all duration-500 shadow-2xl group-hover:-translate-y-2">
                    <div className="absolute inset-4 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                       <s.icon size={36} className="text-white group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xl">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-serif">{s.title}</h3>
                  <p className="text-white/50 leading-relaxed font-medium px-4">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        {currentTestimonials.length > 0 && (
          <section className="py-32 relative overflow-hidden">
             <div className="container mx-auto max-w-7xl px-6">
                <div className="text-center mb-20">
                   <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 font-serif">Success Stories</h2>
                   <p className="text-white/50 text-lg">Join thousands of students who have already started their global journey.</p>
                </div>
  
                <div className="grid md:grid-cols-3 gap-8">
                   {currentTestimonials.map((t, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-2xl bg-white/5 border border-white/10 relative group"
                      >
                         <Quote className="absolute top-8 right-8 text-emerald-500/20 w-12 h-12" />
                         <div className="flex items-center gap-4 mb-8">
                            <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full border-2 border-emerald-500/20" />
                            <div>
                               <h4 className="text-white font-bold">{t.name}</h4>
                               <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{t.role}</p>
                            </div>
                         </div>
                         <p className="text-white/70 leading-relaxed font-medium italic">"{t.text}"</p>
                      </motion.div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {/* ─── FAQ SECTION ─── */}
        {currentFaqs.length > 0 && (
          <section className="py-32 relative bg-[#080808]">
             <div className="container mx-auto max-w-4xl px-6">
                <div className="text-center mb-20">
                   <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 font-serif">Common Questions</h2>
                   <p className="text-white/50 text-lg">Everything you need to know about the Admas platform.</p>
                </div>
                
                <div className="space-y-4">
                   {currentFaqs.map((faq, i) => (
                      <motion.div 
                        key={i}
                        className={`rounded-2xl border transition-all duration-300 ${activeFaq === i ? 'border-emerald-500/50 bg-white/5' : 'border-white/5 bg-transparent'}`}
                      >
                         <button 
                           onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                           className="w-full px-8 py-6 flex items-center justify-between text-left"
                         >
                            <span className="text-xl font-bold text-white font-serif">{faq.question}</span>
                            <ChevronRight className={`text-emerald-500 transition-transform duration-300 ${activeFaq === i ? 'rotate-90' : ''}`} />
                         </button>
                         {activeFaq === i && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="px-8 pb-8 text-white/50 leading-relaxed font-medium"
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

        {/* ─── FINAL CTA ─── */}
        <section className="py-32 relative overflow-hidden flex items-center justify-center min-h-[70vh]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-linear-to-r from-emerald-600/30 to-teal-500/30 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center"
          >
            <div className="p-px rounded-2xl bg-linear-to-b from-white/20 to-white/0 shadow-2xl">
              <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[calc(1rem-1px)] p-16 md:p-24 border border-white/5">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-emerald-500/20">
                  <Globe className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 font-serif">
                  Ready to go global?
                </h2>
                <p className="text-white/50 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join 10,000+ students getting ready for their future. Start your journey today.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/role-selection">
                    <button className="h-18 px-12 rounded-2xl bg-white text-black font-black tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-2xl shadow-white/10 uppercase">
                      START NOW
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button className="h-18 px-12 rounded-2xl bg-white/5 border border-white/10 text-white font-black tracking-widest text-sm hover:bg-white/10 transition-all backdrop-blur-md uppercase">
                      TALK TO COUNSELOR
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
      <AIChatBot />
    </div>
  );
};
