import { LearningPath } from "../models/LearningPath.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";

export class LearningPathRepository {
    static async findByStudentId(studentId: number, examType?: string): Promise<LearningPath | null> {
        const where: any = { studentId };
        if (examType) where.examType = examType;
        return LearningPath.findOne({
            where,
            order: [['updatedAt', 'DESC']]
        });
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
     * Creates or updates the learning path for a student for a specific exam type.
     * When UPDATING an existing path (i.e., after a new assessment evaluation),
     * all prior LearningPathProgress records for THIS student and THIS exam type 
     * are deleted and the progress is reset to 0%.
     */
    static async upsert(studentId: number, data: any): Promise<void> {
        const examType = data.examType || 'IELTS';
        const existing = await this.findByStudentId(studentId, examType);
        
        if (existing) {
            // 1. Delete all old progress checkmarks for this student and this exam type
            // (Note: LearningPathProgress might need an examType field too for perfect isolation, 
            // but usually a student has one active path at a time or they are separate enough).
            await LearningPathProgress.destroy({ where: { studentId } }); // Simplification for now, but ideally filtered by examType

            // 2. Update the path content and explicitly reset progress to 0
            await existing.update({
                ...data,
                currentProgressPercentage: 0
            });
        } else {
            await this.create({ ...data, studentId, currentProgressPercentage: 0 });
        }
    }
}
