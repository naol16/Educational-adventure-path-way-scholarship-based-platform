import configs from "../config/configs.js";
import { VisaMockInterview, VisaGuideline } from "../models/index.js";
import Groq from "groq-sdk";
import fs from "fs";

const groq = new Groq({ apiKey: configs.GROQ_API_KEY });

type InterviewEvaluation = {
  score: string;
  grammar: string;
  confidence: string;
  feedback: string;
  confidence_score: number;
  country_specific_flags: string[];
  focus_areas: string[];
  improvements: string[];
  evaluation_source?: string;
};

export class VisaService {
  static async getGuidelines(country: string) {
    return await VisaGuideline.findOne({
      where: { country },
    });
  }

  static async initiateCall(studentInfo: {
    studentId: number;
    studentName: string;
    university: string;
    country: string;
    interviewType?: string;
  }) {
    const { studentId, studentName, university, country, interviewType = "visa" } = studentInfo;

    const interview = await VisaMockInterview.create({
      studentId,
      country,
      status: "Pending",
    });

    let systemPrompt = "";
    let firstMessage = "";

    if (interviewType === "scholarship") {
      systemPrompt = `Role: Senior Scholarship Committee Director for ${university} in ${country}
Greeting: You MUST start the conversation immediately by greeting the applicant and asking about their academic motivation.
Context:
- University: ${university}
- Applicant Name: ${studentName}
Rules:
- Be professional, inquisitive, and inspiring.
- Keep the interview concise: ask 5-7 focused questions.
- Focus on leadership, academic goals, community impact, and alignment with scholarship values.
- Do not ask for documentation. Focus purely on their spoken responses and critical thinking.`;
      
      firstMessage = `Welcome, ${studentName}. I am the Scholarship Committee Director for ${university}. We have reviewed your application and are excited to speak with you today. To begin, could you tell me what drives your academic passion in your chosen field?`;
    } else if (interviewType === "admission") {
      systemPrompt = `Role: University Admissions Officer for ${university} in ${country}
Greeting: You MUST start the conversation immediately by greeting the applicant and asking why they chose this university.
Context:
- University: ${university}
- Applicant Name: ${studentName}
Rules:
- Be welcoming but analytical.
- Keep the interview concise: ask 5-7 focused questions.
- Focus on academic readiness, extracurriculars, and cultural fit for the university.
- Do not ask for documentation.`;
      
      firstMessage = `Hello ${studentName}! I'm the Admissions Officer representing ${university}. It's great to meet you. Let's dive right in—out of all the institutions in ${country}, why did you specifically choose us?`;
    } else {
      systemPrompt = `Role: Strict Consular Officer for ${country}
Greeting: You MUST start the conversation immediately by greeting the applicant and asking their purpose of travel.
Context:
- University: ${university}
- Applicant Name: ${studentName}
Rules:
- Be professional, firm, and slightly skeptical.
- Keep the interview concise: ask 5-7 focused questions.
- If the applicant is vague, ask follow-up questions.
- Focus on spoken interview performance, clarity, confidence, consistency, and credibility.
- Do not ask the applicant to show passport or upload documents.`;

      firstMessage = `Good morning. I am the Consular Officer for ${country}. I see you are applying to study at ${university}. What is the main purpose of your travel today?`;
    }

    return {
      interviewId: interview.id,
      systemPrompt,
      firstMessage
    };
  }

