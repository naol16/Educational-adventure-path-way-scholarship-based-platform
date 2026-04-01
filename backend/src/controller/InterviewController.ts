import { Request, Response, NextFunction } from "express";
import { InterviewService } from "../services/InterviewService.js";

export class InterviewController {
  static async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const examType =
        typeof req.body?.examType === "string" ? req.body.examType.trim() : "";
      const proficiencyLevel =
        typeof req.body?.proficiencyLevel === "string"
          ? req.body.proficiencyLevel.trim().toLowerCase()
          : "";

      if (!examType) {
        res.status(400).json({ error: "examType is required" });
        return;
      }

      if (!["IELTS", "TOEFL"].includes(examType.toUpperCase())) {
        res.status(400).json({ error: "examType must be IELTS or TOEFL" });
        return;
      }

      const result = await InterviewService.generateInterview(
        examType,
        proficiencyLevel || undefined,
      );

      res.status(201).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewId =
        typeof req.params.interview_id === "string"
          ? req.params.interview_id.trim()
          : "";
      if (!interviewId) {
        res.status(400).json({ error: "interview_id is required" });
        return;
      }

      const result = await InterviewService.getInterview(interviewId);
      if (!result) {
        res.status(404).json({ error: "Interview not found or expired" });
        return;
      }

      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { interview_id, responses } = req.body;
      if (!interview_id || !responses) {
        res
          .status(400)
          .json({ error: "interview_id and responses are required" });
        return;
      }

      const result = await InterviewService.submitInterview(
        interview_id,
        responses,
      );
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }
}
