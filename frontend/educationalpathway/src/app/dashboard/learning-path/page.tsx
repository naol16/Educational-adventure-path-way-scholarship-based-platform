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
  Award,
  X
} from 'lucide-react';
import { PracticeDrillOverlay } from './PracticeDrillOverlay';
import { UnitTestOverlay } from '@/features/english-learning/components/LearningPath/LearningPathOverlays';
import { getLearningPath, generateUnitTest } from '@/features/assessments/api/assessment-api';
import { useLearningPath, LearningPathProvider } from '@/features/english-learning/components/LearningPath/LearningPathContext';
import Link from 'next/link';

// Circular Gauge Component
const CircularGauge = ({ 
  score,
  maxScore,
  label, 
  color,
  isActive,
  onClick
}: { 
  score: number,
  maxScore: number,
  label: string, 
  color: string,
  isActive?: boolean,
  onClick?: () => void
}) => {
  const percentage = (score / maxScore) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 transition-all duration-300 p-2 rounded-xl border ${isActive ? 'bg-muted border-border shadow-lg scale-105' : 'border-transparent hover:bg-muted/50 opacity-70'}`}
    >
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="currentColor" className="text-border" strokeWidth="4" fill="none" />
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
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-[13px] font-bold text-foreground">{score}</span>
          <span className="text-[9px] font-bold text-muted-foreground/80">/ {maxScore}</span>
        </div>
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold tracking-wider text-foreground/80 uppercase">{label}</span>
      </div>
    </button>
  );
};

function LearningPathDashboardContent() {
  const [selectedSkill, setSelectedSkill] = useState<string>('reading');
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'videos' | 'resources'>('overview');
  const [showDrill, setShowDrill] = useState(false);
  const [showUnitTest, setShowUnitTest] = useState(false);
  const [unitTestContent, setUnitTestContent] = useState<any>(null);
  const [drillContent, setDrillContent] = useState<any>(null);
  const [loadingDrill, setLoadingDrill] = useState(false);
  const [unitTestResults, setUnitTestResults] = useState<any>(null);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [loadingUnitTest, setLoadingUnitTest] = useState(false);
  const [pathData, setPathData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<'IELTS' | 'TOEFL'>('IELTS');
  const [isInitialized, setIsInitialized] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState<Record<string, boolean>>({});
  const [resourceCompleted, setResourceCompleted] = useState<Record<string, boolean>>({});
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);

  // Helper to extract YouTube ID
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return url;
  };

  // Access context methods for unit testing if wrapped in context provider
  const { takeUnitTest, submitTest } = useLearningPath() || {};

  const calculateMissionCompletion = (mission: any, phaseIndex: number, skillName: string = selectedSkill) => {
    const videos = mission.videos || [];
    const pdfs = mission.pdfs || [];
    const totalResources = videos.length + pdfs.length;
    
    // In real app, check mission.isCompleted for videos/pdfs, or default to true for mock
    // Check dynamic state or fallback to backend data
    const completedVideos = videos.filter((v: any, idx: number) => resourceCompleted[`${examType}-${skillName}-${phaseIndex}-video-${idx}`] || v.isCompleted === true).length;
    const completedPdfs = pdfs.filter((p: any, idx: number) => resourceCompleted[`${examType}-${skillName}-${phaseIndex}-pdf-${idx}`] || p.isCompleted === true).length;
    const completedResources = completedVideos + completedPdfs;
    
    const practiceDone = practiceCompleted[`${examType}-${skillName}-${phaseIndex}`] || false;
    const unitTestDone = practiceCompleted[`${examType}-${skillName}-${phaseIndex}-unitTest`] || false;
    // For unit test to unlock, they must have watched all videos, pdfs and practice drill
    const isPrepComplete = (totalResources > 0 ? completedResources >= totalResources : true) && practiceDone;
    
    return {
      isFullyComplete: mission.isCompleted || unitTestDone, // Should be true when unit test is passed
      isPrepComplete,
      completedResources,
      totalResources,
      practiceDone,
      unitTestDone
    };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlExamType = new URLSearchParams(window.location.search).get('exam');
      if (urlExamType === 'TOEFL' || urlExamType === 'IELTS') {
        setExamType(urlExamType as 'IELTS' | 'TOEFL');
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      fetchPath();
    }
  }, [examType, isInitialized]);

  const fetchPath = async () => {
    setLoading(true);
    try {
      const data = await getLearningPath(examType);
      if (data) {
        setPathData(data);
      }
    } catch (error) {
      console.error("Error fetching path:", error);
      // Fallback for demo if not logged in or API fails
      mockData();
    } finally {
      setLoading(false);
    }
  };

  const handleTakeUnitTest = async () => {
    if (!takeUnitTest) {
      console.warn("takeUnitTest not available in context. Using mock test.");
      setUnitTestContent({ questions: [{ question: "Mock unit test question?", options: ["A", "B", "C", "D"], correct_answer: 0 }] });
      setShowUnitTest(true);
      return;
    }
    try {
       setLoadingUnitTest(true);
       setIsSubmittingTest(true);
       const res = await takeUnitTest(activePhaseIndex, selectedSkill, examType);
       setUnitTestContent(res);
       setShowUnitTest(true);
       setUnitTestResults(null);
    } catch (err) {
       console.error("Failed to load unit test", err);
    } finally {
       setIsSubmittingTest(false);
       setLoadingUnitTest(false);
    }
  };

  const handleTakePracticeDrill = async () => {
    try {
      setLoadingDrill(true);
      const res = await generateUnitTest({
        skill: selectedSkill,
        level: pathData?.proficiencyLevel || 'easy',
        examType: examType
      });
      setDrillContent(res.data || res);
      setShowDrill(true);
    } catch (error) {
      console.error("Failed to generate practice drill:", error);
      // Fallback to static mock data
      setDrillContent({
        questions: pathData?.learningModeSections?.[selectedSkill] || pathData?.skills?.[selectedSkill]?.questions || []
      });
      setShowDrill(true);
    } finally {
      setLoadingDrill(false);
    }
  };

  const handleSubmitUnitTest = async (responses: any[]) => {
    if (!submitTest) {
      // Mock submit
      setUnitTestResults({ score: 10, total: 10, passed: true, message: "Mock passed" });
      setPracticeCompleted(prev => ({ ...prev, [`${examType}-${selectedSkill}-${activePhaseIndex}-unitTest`]: true }));
      return;
    }
    try {
       setIsSubmittingTest(true);
       const res = await submitTest(responses, selectedSkill, activePhaseIndex);
       setUnitTestResults(res);
       if (res?.passed) {
         setPracticeCompleted(prev => ({ ...prev, [`${examType}-${selectedSkill}-${activePhaseIndex}-unitTest`]: true }));
       }
    } catch (err) {
       console.error("Failed to submit test", err);
    } finally {
       setIsSubmittingTest(false);
    }
  };

  const mockData = () => {
    const queryLevel = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('level') : null;
    const computedLevel = queryLevel || 'easy';

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
      { id: Math.random(), title: `${skill} Phase ${phase} - Strategy Guide`, level: computedLevel, pdfLink: '#' },
      { id: Math.random(), title: `${skill} Phase ${phase} - Vocabulary List`, level: computedLevel, pdfLink: '#' },
      { id: Math.random(), title: `${skill} Phase ${phase} - Practice Drills`, level: computedLevel, pdfLink: '#' }
    ];

    const videos = examType === 'IELTS' ? ieltsVideos : toeflVideos;

    const mock = {
      proficiencyLevel: computedLevel,
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
  const currentMissionStatus = calculateMissionCompletion(currentPhase, activePhaseIndex);

  const getScore = (skill: string) => {
    const skillData = pathData?.skills?.[skill.toLowerCase()];
    if (!skillData || !skillData.missions || skillData.missions.length === 0) return 0;

    let totalItems = 0;
    let completedItems = 0;

    skillData.missions.forEach((mission: any, idx: number) => {
       const status = calculateMissionCompletion(mission, idx, skill.toLowerCase());
       
       totalItems += status.totalResources;
       completedItems += status.completedResources;
       
       totalItems += 1; // Practice
       if (status.practiceDone) completedItems += 1;

       totalItems += 1; // Unit test
       if (status.isFullyComplete) completedItems += 1;
    });

    if (totalItems === 0) return 0;

    const maxScore = examType === 'IELTS' ? 9 : 30;
    const rawScore = (completedItems / totalItems) * maxScore;

    if (examType === 'IELTS') {
      return Math.round(rawScore * 2) / 2; // Round to nearest 0.5
    } else {
      return Math.round(rawScore); // Round to nearest integer
    }
  };

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
          <h2 className="text-xl font-bold tracking-widest uppercase text-foreground">Missions</h2>
        </div>
        
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[11px] top-4 bottom-0 w-[2px] bg-linear-to-b from-[#10B981] via-[#10B981]/50 to-transparent" />
          
          {currentSkillData.missions.map((mission: any, idx: number) => {
            const prevMissionStatus = idx > 0 ? calculateMissionCompletion(currentSkillData.missions[idx - 1], idx - 1) : null;
            const isLocked = idx > 0 && !prevMissionStatus?.isFullyComplete;

            return (
            <div key={idx} className={`relative ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} onClick={() => !isLocked && setActivePhaseIndex(idx)}>
              <div className={`absolute -left-6 top-4 w-3 h-3 rounded-full ${idx === activePhaseIndex ? 'bg-[#10B981] shadow-[0_0_12px_#10B981]' : isLocked ? 'bg-muted' : 'bg-[#10B981]/50'}`} />
              <motion.div 
                className={`border rounded-xl p-4 transition-all ${idx === activePhaseIndex ? 'bg-muted/50 border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-transparent border-transparent hover:bg-muted/50 opacity-60'}`}
              >
                <div className={`flex items-center justify-between text-[10px] font-bold tracking-wider mb-1 ${idx === activePhaseIndex ? 'text-[#10B981]' : 'text-muted-foreground/60'}`}>
                  <span>PHASE 0{idx + 1}</span>
                  {isLocked && <Lock className="w-5 h-5 text-muted-foreground/60" />}
                </div>
                <div className="text-lg font-bold mb-1 relative z-10">{mission.title}</div>
              </motion.div>
            </div>
            );
          })}

          <div className="relative mt-8 pt-6">
            {(() => {
              // Lock mock exam if the last mission of the current skill isn't fully complete.
              // To unlock this manually later, you can simply change `isMockExamLocked` to `false` below.
              const lastMissionIdx = currentSkillData.missions.length > 0 ? currentSkillData.missions.length - 1 : -1;
              const lastMissionStatus = lastMissionIdx >= 0 ? calculateMissionCompletion(currentSkillData.missions[lastMissionIdx], lastMissionIdx) : null;
              const isMockExamLocked = lastMissionStatus ? !lastMissionStatus.isFullyComplete : true;

              return (
                <>
                  <div className={`absolute -left-6 top-10 w-3 h-3 rounded-full ${isMockExamLocked ? 'bg-muted' : 'bg-[#EAB308] shadow-[0_0_12px_#EAB308]'}`} />
                  {isMockExamLocked ? (
                    <div className="bg-muted/50 border border-border rounded-xl p-4 relative overflow-hidden opacity-60 cursor-not-allowed">
                      <div className="flex items-center justify-between mb-1 relative z-10">
                        <div className="text-[10px] text-muted-foreground/60 font-black tracking-wider">FINAL EVALUATION</div>
                        <Lock className="w-5 h-5 text-muted-foreground/60" />
                      </div>
                      <div className="text-lg font-bold text-foreground relative z-10">Mock Exam</div>
                      <div className="text-xs text-muted-foreground/80 mt-1 relative z-10">Complete all phases to unlock</div>
                    </div>
                  ) : (
                    <Link 
                      href="/dashboard/learning-path/mock-exam"
                      className="bg-linear-to-br from-[#EAB308]/20 to-transparent border border-[#EAB308]/50 rounded-xl p-4 shadow-[0_0_20px_rgba(234,179,8,0.15)] relative overflow-hidden group hover:from-[#EAB308]/30 transition-colors cursor-pointer block"
                    >
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-linear-to-r from-transparent to-foreground opacity-20 group-hover:animate-[shimmer_1.5s_infinite]" />
                      <div className="flex items-center justify-between mb-1 relative z-10">
                        <div className="text-[10px] text-[#EAB308] font-black tracking-wider">FINAL EVALUATION</div>
                        <Award className="w-5 h-5 text-[#EAB308]" />
                      </div>
                      <div className="text-lg font-bold text-foreground relative z-10">Mock Exam</div>
                      <div className="text-xs text-foreground/70 mt-1 relative z-10">Ready to start assessment</div>
                    </Link>
                  )}
                </>
              );
            })()}
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
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-2xl">
          {currentPhase.objective}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setViewMode('videos')}
            className="relative group p-8 rounded-2xl border border-border transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-muted/50 hover:bg-muted"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted text-foreground/80 group-hover:bg-[#10B981]/20 group-hover:text-[#10B981] transition-colors">
              <Play className="w-6 h-6 ml-1" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Video Lessons</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/50 text-[10px] font-bold tracking-wider text-muted-foreground">
                {currentPhase.videos.length} VIDEOS AVAILABLE
              </div>
            </div>
          </button>

          <button 
            onClick={() => setViewMode('resources')}
            className="relative group p-8 rounded-2xl border border-border transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-muted/50 hover:bg-muted"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted text-foreground/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Study Resources</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/50 text-[10px] font-bold tracking-wider text-muted-foreground">
                {currentPhase.pdfs.length} PDF GUIDES
              </div>
            </div>
          </button>

          <button 
            onClick={handleTakePracticeDrill}
            disabled={loadingDrill}
            className={`relative group p-8 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-4 ${loadingDrill ? 'bg-[#10B981]/5 border-[#10B981]/30 cursor-wait' : 'bg-muted/50 border-border hover:bg-muted'}`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${loadingDrill ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-muted text-foreground/80 group-hover:bg-[#10B981]/20 group-hover:text-[#10B981]'}`}>
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Practice Drill</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/50 text-[10px] font-bold tracking-wider text-muted-foreground">
                {loadingDrill ? 'GENERATING AI DRILL...' : 'INTERACTIVE SESSION'}
              </div>
            </div>
          </button>

          <button 
            disabled={!currentMissionStatus.isPrepComplete || loadingUnitTest}
            onClick={handleTakeUnitTest}
            className={`relative p-8 rounded-2xl border ${currentMissionStatus.isPrepComplete ? 'border-[#10B981]/50 bg-[#10B981]/10 hover:bg-[#10B981]/20 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-border/5 bg-muted/50 opacity-60 cursor-not-allowed'} flex flex-col items-center justify-center gap-4 transition-all duration-300`}
            style={!currentMissionStatus.isPrepComplete ? { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px)' } : {}}
          >
            {!currentMissionStatus.isPrepComplete && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-background/50 border border-border rounded text-[9px] font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" /> REQUIRED: FINISH PREP
              </div>
            )}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${currentMissionStatus.isPrepComplete ? 'bg-[#10B981] text-foreground shadow-lg' : 'bg-muted text-foreground/80'}`}>
              <Award className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-2 tracking-wide uppercase">Unit Test</div>
              {currentMissionStatus.isPrepComplete && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 text-[10px] font-bold tracking-wider text-[#10B981]">
                  {loadingUnitTest ? 'LOADING...' : currentMissionStatus.isFullyComplete ? 'PASSED' : 'READY TO START'}
                </div>
              )}
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
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg bg-muted/50 border border-border"
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
          <p className="text-muted-foreground/80 text-sm uppercase tracking-widest">{selectedSkill} • {pathData?.proficiencyLevel} LEVEL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPhase.videos.map((video: any, idx: number) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setResourceCompleted(prev => ({ ...prev, [`${examType}-${selectedSkill}-${activePhaseIndex}-video-${idx}`]: true }));
              setActiveVideoUrl(video.videolink || video.videoLink);
            }}
            className="bg-muted/50 border border-border rounded-2xl overflow-hidden group hover:border-[#10B981]/50 transition-all shadow-xl cursor-pointer"
          >
            <div className="aspect-video relative overflow-hidden bg-background/40">
              <img 
                src={video.thubnail || video.thumbnailLink || `https://img.youtube.com/vi/${(video.videolink || video.videoLink || '').split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                <div className="w-14 h-14 rounded-full bg-[#10B981] flex items-center justify-center text-foreground shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-[#10B981] transition-colors leading-tight">
                {video.title} {resourceCompleted[`${examType}-${selectedSkill}-${activePhaseIndex}-video-${idx}`] && <CheckCircle2 className="inline w-4 h-4 text-[#10B981] ml-2" />}
              </h3>
              <p className="text-muted-foreground/60 text-xs line-clamp-2 leading-relaxed italic">{video.description || 'Watch this tactical video to master the current skill sector.'}</p>
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
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-lg bg-muted/50 border border-border"
        >
          <ChevronLeft size={20} /> Back to Overview
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/50 flex items-center justify-center text-accent">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{currentPhase.title}: Study Guides</h2>
          <p className="text-muted-foreground/80 text-sm uppercase tracking-widest">{selectedSkill} • {pathData?.proficiencyLevel} LEVEL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentPhase.pdfs.map((pdf: any, idx: number) => (
          <div 
            key={idx}
            onClick={() => {
              setResourceCompleted(prev => ({ ...prev, [`${examType}-${selectedSkill}-${activePhaseIndex}-pdf-${idx}`]: true }));
              setActivePdfUrl(pdf.pdfLink || '#');
            }}
            className="flex items-center justify-between p-6 bg-muted/50 border border-border rounded-2xl group hover:border-accent/50 transition-all shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-accent group-hover:bg-accent/10 transition-colors shadow-inner">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-accent transition-colors text-lg leading-tight">
                  {pdf.title} {resourceCompleted[`${examType}-${selectedSkill}-${activePhaseIndex}-pdf-${idx}`] && <CheckCircle2 className="inline w-4 h-4 text-accent ml-2" />}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground/50 text-[10px] font-bold tracking-widest uppercase">PDF DOCUMENT</span>
                  <span className="w-1 h-1 rounded-full bg-muted/80" />
                  <span className="text-accent/70 text-[10px] font-bold tracking-widest uppercase">{pdf.level}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted/50 border border-border rounded-2xl text-muted-foreground group-hover:text-accent group-hover:bg-accent/20 group-hover:border-accent/30 transition-all shadow-sm">
              <FileText size={24} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full min-h-full bg-background text-foreground rounded-none lg:rounded-2xl overflow-hidden font-sans border-0 lg:border border-border shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-[#10B981]/5 to-transparent pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#10B981]/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-[#10B981] animate-spin" />
          </div>
          <p className="text-muted-foreground/60 tracking-widest uppercase font-bold animate-pulse">Initializing Phase Parameters...</p>
        </div>
      ) : (
        <div className="p-4 lg:p-10 relative z-10">
          {/* Current Level Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-black tracking-widest uppercase text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              {examType} LEVEL: {pathData?.proficiencyLevel || 'Easy'} MASTERY
            </h1>
          </div>

          {/* Header Row */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between bg-muted/50 border border-border rounded-2xl p-4 lg:p-6 mb-8 backdrop-blur-sm gap-4">
            <div className="flex items-center gap-2 lg:gap-8 overflow-x-auto custom-scrollbar pb-2 lg:pb-0 w-full lg:w-auto">
              <CircularGauge isActive={selectedSkill === 'reading'} onClick={() => { setSelectedSkill('reading'); setViewMode('overview'); setActivePhaseIndex(0); }} score={getScore('reading')} maxScore={examType === 'IELTS' ? 9 : 30} label="Reading" color="#10B981" />
              <CircularGauge isActive={selectedSkill === 'listening'} onClick={() => { setSelectedSkill('listening'); setViewMode('overview'); setActivePhaseIndex(0); }} score={getScore('listening')} maxScore={examType === 'IELTS' ? 9 : 30} label="Listening" color="#10B981" />
              <CircularGauge isActive={selectedSkill === 'writing'} onClick={() => { setSelectedSkill('writing'); setViewMode('overview'); setActivePhaseIndex(0); }} score={getScore('writing')} maxScore={examType === 'IELTS' ? 9 : 30} label="Writing" color="#F43F5E" />
              <CircularGauge isActive={selectedSkill === 'speaking'} onClick={() => { setSelectedSkill('speaking'); setViewMode('overview'); setActivePhaseIndex(0); }} score={getScore('speaking')} maxScore={examType === 'IELTS' ? 9 : 30} label="Speaking" color="#F59E0B" />
            </div>
            <div className="flex bg-muted p-1 rounded-lg border border-border shrink-0">
              <button 
                onClick={() => setExamType('IELTS')}
                className={`px-6 py-2 rounded-md transition-all font-bold text-sm ${examType === 'IELTS' ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-muted-foreground/80 hover:text-foreground'}`}
              >
                IELTS
              </button>
              <button 
                onClick={() => setExamType('TOEFL')}
                className={`px-6 py-2 rounded-md transition-all font-bold text-sm ${examType === 'TOEFL' ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-muted-foreground/80 hover:text-foreground'}`}
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
          skill={selectedSkill}
          examType={examType}
          questions={drillContent?.questions || drillContent || []}
          onClose={() => setShowDrill(false)} 
          onComplete={() => {
            setPracticeCompleted(prev => ({ ...prev, [`${examType}-${selectedSkill}-${activePhaseIndex}`]: true }));
            setShowDrill(false);
          }} 
        />
      )}

      <UnitTestOverlay 
        show={showUnitTest} 
        onClose={() => setShowUnitTest(false)}
        unitTestContent={unitTestContent}
        setUnitTestContent={setUnitTestContent}
        unitTestResults={unitTestResults}
        onSubmit={handleSubmitUnitTest}
        isSubmitting={isSubmittingTest}
        activeTab={selectedSkill}
      />

      {/* Video Overlay */}
      <AnimatePresence>
        {activeVideoUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-background/90 backdrop-blur-md p-4 lg:p-10"
          >
            <button onClick={() => setActiveVideoUrl(null)} className="absolute top-6 right-6 w-10 h-10 bg-muted hover:bg-muted/80 hover:text-red-500 rounded-full flex items-center justify-center transition-colors">
              <X size={24} />
            </button>
            <div className="w-full max-w-5xl aspect-video bg-background rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] border border-border relative">
              <iframe 
                src={getYouTubeEmbedUrl(activeVideoUrl)} 
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Overlay */}
      <AnimatePresence>
        {activePdfUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-100 flex flex-col bg-background/95 backdrop-blur-xl"
          >
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="text-accent" />
                <span className="font-bold tracking-widest uppercase text-foreground/80">Study Resource Reader</span>
              </div>
              <div className="flex items-center gap-4">
                <a href={activePdfUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <Download size={14} /> Open Native
                </a>
                <button onClick={() => setActivePdfUrl(null)} className="w-10 h-10 bg-muted/50 hover:bg-red-500/20 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-2 lg:p-6 h-full overflow-hidden">
              <iframe 
                src={activePdfUrl.startsWith('http') ? `https://docs.google.com/gview?url=${encodeURIComponent(activePdfUrl)}&embedded=true` : activePdfUrl} 
                className="w-full h-full rounded-xl bg-foreground shadow-2xl"
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearningPathDashboard() {
  return (
    <LearningPathProvider>
      <LearningPathDashboardContent />
    </LearningPathProvider>
  );
}
