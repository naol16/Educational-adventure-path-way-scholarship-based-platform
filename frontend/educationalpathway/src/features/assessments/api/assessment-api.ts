import api from '@/lib/api';

/** Canonical four skills for IELTS / TOEFL diagnostics and mock exams (matches backend). */
export const EXAM_SKILL_ORDER = [
  'reading',
  'listening',
  'writing',
  'speaking',
] as const;

export type ExamSkillId = (typeof EXAM_SKILL_ORDER)[number];

export interface StandardExamReport {
  exam_type: 'IELTS' | 'TOEFL';
  skills: readonly ExamSkillId[];
  section_score_range: { min: number; max: number };
  overall_score_range: { min: number; max: number };
  overall_rule: string;
}

export interface AssessmentOptions {
  examType: string;
  difficulty: string;
}

export const generateAssessment = async (options: AssessmentOptions) => {
  const response = await api.post('/assessment/generate', options);
  return response.data;
};

export const submitAssessment = async (testId: string, responses: unknown, audio?: Blob) => {
  if (audio) {
    // Multipart form with audio file
    const formData = new FormData();
    formData.append('test_id', testId);
    formData.append('responses', JSON.stringify(responses));
    formData.append('audio', audio, 'recording.webm');

    const response = await api.post('/assessment/submit', formData);
    return response.data;
  }

  // JSON body when no audio (avoids multipart parsing overhead)
  const response = await api.post('/assessment/submit', {
    test_id: testId,
    responses,
  });
  return response.data;
};

export const submitSection = async (testId: string, skill: string, responses: unknown, audio?: Blob) => {
  const formData = new FormData();
  formData.append('test_id', testId);
  formData.append('skill', skill);
  formData.append('responses', JSON.stringify(responses));
  if (audio) {
    formData.append('audio', audio, 'section_recording.webm');
  }

  const response = await api.post('/assessment/submit-section', formData);
  return response.data;
};

export const getAssessmentResult = async (testId: string) => {
  const response = await api.get(`/assessment/result/${testId}`);
  return response.data;
};

export const getAssessmentProgress = async (examType?: string) => {
  const response = await api.get('/assessment/progress', { params: { examType } });
  return response.data;
};

export const getLearningPath = async (examType?: string) => {
    const response = await api.get('/learning-path/my-path', { params: { examType } });
    return response.data;
};

export const trackProgress = async (params: { videoId?: number; questionIndex?: number; isNote?: boolean; section: string; isCompleted?: boolean; answer?: string }) => {
    const { videoId, questionIndex, isNote, section, isCompleted = true, answer } = params;
    const response = await api.post('/learning-path/track', { videoId, questionIndex, isNote, section, isCompleted, answer });
    return response.data;
};

export const completeSection = async (section: string) => {
    const response = await api.post('/learning-path/complete-section', { section });
    return response.data;
};

export const evaluateSpeakingPractice = async (questionIndex: number, audio: Blob) => {
    const formData = new FormData();
    formData.append('questionIndex', questionIndex.toString());
    formData.append('audio', audio, 'practice_recording.webm');

    const response = await api.post('/learning-path/speaking/evaluate', formData);
    return response.data;
};

export const generateDynamicMission = async (params: { skill: string; level: string; topic: string; missionIndex?: number }) => {
    const response = await api.post('/learning-path/mission/generate-dynamic', params);
    return response.data;
};

export const generateUnitTest = async (params: { skill: string; level: string; examType?: string }) => {
    const response = await api.post('/learning-path/unit-test/generate', params);
    return response.data;
};

export const submitUnitTest = async (params: { skill: string; responses: any[]; missionIndex: number }) => {
    const response = await api.post('/learning-path/unit-test/submit', params);
    return response.data;
};
