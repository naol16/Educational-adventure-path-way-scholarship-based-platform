import { Request, Response, NextFunction } from "express";
import { AIChatService } from "../services/AIChatService.js";

export class AIChatController {
    static async askGeneral(req: Request, res: Response, next: NextFunction) {
        try {
            const { message, sessionId } = req.body;
            const userId = req.user?.id; // from auth middleware if present

            if (!message || !sessionId) {
                return res.status(400).json({ error: "Message and sessionId are required" });
            }

            const response = await AIChatService.askGeneralAssistant(message, sessionId, userId);
            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    static async askScholarship(req: Request, res: Response, next: NextFunction) {
        try {
            const { message, sessionId } = req.body;
            const { id } = req.params;
            const userId = req.user?.id;

            if (!message || !sessionId || !id) {
                return res.status(400).json({ error: "Message, sessionId, and scholarship id are required" });
            }

            const response = await AIChatService.askScholarshipAssistant(Number(id), message, sessionId, userId);
            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    static async getHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId, scholarshipId } = req.query;

            if (!sessionId) {
                return res.status(400).json({ error: "sessionId is required" });
            }

            const history = await AIChatService.getHistory(
                String(sessionId),
                scholarshipId ? Number(scholarshipId) : undefined
            );
            res.json(history);
        } catch (error) {
            next(error);
        }
    }
}
