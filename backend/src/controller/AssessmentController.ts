import { Request, Response, NextFunction } from "express";
import { AssessmentService } from "../services/AssessmentService.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { LearningPathRepository } from "../repositories/LearningPathRepository.js";
import { AssessmentResult } from "../models/AssessmentResult.js";

export class AssessmentController {
  static async generate(req: Request, res: Response, next: NextFunction) {
    try {
      let examTypeRaw = typeof req.body?.examType === "string" ? req.body.examType.trim() : "";
      const difficulty = "medium"; // Standardized
      const skill = typeof req.body?.skill === "string" ? req.body.skill.trim() : undefined;

      const student = req.user?.id ? await StudentRepository.findByUserId(req.user.id) : null;

      // Fallback to student's previous preference if not provided
      if (!examTypeRaw && student) {
        const path = await LearningPathRepository.findByStudentId(student.id);
        if (path && path.examType) {
          examTypeRaw = path.examType;
        } else {
           // Try to find from any previous assessment
           const { AssessmentRepository } = await import("../repositories/AssessmentRepository.js");
           const lastResult = await AssessmentResult.findOne({ where: { studentId: student.id }, order: [['createdAt', 'DESC']] });
           if (lastResult) examTypeRaw = lastResult.examType;
        }
      }

      if (!examTypeRaw) {
        res.status(400).json({ error: "examType is required" });
        return;
      }

      const examTypeUpper = examTypeRaw.toUpperCase();
      if (!["IELTS", "TOEFL"].includes(examTypeUpper)) {
        res.status(400).json({ error: "examType must be IELTS or TOEFL" });
        return;
      }

      let isDiagnostic = false;

      if (student && !skill) {
        // Check if they already have a diagnostic for THIS exam type
        const { AssessmentRepository } = await import("../repositories/AssessmentRepository.js");
        const diagnostic = await AssessmentRepository.findDiagnostic(student.id, examTypeUpper);
        
        if (!diagnostic) {
          isDiagnostic = true;
          console.log(`[AssessmentController] Student ${student.id} has no diagnostic for ${examTypeUpper}. Setting isDiagnostic=true.`);
        } else {
          // They have a diagnostic for this exam type, so this is a Mock Exam. Check gating.
          const path = await LearningPathRepository.findByStudentId(student.id, examTypeUpper);
          if (!req.body?.force && path && path.currentProgressPercentage < 100) {
            res.status(403).json({
              error: "Learning path completion required.",
              message: "You must complete 100% of your learning path before generating a full mock exam.",
              currentProgress: path.currentProgressPercentage
            });
            return;
          }
          console.log(`[AssessmentController] Student ${student.id} has diagnostic. Generating MOCK EXAM.`);
        }
      }

      const result = await AssessmentService.generateExam(examTypeUpper as any, difficulty as any, skill, student?.id, isDiagnostic);
      res.status(201).json({ ...result, isDiagnostic });
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { test_id, responses: rawResponses } = req.body;
      if (!test_id || !rawResponses) {
        res.status(400).json({ error: "test_id and responses are required" });
        return;
      }

      // Normalize responses: may arrive as a JSON string (multipart) or object (JSON body)
      let parsedResponses = rawResponses;
      if (typeof rawResponses === "string") {
        try {
          parsedResponses = JSON.parse(rawResponses);
        } catch (e) {
          res
            .status(400)
            .json({
              error:
                "responses must be a valid JSON object or stringified JSON",
            });
          return;
        }
      }

      let audioData: { buffer: Buffer; mimetype: string } | undefined;
      // express-fileupload attaches files to req.files
      if (req.files && req.files.audio) {
        const audioFile = Array.isArray(req.files.audio)
          ? req.files.audio[0]
          : req.files.audio;
        if (audioFile) {
          audioData = {
            buffer: audioFile.data,
            mimetype: audioFile.mimetype,
          };
        }
      }

      const student = await StudentRepository.findByUserId(req.user!.id);
      if (!student) {
        res.status(404).json({ error: "Student profile not found" });
        return;
      }

      // Check if this test was marked as diagnostic in the DB
      const { AssessmentResult } = await import("../models/AssessmentResult.js");
      const testRecord = await AssessmentResult.findOne({ where: { testId: test_id } });
      const isDiagnostic = testRecord ? testRecord.isDiagnostic : false;
      
      const result = await AssessmentService.submitAssessment(
        test_id,
        parsedResponses,
        student.id,
        audioData,
        isDiagnostic
      );
      if (result.status === "processing") {
         console.log(`[AssessmentController] ⚠️ Redis unavailable. Processing ${test_id} in background fallback.`);
      } else {
         console.log(`[AssessmentController] ✅ Job added to queue for test_id: ${test_id}`);
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async submitSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { test_id, skill, responses } = req.body;
      const parsedResponses = typeof responses === "string" ? JSON.parse(responses) : responses;

      let audioData: { buffer: Buffer; mimetype: string } | undefined;
      if (req.files && req.files.audio) {
        const audioFile = Array.isArray(req.files.audio) ? req.files.audio[0] : req.files.audio;
        if (audioFile) {
          audioData = { buffer: audioFile.data, mimetype: audioFile.mimetype };
        }
      }

      const student = await StudentRepository.findByUserId(req.user!.id);
      if (!student) {
        res.status(404).json({ error: "Student profile not found" });
        return;
      }

      const result = await AssessmentService.evaluateSkillSection(
        test_id,
        skill,
        parsedResponses,
        student.id,
        audioData
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { test_id } = req.params;
      if (!test_id || typeof test_id !== "string") {
        res
          .status(400)
          .json({ error: "test_id is required and must be a string" });
        return;
      }

      const result = await AssessmentService.getAssessmentResult(test_id);

      if (!result) {
        res.status(404).json({ error: "Result not found or still processing" });
        return;
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const examType = req.query.examType as string | undefined;
      const student = await StudentRepository.findByUserId(req.user!.id);
      if (!student) {
        res.status(404).json({ error: "Student profile not found" });
        return;
      }
      const progress = await AssessmentService.getStudentProgress(
        student.id as number,
        examType,
      );
      res.json({
        status: "success",
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reset(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await StudentRepository.findByUserId(req.user!.id);
      if (!student) {
        res.status(404).json({ error: "Student profile not found" });
        return;
      }

      await AssessmentService.resetAssessment(student.id as number);
      res.json({
        status: "success",
        message: "Assessment and learning path reset successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}
