"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  getLearningPath, 
  trackProgress, 
  completeSection,
  evaluateSpeakingPractice,
  generateUnitTest,
  submitUnitTest
} from "@/features/assessments/api/assessment-api";
import { toast } from "react-hot-toast";

interface Video {
  id: number;
  videolink: string;
  thubnail: string;
  title?: string;
  isCompleted?: boolean;
}

interface Mission {
  title: string;
  objective: string;
  videos: Video[];
  pdfs: any[]; 
  isCompleted: boolean;
  isUnitTestCompleted: boolean;
}

interface SkillData {
  videos: Video[];
  notes: string;
  isNoteCompleted?: boolean;
  missions: Mission[];
}

interface LearningPathData {
  proficiencyLevel: 'easy' | 'medium' | 'hard';
  skills: Record<string, SkillData>;
  learningMode?: Record<string, any>;
  competencyGapAnalysis?: any;
  curriculumMap?: any;
  current_progress_percentage?: number;
  examType?: string;
  exam_type?: string;
}

interface LearningPathContextType {
  data: LearningPathData | null;
  loading: boolean;
  error: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  load: () => Promise<void>;
  toggleVideo: (videoId: number, skill: string) => Promise<void>;
  toggleNote: (skill: string) => Promise<void>;
  selectAnswer: (skill: string, qIndex: number, answer: string) => Promise<void>;
  evaluateSpeaking: (qIndex: number, blob: Blob, skill: string) => Promise<any>;
  takeUnitTest: (mIndex: number, skill: string, envMode: string) => Promise<any>;
  submitTest: (responses: any[], skill: string, mIndex: number) => Promise<any>;
  finalizeSection: (skill: string) => Promise<void>;
  
  // Internal states for UI
  practiceAnswers: Record<string, Record<number, string>>;
  showExplanation: Record<string, Record<number, boolean>>;
  evaluationResults: Record<number, any>;
  evaluating: Record<number, boolean>;
  completedSections: Record<string, boolean>;
  envMode: "IELTS" | "TOEFL";
  setEnvMode: (mode: "IELTS" | "TOEFL") => void;
}

const LearningPathContext = createContext<LearningPathContextType | undefined>(undefined);

export const LearningPathProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("reading");
  
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, Record<number, string>>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, Record<number, boolean>>>({});
  const [evaluationResults, setEvaluationResults] = useState<Record<number, any>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  const [envMode, setEnvMode] = useState<"IELTS" | "TOEFL">("IELTS");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLearningPath();
      const pathData = res?.skills ? res : (res?.data?.skills ? res.data : null);
      if (pathData) {
        setData(pathData);
        const initialExplanations: Record<string, Record<number, boolean>> = {};
        const initialAnswers: Record<string, Record<number, string>> = {};

        Object.keys(pathData.skills).forEach((skill) => {
          initialExplanations[skill] = {};
          initialAnswers[skill] = {};
          const modeData = pathData.learningMode?.[skill];
          const questions = Array.isArray(modeData) ? modeData : modeData?.questions || [];
          questions.forEach((q: any, i: number) => {
            if (q.isCompleted) {
              initialExplanations[skill][i] = true;
              const pastAnswer = q.user_answer || q.userAnswer || q.answer_text;
              if (pastAnswer) initialAnswers[skill][i] = pastAnswer;
            }
          });
        });

        setPracticeAnswers(prev => ({ ...prev, ...initialAnswers }));
        setShowExplanation(prev => ({ ...prev, ...initialExplanations }));
        const skills = Object.keys(pathData.skills);
        if (skills.length > 0 && !skills.includes(activeTab)) setActiveTab(skills[0]);
      } else {
        setError("Not found");
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? "Not found" : "Error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, []);

  const toggleVideo = async (videoId: number, skill: string) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const video = newData.skills[skill].videos.find((v: any) => v.id === videoId);
      if (video) video.isCompleted = !video.isCompleted;
      return newData;
    });
    try {
      const currentVideoStatus = data?.skills[skill]?.videos.find(v => v.id === videoId)?.isCompleted;
      await trackProgress({ videoId, section: skill, isCompleted: !currentVideoStatus });
    } catch (error) {}
  };

  const toggleNote = async (skill: string) => {
    if (!data) return;
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      newData.skills[skill].isNoteCompleted = !newData.skills[skill].isNoteCompleted;
      return newData;
    });
    try {
      await trackProgress({ section: skill, isNote: true, isCompleted: !data.skills[skill].isNoteCompleted });
    } catch (error) {}
  };

  const selectAnswer = async (skill: string, qIndex: number, answer: string) => {
    setPracticeAnswers(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: answer } }));
    setShowExplanation(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: true } }));
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const modeData = newData?.learningMode?.[skill];
      const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
      if (questions[qIndex]) questions[qIndex].isCompleted = true;
      return newData;
    });
    try {
      await trackProgress({ questionIndex: qIndex, section: skill, isCompleted: true, answer: answer });
    } catch (error) {}
  };

  const evaluateSpeaking = async (qIndex: number, blob: Blob, skill: string) => {
    try {
      setEvaluating(prev => ({ ...prev, [qIndex]: true }));
      const result = await evaluateSpeakingPractice(qIndex, blob);
      const normalizedResult = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result;
      if (normalizedResult) {
        setEvaluationResults(prev => ({ ...prev, [qIndex]: normalizedResult }));
        setShowExplanation(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: true } }));
        setData(prev => {
          if (!prev) return prev;
          const newData = JSON.parse(JSON.stringify(prev));
          const modeData = newData?.learningMode?.[skill];
          const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
          if (questions[qIndex]) questions[qIndex].isCompleted = true;
          return newData;
        });
        return normalizedResult;
      }
    } finally {
      setEvaluating(prev => ({ ...prev, [qIndex]: false }));
    }
  };

  const takeUnitTest = async (mIndex: number, skill: string, envMode: string) => {
    const res = await generateUnitTest({ skill, level: data?.proficiencyLevel || 'easy', examType: envMode });
    return res?.data || res;
  };

  const submitTest = async (responses: any[], skill: string, mIndex: number) => {
    const res = await submitUnitTest({ skill, responses, missionIndex: mIndex });
    if (res?.data?.passed || res?.passed) await load();
    return res?.data || res;
  };

  const finalizeSection = async (skill: string) => {
    await completeSection(skill);
    setCompletedSections(prev => ({ ...prev, [skill]: true }));
    await load(); 
    toast.success(`${skill.toUpperCase()} phase synchronized.`);
  };

  return (
    <LearningPathContext.Provider value={{
      data, loading, error, activeTab, setActiveTab, load,
      toggleVideo, toggleNote, selectAnswer, evaluateSpeaking,
      takeUnitTest, submitTest, finalizeSection,
      practiceAnswers, showExplanation, evaluationResults, evaluating, completedSections,
      envMode, setEnvMode
    }}>
      {children}
    </LearningPathContext.Provider>
  );
};

export const useLearningPath = () => {
  const context = useContext(LearningPathContext);
  if (!context) throw new Error("useLearningPath must be used within LearningPathProvider");
  return context;
};
