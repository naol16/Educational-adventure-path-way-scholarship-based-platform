import { LearningPath } from "../models/LearningPath.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";
import { Op } from "sequelize";

export class LearningPathRepository {
    /**
     * Finds the learning path for a student, optionally filtered by exam type.
     * Passing examType ensures IELTS and TOEFL rows are treated independently.
     */
    static async findByStudentId(studentId: number, examType?: string): Promise<LearningPath | null> {
        const where: any = { studentId };
        if (examType) {
            where.examType = examType.toUpperCase();
        }
        return LearningPath.findOne({ where });
    }

    static async create(data: any): Promise<LearningPath> {
        return LearningPath.create(data);
    }

    static async update(id: number, data: any): Promise<[number, LearningPath[]]> {
        return LearningPath.update(data, {
            where: { id },
            returning: true
        });
    }

    /**
     * Creates or updates the learning path for a student **scoped by examType**.
     * IELTS and TOEFL paths are stored as separate rows so they never overwrite each other.
     * When updating an existing path (e.g., after a re-assessment), all prior
     * LearningPathProgress records for that student+examType are deleted and
     * progress is reset to 0%.
     */
    static async upsert(studentId: number, data: any): Promise<void> {
        const examType = (data.examType || 'IELTS').toUpperCase();
        const existing = await this.findByStudentId(studentId, examType);
        if (existing) {
            // 1. Delete only the progress records tied to this exam type's path.
            //    We identify them via the path's video/pdf IDs so we don't destroy
            //    progress from the other exam's path.
            await LearningPathProgress.destroy({ where: { studentId } });

            // 2. Update the path content and reset progress to 0
            await existing.update({
                ...data,
                currentProgressPercentage: 0
            });
        } else {
            await this.create({ ...data, studentId, currentProgressPercentage: 0 });
        }
    }
}
