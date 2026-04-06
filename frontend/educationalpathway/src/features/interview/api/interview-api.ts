import api from "@/lib/api";

export interface InterviewOptions {
  examType: "IELTS" | "TOEFL";
  proficiencyLevel?: string;
}

export const generateInterview = async (options: InterviewOptions) => {
  const response = await api.post("/interview/generate", options);
  return response.data;
};

export const submitInterview = async (
  interviewId: string,
  responses: Record<string, string>,
) => {
  const response = await api.post("/interview/submit", {
    interview_id: interviewId,
    responses,
  });
  return response.data;
};

export const getInterviewSession = async (interviewId: string) => {
  const response = await api.get(`/interview/session/${interviewId}`);
  return response.data;
};
