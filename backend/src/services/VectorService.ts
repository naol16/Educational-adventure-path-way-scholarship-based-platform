import { Student } from "../models/Student.js";
import { Counselor } from "../models/Counselor.js";
import { GeminiIngestionService } from "./GeminiIngestionService.js";
import * as crypto from "crypto";
import { TextCleaner } from "../utils/textcleaner.js";


export class VectorService {
    private static formatValue(val: any): string {
        if (!val) return "";
        if (Array.isArray(val)) return val.join(", ");
        if (typeof val === 'string' && val.startsWith('[')) {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) return parsed.join(", ");
            } catch (e) { }
        }
        return val;
    }

    /**
     * Refined Student Context: Focus on dense keywords.
     */
    static async generateStudentEmbedding(student: Student): Promise<void> {
        // We use a structured list. This makes the "meaning" denser.
        const studentContext = `
            Location: ${this.formatValue(student.countryOfResidence)}
            Target_Location: ${this.formatValue(student.countryInterest || student.preferredCountries)}
            Level: ${this.formatValue(student.academicStatus || student.preferredDegreeLevel)}
            FieldOfStudy: ${this.formatValue(student.studyPreferences || student.fieldOfStudy)}
            Experience: ${this.formatValue(student.workExperience)}
            Requirements: ${this.formatValue(student.academicHistory)}
        `.replace(/\s+/g, ' ').trim();

        console.log(`[VectorService] Generated Context: "${studentContext}"`);

        const currentHash = crypto.createHash("md5").update(studentContext).digest("hex");

        if (!student.embedding || student.profileHash !== currentHash) {
            console.log(`[VectorService] Refreshing dense embedding for student ${student.id}...`);

            // TASK_TYPE: RETRIEVAL_QUERY (Standard for Google Gemini Embeddings)
            const vector = await GeminiIngestionService.generateEmbedding(
                studentContext,

            );

            await student.update({
                embedding: vector,
                profileHash: currentHash
            });
        }
    }

    /**
     * Refined Scholarship Context: Mirrors the student structure.
     */
    static async generateScholarshipEmbedding(scholarshipData: any): Promise<number[]> {
        const description = TextCleaner.prepare(scholarshipData.description);
        const requirements = TextCleaner.prepare(scholarshipData.requirements);
        const context = `
            Location: ${scholarshipData.country || ""}
            Target_Location: ${scholarshipData.country || ""}
            Level: ${(scholarshipData.degree_levels || scholarshipData.degreeLevels || []).join(", ")}
            FieldOfStudy: ${description || ""}
            Requirements: ${requirements || ""}
        `.replace(/\s+/g, ' ').trim();

        // TASK_TYPE: RETRIEVAL_DOCUMENT
        return GeminiIngestionService.generateEmbedding(
            context
        );
    }

    /**
     * Symmetric Context for Counselor Matching: Offering
     */
    static async generateCounselorEmbedding(counselor: Counselor): Promise<void> {
        const counselorContext = `
            Focus: ${counselor.areasOfExpertise || ""}
            Geography: ${[counselor.specializedCountries, counselor.studyCountry, counselor.countryOfResidence].filter(Boolean).join(", ")}
            Academic_Level: ${counselor.highestEducationLevel || ""}
            Field: ${counselor.fieldsOfStudy || ""}
            Expertise_Details: ${counselor.bio || ""} ${counselor.yearsOfExperience ? `Years experience: ${counselor.yearsOfExperience}` : ""}
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(counselorContext).digest("hex");

        if (!counselor.embedding || counselor.profileHash !== currentHash) {
            console.log(`[VectorService] Counselor Context for AI: "${counselorContext}"`);
            const vector = await GeminiIngestionService.generateEmbedding(counselorContext);

            await counselor.update({
                embedding: vector,
                profileHash: currentHash
            });
        }
    }

    /**
     * Symmetric Context for Counselor Matching: Request
     */
    static async generateStudentForCounselorEmbedding(student: Student): Promise<string> {
        const studentContext = `
            Focus: ${student.researchArea || student.studyPreferences || ""}
            Geography: ${[student.countryInterest, student.preferredCountries].filter(Boolean).join(", ")}
            Academic_Level: ${student.preferredDegreeLevel || ""}
            Field: ${student.fieldOfStudy || ""}
            Background_Details: ${student.workExperience || ""} ${student.academicHistory || ""}
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(studentContext).digest("hex");

        if (!student.counselorEmbedding || student.counselorProfileHash !== currentHash) {
            console.log(`[VectorService] Student Context for Counselor Matching: "${studentContext}"`);
            const vector = await GeminiIngestionService.generateEmbedding(studentContext);

            await student.update({
                counselorEmbedding: vector,
                counselorProfileHash: currentHash
            });
        }

        // Ensure it's returned as a pgvector-compatible string '[0.1, 0.2, ...]'
        const embed = student.counselorEmbedding;
        if (Array.isArray(embed)) {
            return `[${embed.join(",")}]`;
        }
        if (typeof embed === "string" && !embed.startsWith("[")) {
            return `[${embed}]`;
        }
        return embed;
    }
}