  static async transcribeAudio(filePath: string): Promise<string> {
    try {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
      });
      return transcription.text;
    } finally {
      if (fs.existsSync(filePath)) {
        fs.promises.unlink(filePath).catch(console.error);
      }
    }
  }

  static async getChatCompletion(messages: any[], isJson: boolean = false): Promise<string> {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      response_format: isJson ? { type: "json_object" } : { type: "text" },
    });
    return response.choices[0]?.message?.content || "";
  }

  static async evaluateCall(payload: {
    interviewId: string;
    transcript: Array<{ role: string; content: string }>;
    interviewType?: string;
  }) {
    const { interviewId, transcript, interviewType = "visa" } = payload;
    let interview = await VisaMockInterview.findByPk(interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    const hasUserSpoken = transcript.some(m => m.role === 'user');
    if (!hasUserSpoken) {
      const emptyEvaluation: InterviewEvaluation = {
        score: "0/10",
        grammar: "N/A",
        confidence: "None",
        feedback: "No speech detected. Please participate in the interview by speaking into the microphone to receive an evaluation.",
        confidence_score: 0,
        country_specific_flags: ["No user input"],
        focus_areas: ["Engagement"],
        improvements: ["Ensure microphone permissions are granted and speak clearly during the interview."],
        evaluation_source: "system_validation"
      };
      
      await interview.update({
        transcript,
        aiEvaluation: emptyEvaluation,
        status: "Evaluated"
      });
      
      return emptyEvaluation;
    }

    let evaluationCriteria = "";
    if (interviewType === "scholarship") {
      evaluationCriteria = `
      You are a Senior Scholarship Committee Director. Evaluate the following scholarship interview transcript with high academic standards.
      
      Evaluation Criteria:
      1. Academic Motivation: Is the applicant genuinely passionate about their field?
      2. Leadership & Impact: Did they demonstrate leadership or a desire to impact their community?
      3. Fit for Scholarship: Does their vision align with top-tier academic funding?
      4. Articulation: Did they communicate their ideas clearly and confidently?
      
      SCORING RULE (ZERO TOLERANCE): 
      - Give a score of 0/10 if:
        * The applicant remains silent or provides gibberish.
        * The applicant is off-topic.
      - If answers are vague or lack depth, the score MUST be below 4.0.`;
    } else if (interviewType === "admission") {
      evaluationCriteria = `
      You are a University Admissions Officer. Evaluate the following admission interview transcript with high standards.
      
      Evaluation Criteria:
      1. University Fit: Why did they choose this specific university?
      2. Academic Readiness: Are they prepared for rigorous academic study?
      3. Extracurriculars: Do they bring value outside of academics?
      4. Communication: Did they communicate their ideas clearly?
      
      SCORING RULE (ZERO TOLERANCE): 
      - Give a score of 0/10 if the applicant remains silent or provides gibberish.
      - If answers are generic and show no research about the university, the score MUST be below 4.0.`;
    } else {
      evaluationCriteria = `
      You are a senior US Embassy Consular Chief. Evaluate the following visa interview transcript with extreme skepticism and high standards.
      
      Evaluation Criteria:
      1. Intent to Return: Does the applicant have strong ties to their home country?
      2. Financial Stability: Did they explain their funding source clearly?
      3. Academic Purpose: Do they know their program, university, and how it fits their career?
      4. Credibility: Are there inconsistencies? (e.g. saying 'visit California' for a student visa is a RED FLAG).
      
      SCORING RULE (ZERO TOLERANCE): 
      - Give a score of 0/10 if:
        * The applicant remains silent or provides "unlistened sound" (noise/gibberish).
        * The applicant provides unrelated or nonsensical answers.
        * The applicant uses offensive or violating speech.
        * The applicant fails to provide ANY meaningful academic or travel justification.
      - If the applicant's answers are vague, one-liners, or fail to address academic goals for a student visa, the score MUST be below 3.0.
      - "Visiting California" for a student visa is an automatic REJECTION (score < 2.0).`;
    }

    const evaluationPrompt = `
      ${evaluationCriteria}

      You MUST provide your response in valid JSON format ONLY with the following schema:
      {
        "score": (string, e.g., "0/10" or "2.5/10"),
        "grammar": (string, brief analysis of grammar and vocabulary),
        "confidence": (string, e.g., "High", "Moderate", "Low"),
        "feedback": (string, detailed suggestions for improvement),
        "confidence_score": (number 1-10),
        "country_specific_flags": (array of strings, e.g. ["Zero Meaning", "Unrelated Response"]),
        "focus_areas": (array of strings),
        "improvements": (array of strings)
      }

      Transcript:
      ${JSON.stringify(transcript)}
    `;

    try {
      const aiResponse = await this.getChatCompletion([{ role: "user", content: evaluationPrompt }], true);
      const evaluationData = JSON.parse(aiResponse);

      const evaluation: InterviewEvaluation = {
        ...evaluationData,
        evaluation_source: "groq_llama_evaluation"
      };

      await interview.update({
        transcript: transcript,
        aiEvaluation: evaluation,
        status: "Evaluated"
      });

      return evaluation;
    } catch (error) {
      console.error("[VisaService] Error during evaluation:", error);
      await interview.update({
        status: "Failed",
        aiEvaluation: {
          score: "N/A",
          grammar: "N/A",
          confidence: "N/A",
          feedback: "An error occurred while analyzing the transcript.",
          confidence_score: 0,
          country_specific_flags: ["Evaluation Error"],
          focus_areas: ["System Error"],
          improvements: ["Please retry the interview later."]
        }
      });
      throw error;
    }
  }

  static async getStudentHistory(studentId: number) {
    return await VisaMockInterview.findAll({
      where: { studentId, status: "Evaluated" },
      order: [["createdAt", "DESC"]],
    });
  }
}
