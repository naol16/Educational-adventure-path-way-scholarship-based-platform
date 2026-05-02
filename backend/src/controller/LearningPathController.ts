import { Request, Response } from "express";
import { LearningPathService } from "../services/LearningPathService.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { LearningPathRepository } from "../repositories/LearningPathRepository.js";
import { ResponseHelper } from "../utils/responseHelper.js";

export class LearningPathController {
    /**
     * Gets the student's personalized learning path formatted by skill.
     */
    static async getMyPath(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return ResponseHelper.error(res, "Unauthorized", 401);
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return ResponseHelper.error(res, "Student profile not found", 404);
            }

            const examType = req.query.examType as string || "IELTS";
            const path = await LearningPathService.getFormattedPath(student.id, examType);

            return ResponseHelper.success(res, path);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message);
        }
    }

    /**
     * Marks a specific video or section as completed.
     */
    static async markComplete(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { videoId, pdfId, questionIndex, isNote, section, isCompleted, answer, examType } = req.body;

            if (!userId) {
                return ResponseHelper.error(res, "Unauthorized", 401);
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return ResponseHelper.error(res, "Student profile not found", 404);
            }

            const [progress, created] = await LearningPathProgress.findOrCreate({
                where: {
                    studentId: student.id,
                    videoId: videoId ?? null,
                    pdfId: pdfId ?? null,
                    questionIndex: questionIndex ?? null,
                    isNote: isNote ?? false,
                    section: section ? (section.charAt(0).toUpperCase() + section.slice(1).toLowerCase()) : section,
                    examType: examType || 'IELTS'
                },
                defaults: {
                    isCompleted: isCompleted ?? true,
                    answerText: answer ?? null,
                    examType: examType || 'IELTS'
                }
            });

            if (!created) {
                await progress.update({ 
                    isCompleted: isCompleted ?? true,
                    answerText: answer ?? progress.answerText
                });
            }

            return ResponseHelper.success(res, progress);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message);
        }
    }

    /**
     * Bulk marks an entire section (Reading, Listening, Writing, or Speaking) as completed.
     */
    static async markSectionComplete(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { section, examType } = req.body; // e.g. "Reading"

            if (!userId || !section) {
                return ResponseHelper.error(res, "Missing userId or section", 400);
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return ResponseHelper.error(res, "Student profile not found", 404);
            }

            const path = await LearningPathRepository.findByStudentId(student.id);
            if (!path) {
                return ResponseHelper.error(res, "Learning path not found", 404);
            }

            // Normalizing the section string to match keys in the JSON sections
            const lowerSection = section.toLowerCase();
            const normalizedSection = section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();
            const normalizedExamType = (examType || 'IELTS').toUpperCase();

            // 1. Get all Video IDs for this section
            const videoIds = (path.videoSections as any)[lowerSection] || [];
            
            // 2. Get the number of questions in the Learning Mode for this section
            const questions = (path.learningModeSections as any)[lowerSection] || [];

            // 3. Perform bulk operations
            // We use upsert-like logic: findOrCreate or just bulk create/update.
            // For simplicity and to ensure data integrity, we'll iterate through and mark each.
            
            // Mark all videos
            for (const vId of videoIds) {
                await LearningPathProgress.findOrCreate({
                    where: { studentId: student.id, videoId: vId, section: normalizedSection, examType: normalizedExamType },
                    defaults: { isCompleted: true, examType: normalizedExamType }
                }).then(([progress, created]) => {
                   if (!created) progress.update({ isCompleted: true });
                });
            }

            // Mark all questions
            for (let i = 0; i < questions.length; i++) {
                await LearningPathProgress.findOrCreate({
                    where: { studentId: student.id, questionIndex: i, section: normalizedSection, examType: normalizedExamType },
                    defaults: { isCompleted: true, examType: normalizedExamType }
                }).then(([progress, created]) => {
                   if (!created) progress.update({ isCompleted: true });
                });
            }

            // Mark the note
            await LearningPathProgress.findOrCreate({
                where: { studentId: student.id, isNote: true, section: normalizedSection, examType: normalizedExamType },
                defaults: { isCompleted: true, examType: normalizedExamType }
            }).then(([progress, created]) => {
                if (!created) progress.update({ isCompleted: true });
            });

            // Return success
            return ResponseHelper.success(res, null, `${normalizedSection} section marked as complete.`);

        } catch (error: any) {
            return ResponseHelper.error(res, error.message);
        }
    }

    /**
     * Evaluates a speaking practice response using AI.
     */
    static async evaluateSpeaking(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { questionIndex } = req.body;
            
            // express-fileupload attaches files to req.files
            const files = (req as any).files;
            const audioFile = files?.audio;

            if (!userId) {
                return ResponseHelper.error(res, "Unauthorized", 401);
            }

            if (!audioFile) {
                return ResponseHelper.error(res, "No audio file provided. Please upload as 'audio' field.", 400);
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return ResponseHelper.error(res, "Student profile not found", 404);
            }

            // Normalizing file if it's an array
            const actualFile = Array.isArray(audioFile) ? audioFile[0] : audioFile;

            const result = await LearningPathService.evaluateSpeakingPractice(
                student.id,
                parseInt(questionIndex as string),
                actualFile.data.toString("base64"),
                actualFile.mimetype
            );

            return ResponseHelper.success(res, result);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message);
        }
    }

    /**
     * Generates a unit test for a specific mission/skill.
     */
    static async generateUnitTest(req: Request, res: Response) {
        try {
            const { skill, level, examType } = req.body;
            const test = await LearningPathService.generateUnitTest(skill, level, examType);
            return ResponseHelper.success(res, test);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message);
        }
    }

    /**
     * Dynamically generates a full mission (Practice & Unit Test) using AI.
     */
    static async generateDynamicMission(req: Request, res: Response) {
        try {
            const { skill, level, topic, missionIndex, examType } = req.body;
            
            if (!skill || !level || !topic) {
                return ResponseHelper.error(res, "Missing skill, level, or topic", 400);
            }

            let examTypeToUse = examType;
            if (!examTypeToUse && req.user?.id) {
                const student = await StudentRepository.findByUserId(req.user.id);
                if (student) {
                    const path = await LearningPathRepository.findByStudentId(student.id);
                    if (path) examTypeToUse = path.examType;
                }
            }

            const parsedIndex = missionIndex !== undefined ? parseInt(missionIndex, 10) : 0;
            const missionData = await LearningPathService.generateMissionContent(
                skill, 
                level, 
                topic, 
                parsedIndex, 
                examTypeToUse || 'IELTS'
            );
            
            return ResponseHelper.success(res, missionData);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message);
        }
    }

    /**
     * Submits a unit test for evaluation.
     */
    static async submitUnitTest(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { skill, responses, missionIndex } = req.body;

            if (!userId) {
                return ResponseHelper.error(res, "Unauthorized", 401);
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return ResponseHelper.error(res, "Student profile not found", 404);
            }

            const result = await LearningPathService.evaluateUnitTest(student.id, skill, responses, missionIndex);
            
            return ResponseHelper.success(res, result);
        } catch (error: any) {
            return ResponseHelper.error(res, error.message);
        }
    }
}
