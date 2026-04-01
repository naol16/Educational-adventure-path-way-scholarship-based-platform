import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { v4 as uuidv4 } from "uuid";
import configs from "../config/configs.js";
import { redisConnection } from "../config/redis.js";

const interviewModel = new ChatGoogleGenerativeAI({
  model: configs.GEMINI_MODEL as string,
  apiKey: configs.GEMINI_API_KEY as string,
  temperature: 0.2,
  maxOutputTokens: 4096,
});

type ExamType = "IELTS" | "TOEFL";
type ProficiencyLevel = "easy" | "medium" | "hard";

function sanitizeJSONString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  cleaned = cleaned.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, "");
  return cleaned.trim();
}

function normalizeExamType(examType: string): ExamType {
  return examType.toUpperCase() === "TOEFL" ? "TOEFL" : "IELTS";
}

function normalizeLevel(level?: string): ProficiencyLevel {
  if (level === "hard") return "hard";
  if (level === "medium") return "medium";
  return "easy";
}

export class InterviewService {
  static async generateInterview(examType: string, proficiencyLevel?: string) {
    const interviewId = uuidv4();
    const normalizedExamType = normalizeExamType(examType);
    const normalizedLevel = normalizeLevel(proficiencyLevel);

    const prompt = PromptTemplate.fromTemplate(`
      Role: Senior English Interview Coach
      Task: Generate a focused speaking interview practice session for a student preparing for the {examType} exam.
      Proficiency level: {proficiencyLevel}

      Requirements:
      - The interview must feel realistic and exam-specific.
      - IELTS should lean into cue-card and follow-up speaking prompts.
      - TOEFL should lean into integrated speaking tasks and academic responses.
      - Keep the interview separated from the main assessment exam.
      - Include warm-up, core, and follow-up questions.
      - Include short coach notes and preparation tips.

      Return valid JSON with this schema:
      {{
        "interview_id": "string",
        "exam_summary": {{ "type": "IELTS|TOEFL", "proficiency_level": "easy|medium|hard" }},
        "introduction": "string",
        "warm_up_questions": [{{ "id": 1, "question": "string", "objective": "string" }}],
        "core_questions": [{{ "id": 1, "question": "string", "follow_up": "string", "tip": "string" }}],
        "follow_up_questions": [{{ "id": 1, "question": "string", "objective": "string" }}],
        "coach_notes": "string",
        "preparation_tips": ["string"]
      }}

      JSON rules:
      - Output only JSON.
      - Use double quotes for all keys and string values.
      - Do not include trailing commas.
      - Escape line breaks as \\n inside string values.
    `);

    const chain = prompt.pipe(interviewModel).pipe(new StringOutputParser());
    const response = await chain.invoke({
      examType: normalizedExamType,
      proficiencyLevel: normalizedLevel,
      interviewId,
    });

    let interview;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const rawJson = jsonMatch ? jsonMatch[0] : response;
    try {
      interview = JSON.parse(sanitizeJSONString(rawJson));
    } catch (error) {
      throw new Error(
        "Interview generation failed due to invalid AI response.",
      );
    }

    interview.interview_id = interviewId;
    interview.exam_summary = interview.exam_summary || {
      type: normalizedExamType,
      proficiency_level: normalizedLevel,
    };

    await redisConnection.set(
      `interview:${interviewId}`,
      JSON.stringify(interview),
      "EX",
      7200,
    );

    return interview;
  }

  static async getInterview(interviewId: string) {
    const stored = await redisConnection.get(`interview:${interviewId}`);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  }

  static async submitInterview(interviewId: string, responses: unknown) {
    const stored = await redisConnection.get(`interview:${interviewId}`);
    if (!stored) {
      throw new Error("Interview session not found or expired.");
    }

    const session = JSON.parse(stored);
    const prompt = PromptTemplate.fromTemplate(`
      Role: Senior English Interview Assessor
      Task: Evaluate a student's IELTS/TOEFL interview practice answers.

      Interview session: {session}
      Student responses: {responses}

      Evaluate the response quality, fluency, coherence, grammar, lexical range, and task relevance.
      Return only valid JSON with this schema:
      {{
        "overall_score": 0.0,
        "score_breakdown": {{ "fluency": 0.0, "coherence": 0.0, "grammar": 0.0, "lexical_resource": 0.0 }},
        "feedback": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "model_response_guidance": ["string"],
        "next_steps": ["string"]
      }}

      JSON rules:
      - Output only JSON.
      - Use double quotes for all keys and string values.
      - Do not include trailing commas.
    `);

    const chain = prompt.pipe(interviewModel).pipe(new StringOutputParser());
    const response = await chain.invoke({
      session: JSON.stringify(session),
      responses: JSON.stringify(responses),
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const rawJson = jsonMatch ? jsonMatch[0] : response;
    const evaluation = JSON.parse(sanitizeJSONString(rawJson));

    const result = {
      interview_id: interviewId,
      exam_summary: session.exam_summary,
      responses,
      evaluation,
    };

    await redisConnection.set(
      `interview-result:${interviewId}`,
      JSON.stringify(result),
      "EX",
      7200,
    );

    return result;
  }

  static async getInterviewResult(interviewId: string) {
    const stored = await redisConnection.get(`interview-result:${interviewId}`);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  }
}
