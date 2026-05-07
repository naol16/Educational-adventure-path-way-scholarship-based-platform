import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import configs from "../config/configs.js";
import { AIChatMessage } from "../models/AIChatMessage.js";
import { Scholarship } from "../models/Scholarship.js";

const groq = new Groq({ apiKey: configs.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY as string);

export class AIChatService {
    static async askGeneralAssistant(message: string, sessionId: string, userId?: number) {
        // Fetch recent history for this session
        const history = await AIChatMessage.findAll({
            where: { sessionId, scholarshipId: null },
            order: [['createdAt', 'ASC']],
            limit: 20
        });

        // Save user message
        await AIChatMessage.create({
            sessionId,
            userId,
            role: 'user',
            content: message
        });

        const messages = [
            { role: "system", content: "You are 'Path Finder', a helpful and friendly AI assistant for the Educational Pathway platform. You help students discover scholarships, learn English (IELTS/TOEFL), prepare for visas, and navigate their educational journey. Keep your answers concise, encouraging, and highly relevant." },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: message }
        ];

        let assistantMessage = "";
        try {
            console.log(`[AIChatService] Requesting Groq for General Assistant (Session: ${sessionId})...`);
            const completion = await groq.chat.completions.create({
                messages: messages as any[],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 1024,
            });
            assistantMessage = completion.choices[0]?.message?.content || "";
            console.log(`[AIChatService] Groq Response received (Length: ${assistantMessage.length})`);
        } catch (err: any) {
            console.warn(`[AIChatService] Groq failed for General Assistant: ${err.message}. Falling back to Gemini...`);
            try {
                const model = genAI.getGenerativeModel({ model: configs.GEMINI_MODEL || "gemini-1.5-flash" });
                const result = await model.generateContent({
                    contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
                });
                assistantMessage = result.response.text();
                console.log("[AIChatService] Gemini fallback successful.");
            } catch (geminiErr: any) {
                console.error(`[AIChatService] Gemini fallback failed: ${geminiErr.message}`);
                assistantMessage = "I'm sorry, I couldn't process that right now.";
            }
        }

        // Save assistant message
        const savedAssistantMsg = await AIChatMessage.create({
            sessionId,
            userId,
            role: 'assistant',
            content: assistantMessage
        });

        return savedAssistantMsg;
    }

    static async askScholarshipAssistant(scholarshipId: number, message: string, sessionId: string, userId?: number) {
        const scholarship = await Scholarship.findByPk(scholarshipId);
        if (!scholarship) throw new Error("Scholarship not found");

        const history = await AIChatMessage.findAll({
            where: { sessionId, scholarshipId },
            order: [['createdAt', 'ASC']],
            limit: 20
        });

        await AIChatMessage.create({
            sessionId,
            userId,
            scholarshipId,
            role: 'user',
            content: message
        });

        const systemPrompt = `You are 'Path Finder', a specialized AI assistant helping a student with a specific scholarship. 
Scholarship Details:
Title: ${scholarship.title}
Country: ${scholarship.country}
Degree Levels: ${Array.isArray(scholarship.degreeLevels) ? scholarship.degreeLevels.join(', ') : scholarship.degreeLevels}
Funding Type: ${scholarship.fundType}
Requirements: ${scholarship.requirements}
Description: ${scholarship.description}

Answer the student's questions specifically regarding this scholarship. Be concise, informative, and encouraging.`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: message }
        ];

        let assistantMessage = "";
        try {
            console.log(`[AIChatService] Requesting Groq for Scholarship Assistant (Scholarship: ${scholarshipId}, Session: ${sessionId})...`);
            const completion = await groq.chat.completions.create({
                messages: messages as any[],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 1024,
            });
            assistantMessage = completion.choices[0]?.message?.content || "";
            console.log(`[AIChatService] Groq Response received (Length: ${assistantMessage.length})`);
        } catch (err: any) {
            console.warn(`[AIChatService] Groq failed for Scholarship Assistant: ${err.message}. Falling back to Gemini...`);
            try {
                const model = genAI.getGenerativeModel({ model: configs.GEMINI_MODEL || "gemini-1.5-flash" });
                const result = await model.generateContent({
                    contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
                });
                assistantMessage = result.response.text();
                console.log("[AIChatService] Gemini fallback successful.");
            } catch (geminiErr: any) {
                console.error(`[AIChatService] Gemini fallback failed: ${geminiErr.message}`);
                assistantMessage = "I'm sorry, I couldn't process that right now.";
            }
        }

        const savedAssistantMsg = await AIChatMessage.create({
            sessionId,
            userId,
            scholarshipId,
            role: 'assistant',
            content: assistantMessage
        });

        return savedAssistantMsg;
    }

    static async getHistory(sessionId: string, scholarshipId?: number) {
        const whereClause: any = { sessionId };
        if (scholarshipId) {
            whereClause.scholarshipId = scholarshipId;
        } else {
            whereClause.scholarshipId = null;
        }

        return await AIChatMessage.findAll({
            where: whereClause,
            order: [['createdAt', 'ASC']],
            limit: 50
        });
    }
}
