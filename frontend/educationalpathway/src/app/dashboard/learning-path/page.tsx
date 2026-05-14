'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  FileText, 
  ClipboardList, 
  Lock, 
  CheckCircle2, 
  ChevronLeft,
  ExternalLink,
  Download,
  Search,
  BookOpen,
  MonitorPlay,
  Award
} from 'lucide-react';
import { PracticeDrillOverlay } from './PracticeDrillOverlay';
import axios from 'axios';

// Circular Gauge Component
const CircularGauge = ({ 
  percentage, 
  label, 
  sublabel, 
  color,
  isActive,
  onClick
}: { 
  percentage: number, 
  label: string, 
  sublabel: string, 
  color: string,
  isActive?: boolean,
  onClick?: () => void
}) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 transition-all duration-300 p-2 rounded-xl border ${isActive ? 'bg-white/10 border-white/20 shadow-lg scale-105' : 'border-transparent hover:bg-white/5 opacity-70'}`}
    >
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
          <motion.circle 
            cx="32" cy="32" r={radius} 
            stroke={color} 
            strokeWidth="4" 
            fill="none" 
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{percentage}%</span>
        </div>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold tracking-wider text-white/80 uppercase">{label}</span>
        <span style={{ color }} className="text-xs font-medium">{sublabel}</span>
      </div>
    </button>
  );
};

export default function LearningPathDashboard() {
  const [selectedSkill, setSelectedSkill] = useState<string>('reading');
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'videos' | 'resources'>('overview');
  const [showDrill, setShowDrill] = useState(false);
  const [pathData, setPathData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<'IELTS' | 'TOEFL'>('IELTS');

  useEffect(() => {
    fetchPath();
  }, [examType]);

  const fetchPath = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/learning-path/my-path?examType=${examType}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setPathData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching path:", error);
      // Fallback for demo if not logged in or API fails
      mockData();
    } finally {
      setLoading(false);
    }
  };

  const mockData = () => {
    const ieltsVideos = [
      { id: 1, title: 'IELTS Strategy: Overview & Intro', level: 'easy', videolink: 'https://youtube.com/watch?v=7e90gBu4pas', thubnail: 'https://img.youtube.com/vi/7e90gBu4pas/0.jpg' },
      { id: 2, title: 'Key Vocabulary & Lexical Resource', level: 'easy', videolink: 'https://youtube.com/watch?v=0v9v76YjRyk', thubnail: 'https://img.youtube.com/vi/0v9v76YjRyk/0.jpg' },
      { id: 3, title: 'Advanced Tactics: Score 7.5+', level: 'easy', videolink: 'https://youtube.com/watch?v=sK3tS0fN_8I', thubnail: 'https://img.youtube.com/vi/sK3tS0fN_8I/0.jpg' },
      { id: 4, title: 'Common Mistakes to Avoid', level: 'easy', videolink: 'https://youtube.com/watch?v=NXzL-H6Sre0', thubnail: 'https://img.youtube.com/vi/NXzL-H6Sre0/0.jpg' },
      { id: 5, title: 'Full Practice Run & Analysis', level: 'easy', videolink: 'https://youtube.com/watch?v=JmYvY_7LshU', thubnail: 'https://img.youtube.com/vi/JmYvY_7LshU/0.jpg' }
    ];

    const toeflVideos = [
      { id: 101, title: 'TOEFL iBT: The 2024 Strategy', level: 'easy', videolink: 'https://youtube.com/watch?v=R6u_D2J1P-Y', thubnail: 'https://img.youtube.com/vi/R6u_D2J1P-Y/0.jpg' },
      { id: 102, title: 'Academic Vocabulary Mastery', level: 'easy', videolink: 'https://youtube.com/watch?v=vV2p_u5-4aU', thubnail: 'https://img.youtube.com/vi/vV2p_u5-4aU/0.jpg' },
      { id: 103, title: 'Note-Taking Systems for TOEFL', level: 'easy', videolink: 'https://youtube.com/watch?v=V7fD6jK5V9c', thubnail: 'https://img.youtube.com/vi/V7fD6jK5V9c/0.jpg' },
      { id: 104, title: 'Speaking Task 1: Zero Prep Logic', level: 'easy', videolink: 'https://youtube.com/watch?v=XvU6F_e43kY', thubnail: 'https://img.youtube.com/vi/XvU6F_e43kY/0.jpg' },
      { id: 105, title: 'Writing integrated Task Breakdown', level: 'easy', videolink: 'https://youtube.com/watch?v=Y8XpW5q-A4I', thubnail: 'https://img.youtube.com/vi/Y8XpW5q-A4I/0.jpg' }
    ];

    const getPdfs = (skill: string, phase: number, type: string) => [
      { id: Math.random(), title: `${skill} Phase ${phase} - Strategy Guide`, level: 'easy', pdfLink: '#' },
      { id: Math.random(), title: `${skill} Phase ${phase} - Vocabulary List`, level: 'easy', pdfLink: '#' },
      { id: Math.random(), title: `${skill} Phase ${phase} - Practice Drills`, level: 'easy', pdfLink: '#' }
    ];

    const videos = examType === 'IELTS' ? ieltsVideos : toeflVideos;

    const mock = {
      proficiencyLevel: 'easy',
      examType: examType,
      current_progress_percentage: 15,
      skills: {
        reading: {
          missions: examType === 'IELTS' ? [
            { title: 'Decoding Foundations', objective: 'Master skimming basics to understand the general topic of a passage.', videos, pdfs: getPdfs('Reading', 1, 'IELTS') },
            { title: 'Scanning for Specifics', objective: 'Locate names, dates, and numbers instantly without reading the full text.', videos, pdfs: getPdfs('Reading', 2, 'IELTS') },
            { title: 'The Grammar Link', objective: 'Solve Sentence Completion questions using subject-verb agreement clues.', videos, pdfs: getPdfs('Reading', 3, 'IELTS') },
            { title: 'Basic T/F/NG', objective: 'Understand the fundamental difference between \'False\' and \'Not Given\'.', videos, pdfs: getPdfs('Reading', 4, 'IELTS') }
          ] : [
            { title: 'Academic Word Bank', objective: 'Master the 570 Academic Word List families grouped by TOEFL frequency.', videos, pdfs: getPdfs('Reading', 1, 'TOEFL') },
            { title: 'Sentence Decoder', objective: 'Break down 30–50-word TOEFL sentences into core ideas in under 12 words.', videos, pdfs: getPdfs('Reading', 2, 'TOEFL') },
            { title: 'Main Idea Hunter', objective: 'Identify each paragraph\'s function and topic sentence.', videos, pdfs: getPdfs('Reading', 3, 'TOEFL') },
            { title: 'Question Type Map', objective: 'Learn all 10 official TOEFL Reading question types and their traps.', videos, pdfs: getPdfs('Reading', 4, 'TOEFL') },
            { title: 'Untimed Full Passage', objective: 'Complete a real-format 700-word passage with a video review.', videos, pdfs: getPdfs('Reading', 5, 'TOEFL') }
          ]
        },
        listening: {
          missions: examType === 'IELTS' ? [
            { title: 'Precision Hearing (Section 1)', objective: 'Capture spelling and numbers accurately in Section 1 (Form Filling).', videos, pdfs: getPdfs('Listening', 1, 'IELTS') },
            { title: 'Map Navigation', objective: 'Learn directional vocabulary for Section 2 map labelling.', videos, pdfs: getPdfs('Listening', 2, 'IELTS') },
            { title: 'Keyword Spotting', objective: 'Identify the exact moment a speaker transitions to the next question.', videos, pdfs: getPdfs('Listening', 3, 'IELTS') }
          ] : [
            { title: 'Sound Recognition', objective: 'Train your ear on reduced sounds, linking, and content-word stress.', videos, pdfs: getPdfs('Listening', 1, 'TOEFL') },
            { title: 'Note-Taking Basics', objective: 'Build a personal abbreviation system and the 2-column note format.', videos, pdfs: getPdfs('Listening', 2, 'TOEFL') },
            { title: 'Lecture Signpost Words', objective: 'Memorize 50+ professor signposts grouped by function.', videos, pdfs: getPdfs('Listening', 3, 'TOEFL') },
            { title: 'Campus Conversation 101', objective: 'Master the 4 conversation contexts and the 3-act structure.', videos, pdfs: getPdfs('Listening', 4, 'TOEFL') }
          ]
        },
        writing: {
          missions: examType === 'IELTS' ? [
            { title: 'Sentence Architecture', objective: 'Write error-free simple and compound sentences on common topics.', videos, pdfs: getPdfs('Writing', 1, 'IELTS') },
            { title: 'Task 1 Foundations (Overview)', objective: 'Master the \'Overview\' paragraph for charts and graphs.', videos, pdfs: getPdfs('Writing', 2, 'IELTS') },
            { title: 'The 4-Paragraph Map', objective: 'Learn the basic structure: Intro, Body 1, Body 2, Conclusion.', videos, pdfs: getPdfs('Writing', 3, 'IELTS') }
          ] : [
            { title: 'Integrated Mechanics', objective: 'Learn the technical requirements for summarizing reading and listening.', videos, pdfs: getPdfs('Writing', 1, 'TOEFL') },
            { title: 'Academic Discussion Strategy', objective: 'Master the Online Discussion task by contributing a 100-word post.', videos, pdfs: getPdfs('Writing', 2, 'TOEFL') },
            { title: 'Transition Toolkit', objective: 'Build a library of 20+ logic connectors for academic writing.', videos, pdfs: getPdfs('Writing', 3, 'TOEFL') },
            { title: 'Full Writing Simulation', objective: 'Complete both tasks with real-time feedback on organization.', videos, pdfs: getPdfs('Writing', 4, 'TOEFL') }
          ]
        },
        speaking: {
          missions: examType === 'IELTS' ? [
            { title: 'Part 1 Confidence', objective: 'Build 3-sentence answers for hometown, hobbies, and studies.', videos, pdfs: getPdfs('Speaking', 1, 'IELTS') },
            { title: 'Fluency Starters', objective: 'Learn 10 filler phrases to buy time while thinking.', videos, pdfs: getPdfs('Speaking', 2, 'IELTS') },
            { title: 'Pronunciation Core', objective: 'Master word stress for common academic vocabulary.', videos, pdfs: getPdfs('Speaking', 3, 'IELTS') }
          ] : [
            { title: 'Pronunciation Core', objective: 'Nail word-stress rules for academic words and intonation.', videos, pdfs: getPdfs('Speaking', 1, 'TOEFL') },
            { id: 2, title: 'The 15-Second Plan', objective: 'Fill a micro-template for independent tasks in under 12 seconds.', videos, pdfs: getPdfs('Speaking', 2, 'TOEFL') },
            { title: 'Campus Announcement Task', objective: 'Practice the "Problem/Solution" summary for Task 2.', videos, pdfs: getPdfs('Speaking', 3, 'TOEFL') },
            { title: 'Lecture Recap', objective: 'Extract key points from a simplified lecture for Task 4.', videos, pdfs: getPdfs('Speaking', 4, 'TOEFL') }
          ]
        }
      }
    };
    setPathData(mock);
  };

  const currentSkillData = pathData?.skills?.[selectedSkill.toLowerCase()] || { missions: [] };
  const currentPhase = currentSkillData.missions[activePhaseIndex] || { title: 'No Phase Available', objective: '', videos: [], pdfs: [] };

  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* 2. Mission Pipeline (Left Pane) */}
      <div className="lg:col-span-3">
        <div className="flex items-center gap-2 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path><path d="m15 9 6-6"></path></svg>
          <h2 className="text-xl font-bold tracking-widest uppercase text-white/90">Pipeline</h2>
        </div>
        
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[11px] top-4 bottom-0 w-[2px] bg-linear-to-b from-[#10B981] via-[#10B981]/50 to-transparent" />
          
          {currentSkillData.missions.map((mission: any, idx: number) => (
            <div key={idx} className="relative cursor-pointer" onClick={() => setActivePhaseIndex(idx)}>
              <div className={`absolute -left-6 top-4 w-3 h-3 rounded-full ${idx <= activePhaseIndex ? 'bg-[#10B981] shadow-[0_0_12px_#10B981]' : 'bg-white/20'}`} />
              <motion.div 
                className={`border rounded-xl p-4 transition-all ${idx === activePhaseIndex ? 'bg-white/5 border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-transparent border-transparent hover:bg-white/5 opacity-60'}`}
              >
                <div className={`text-[10px] font-bold tracking-wider mb-1 ${idx === activePhaseIndex ? 'text-[#10B981]' : 'text-white/40'}`}>PHASE 0{idx + 1}</div>
                <div className="text-lg font-bold mb-1 relative z-10">{mission.title}</div>
                {idx === activePhaseIndex && (
                  <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden relative z-10">
                    <div className="h-full w-[45%] bg-[#10B981]" />
                  </div>
                )}
              </motion.div>
            </div>
          ))}

          <div className="relative mt-8 pt-6">
            <div className="absolute -left-6 top-10 w-3 h-3 rounded-full bg-[#EAB308] shadow-[0_0_12px_#EAB308]" />
            <div className="bg-linear-to-br from-[#EAB308]/20 to-transparent border border-[#EAB308]/50 rounded-xl p-4 shadow-[0_0_20px_rgba(234,179,8,0.15)] relative overflow-hidden group hover:from-[#EAB308]/30 transition-colors cursor-pointer">
              <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-linear-to-r from-transparent to-white opacity-20 group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center justify-between mb-1 relative z-10">
                <div className="text-[10px] text-[#EAB308] font-bold tracking-wider">FINAL EVALUATION</div>
                <Lock className="w-3 h-3 text-[#EAB308]" />
              </div>
              <div className="text-lg font-bold text-white relative z-10">Mock Exam</div>
              <div className="text-xs text-white/70 mt-1 relative z-10">Complete all phases to unlock</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Active Sector (Center Pane) */}
      <div className="lg:col-span-9">
        <div className="flex items-center gap-2 mb-2 text-[#10B981]">
          <div className="w-4 h-4 rounded-full border border-[#10B981]/50 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase">Active Sector</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{currentPhase.title}</h1>
        <p className="text-white/60 text-sm mb-8 leading-relaxed max-w-2xl">
          {currentPhase.objective}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setViewMode('videos')}
            className="relative group p-8 rounded-2xl border border-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/10 text-white/80 group-hover:bg-[#10B981]/20 group-hover:text-[#10B981] transition-colors">
              <Play className="w-6 h-6 ml-1" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Video Lessons</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-wider text-white/60">
                {currentPhase.videos.length} VIDEOS AVAILABLE
              </div>
            </div>
          </button>

          <button 
            onClick={() => setViewMode('resources')}
            className="relative group p-8 rounded-2xl border border-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/10 text-white/80 group-hover:bg-amber-500/20 group-hover:text-amber-500 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Study Resources</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-wider text-white/60">
                {currentPhase.pdfs.length} PDF GUIDES
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShowDrill(true)}
            className="relative group p-8 rounded-2xl border border-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/10 text-white/80 group-hover:bg-[#0EA5E9]/20 group-hover:text-[#0EA5E9] transition-colors">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Practice Drill</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-wider text-white/60">
                INTERACTIVE SESSION
              </div>
            </div>
          </button>

          <button 
            className="relative p-8 rounded-2xl border border-white/5 bg-white/5 opacity-60 cursor-not-allowed flex flex-col items-center justify-center gap-4"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px)' }}
          >
            <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 border border-white/10 rounded text-[9px] font-bold tracking-wider text-white/60 flex items-center gap-1">
              <Lock className="w-3 h-3" /> REQUIRED: FINISH PREP
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/10 text-white/80">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Unit Test</div>
            </div>
          </button>
        </div>
      </div>


    </motion.div>
  );

  const renderVideoList = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setViewMode('overview')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors py-2 px-4 rounded-lg bg-white/5 border border-white/10"
        >
          <ChevronLeft size={20} /> Back to Overview
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/50 flex items-center justify-center text-[#10B981]">
          <MonitorPlay size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{currentPhase.title}: Video Lessons</h2>
          <p className="text-white/50 text-sm uppercase tracking-widest">{selectedSkill} • {pathData?.proficiencyLevel} LEVEL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPhase.videos.map((video: any, idx: number) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#10B981]/50 transition-all shadow-xl"
          >
            <div className="aspect-video relative overflow-hidden bg-black/40">
              <img 
                src={video.thubnail || video.thumbnailLink || `https://img.youtube.com/vi/${(video.videolink || video.videoLink || '').split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#0B1F2A]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                <div className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 text-white/90 group-hover:text-[#10B981] transition-colors leading-tight">{video.title}</h3>
              <p className="text-white/40 text-xs line-clamp-2 mb-4 leading-relaxed italic">{video.description || 'Watch this tactical video to master the current skill sector.'}</p>
              <a 
                href={video.videolink || video.videoLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-[#10B981]/20 border border-white/10 hover:border-[#10B981]/30 rounded-xl text-xs font-bold transition-all text-white/80 hover:text-[#10B981] tracking-widest uppercase"
              >
                Watch Now <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderResourceList = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setViewMode('overview')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors py-2 px-4 rounded-lg bg-white/5 border border-white/10"
        >
          <ChevronLeft size={20} /> Back to Overview
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-500">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{currentPhase.title}: Study Guides</h2>
          <p className="text-white/50 text-sm uppercase tracking-widest">{selectedSkill} • {pathData?.proficiencyLevel} LEVEL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentPhase.pdfs.map((pdf: any, idx: number) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-amber-500/50 transition-all shadow-lg"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 transition-colors shadow-inner">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white/90 group-hover:text-amber-500 transition-colors text-lg leading-tight">{pdf.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase">PDF DOCUMENT</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-amber-500/70 text-[10px] font-bold tracking-widest uppercase">{pdf.level}</span>
                </div>
              </div>
            </div>
            <a 
              href={pdf.pdfLink || '#'} 
              download
              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-amber-500/20 hover:border-amber-500/30 transition-all shadow-sm"
            >
              <Download size={24} />
            </a>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full min-h-full bg-[#0B1F2A] text-white rounded-none lg:rounded-2xl overflow-hidden font-sans border-0 lg:border border-white/10 shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-[#10B981]/5 to-transparent pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#10B981]/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-[#10B981] animate-spin" />
          </div>
          <p className="text-white/40 tracking-widest uppercase font-bold animate-pulse">Initializing Phase Parameters...</p>
        </div>
      ) : (
        <div className="p-4 lg:p-10 relative z-10">
          {/* Header Row */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6 mb-8 backdrop-blur-sm gap-4">
            <div className="flex items-center gap-2 lg:gap-8 overflow-x-auto custom-scrollbar pb-2 lg:pb-0 w-full lg:w-auto">
              <CircularGauge isActive={selectedSkill === 'reading'} onClick={() => { setSelectedSkill('reading'); setViewMode('overview'); setActivePhaseIndex(0); }} percentage={40} label="Reading" sublabel="Level 2" color="#10B981" />
              <CircularGauge isActive={selectedSkill === 'listening'} onClick={() => { setSelectedSkill('listening'); setViewMode('overview'); setActivePhaseIndex(0); }} percentage={20} label="Listening" sublabel="Level 1" color="#0EA5E9" />
              <CircularGauge isActive={selectedSkill === 'writing'} onClick={() => { setSelectedSkill('writing'); setViewMode('overview'); setActivePhaseIndex(0); }} percentage={15} label="Writing" sublabel="Initiated" color="#F43F5E" />
              <CircularGauge isActive={selectedSkill === 'speaking'} onClick={() => { setSelectedSkill('speaking'); setViewMode('overview'); setActivePhaseIndex(0); }} percentage={10} label="Speaking" sublabel="Initiated" color="#F59E0B" />
            </div>
            <div className="flex bg-white/10 p-1 rounded-lg border border-white/10 shrink-0">
              <button 
                onClick={() => setExamType('IELTS')}
                className={`px-6 py-2 rounded-md transition-all font-bold text-sm ${examType === 'IELTS' ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-white/50 hover:text-white'}`}
              >
                IELTS
              </button>
              <button 
                onClick={() => setExamType('TOEFL')}
                className={`px-6 py-2 rounded-md transition-all font-bold text-sm ${examType === 'TOEFL' ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-white/50 hover:text-white'}`}
              >
                TOEFL
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'overview' && <div key="overview">{renderOverview()}</div>}
            {viewMode === 'videos' && <div key="videos">{renderVideoList()}</div>}
            {viewMode === 'resources' && <div key="resources">{renderResourceList()}</div>}
          </AnimatePresence>
        </div>
      )}

      {showDrill && (
        <PracticeDrillOverlay 
          onClose={() => setShowDrill(false)} 
          onComplete={() => {}} // Handle completion
        />
      )}
    </div>
  );
}
