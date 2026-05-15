import { Request, Response } from "express";
import { MockExamService } from "../services/MockExamService.js";

export class MockExamController {
  static async generate(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assumes auth middleware
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { examType } = req.body;
      const data = await MockExamService.generateExam(userId, examType || "IELTS");

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("[MockExamController] Generate Error:", error);
      res.status(500).json({ error: "Failed to generate mock exam." });
    }
  }

  static async evaluate(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { examId, answers } = req.body;
      if (!examId || !answers) {
        return res.status(400).json({ error: "examId and answers are required." });
      }

      const data = await MockExamService.evaluateExam(examId, userId, answers);

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("[MockExamController] Evaluate Error:", error);
      res.status(500).json({ error: error.message || "Failed to evaluate exam." });
    }
  }

  static async getResult(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { examId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { redisConnection } = await import("../config/redis.js");
      const resultStr = await redisConnection.get(`mock_exam_result:${examId}`);

      if (!resultStr) {
        return res.status(404).json({ error: "Result not found or expired." });
      }

      const data = JSON.parse(resultStr);

      // Verify ownership
      if (data.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("[MockExamController] Get Result Error:", error);
      res.status(500).json({ error: "Failed to retrieve result." });
    }
  }
}
