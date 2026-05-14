import { Student } from "../models/Student.js";

export class StudentRepository {
    static async findByUserId(userId: number): Promise<Student | null> {
        return Student.findOne({ where: { userId } });
    }

    static async create(data: any): Promise<Student> {
        return Student.create(data);
    }

    static async update(userId: number, updates: any): Promise<Student | null> {
        const student = await this.findByUserId(userId);
        if (!student) return null;
        return student.update(updates);
    }

    static calculateCompletion(student: Student): number {
        const fields = [
            'nationality',
            'countryOfResidence',
            'phoneNumber',
            'academicStatus',
            'calculatedGpa',
            'fieldOfStudy',
            'graduationYear',
            'preferredDegreeLevel',
            'preferredCountries',
            'intakeSeason',
            'fundingRequirement',
            'cvUrl',
            'transcriptUrl',
            'degreeCertificateUrl',
            'gender',
            'dateOfBirth',
            'city',
            'currentUniversity',
            'identityVerified',
            'recommendationLettersUrl',
            'sopUrl',
            'researchProposalUrl',
            'languageScore',
            'workExperience'
        ];

        let completedFields = 0;
        fields.forEach(field => {
            const value = (student as any)[field];
            if (value !== null && value !== undefined && value !== '' && value !== '[]' && value !== '{}') {
                completedFields++;
            }
        });

        // Check if user has a name (often always true but good for consistency)
        if (student.user && student.user.name) {
            completedFields++;
        }

        // Base 30% for being a registered and onboarded student
        const base = student.isOnboarded ? 30 : 10;
        const totalPossibleFields = fields.length + 1; // +1 for name
        const perField = (100 - base) / totalPossibleFields;
        
        const percentage = Math.round(base + (completedFields * perField));
        return Math.min(100, percentage);
    }
}
