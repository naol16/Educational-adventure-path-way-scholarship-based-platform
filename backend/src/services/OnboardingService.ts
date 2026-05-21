import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";
import { AIService } from "./AIService.js";
import { IdentityService } from "./IdentityService.js";
import { FileService } from "./FileService.js";
import { VectorService } from "./VectorService.js";
import { MatchingService } from "./MatchingService.js";
import { sendEmail } from "../utils/emailService.js";
import { ScholarshipNotificationService } from "./ScholarshipNotificationService.js";
import { AuthService } from "./AuthService.js";


export class OnboardingService {
    /**
     * Stage 1: Intelligence Extraction from Transcript/CV Image
     */
    static async extractData(userId: number, role: string, fileBuffer: Buffer, mimeType: string) {
        // 1. Upload to Cloudinary
        const documentUrl = await FileService.uploadFile(fileBuffer, `onboarding/${role}s`);

        // 2. Perform Vision extraction
        const extractedData = await AIService.extractOnboardingData(fileBuffer, mimeType, role);

        let repository: any;
        if (role === UserRole.STUDENT) {
            repository = StudentRepository;
        } else if (role === UserRole.COUNSELOR) {
            repository = CounselorRepository;
        }

        if (!repository) throw new Error(`Invalid role: ${role}`);

        let instance = await repository.findByUserId(userId);
        if (!instance) {
            console.log(`Creating missing ${role} record for user ${userId}`);
            instance = await repository.create({ userId });
        }

        // 3. Update repository with both URL and extracted JSON
        await repository.update(userId, {
            documentUrl,
            extractedData: JSON.stringify(extractedData)
        });

        return {
            documentUrl,
            extractedData
        };
    }

    /**
     * Stage 2: Biometric Identity Matching
     */
    static async verifyIdentity(userId: number, idCardBuffer: Buffer, selfieBuffer: Buffer) {
        return IdentityService.performBiometricCheck(userId, idCardBuffer, selfieBuffer);
    }

    /**
     * Stage 3: Update Profile and Complete Onboarding
     */
    static async updateProfile(userId: number, updateData: any, files?: { [key: string]: any }) {
        console.log(`[OnboardingService] Starting updateProfile for user ${userId}`);
        try {
            const user = await UserRepository.findById(userId);
            if (!user) throw new Error("User not found");

            let repository: any;
            if (user.role === UserRole.STUDENT) {
                repository = StudentRepository;
            } else if (user.role === UserRole.COUNSELOR) {
                repository = CounselorRepository;
            }

            if (!repository) throw new Error(`Invalid role: ${user.role}`);

            const instance = await repository.findByUserId(userId);
            if (!instance) {
                console.log(`[OnboardingService] No ${user.role} record found, creating one...`);
                await repository.create({ userId });
            }

            if (user.role === UserRole.STUDENT) {
                const safeStringify = (val: any) => {
                    if (val === undefined || val === null) return val;
                    if (Array.isArray(val) || typeof val === 'object') return JSON.stringify(val);
                    return val;
                };

                const updateFields: any = {
                    isOnboarded: true
                };

                // Handle file uploads if any
                let cvUrl = instance?.cvUrl;
                let transcriptUrl = instance?.transcriptUrl;
                let degreeCertificateUrl = instance?.degreeCertificateUrl;
                let languageCertificateUrl = instance?.languageCertificateUrl;

                if (files) {
                    if (files.cv && files.cv.size > 0) cvUrl = await FileService.uploadFile(files.cv.tempFilePath || files.cv.data, "documents/cvs");
                    
                    const transcriptFile = files.university_transcript || files.high_school_transcript || files.transcript;
                    if (transcriptFile && transcriptFile.size > 0) transcriptUrl = await FileService.uploadFile(transcriptFile.tempFilePath || transcriptFile.data, "documents/transcripts");
                    
                    const degreeFile = files.bachelor_degree || files.master_degree || files.grade_12_certificate || files.degreeCertificate || files.certificate;
                    if (degreeFile && degreeFile.size > 0) degreeCertificateUrl = await FileService.uploadFile(degreeFile.tempFilePath || degreeFile.data, "documents/certificates/degree");
                    
                    const langFile = files.english_proficiency || files.languageCertificate;
                    if (langFile && langFile.size > 0) languageCertificateUrl = await FileService.uploadFile(langFile.tempFilePath || langFile.data, "documents/certificates/language");

                    if (files.recommendation_letters && files.recommendation_letters.size > 0) {
                        updateFields.recommendationLettersUrl = await FileService.uploadFile(files.recommendation_letters.tempFilePath || files.recommendation_letters.data, "documents/recommendations");
                    }
                    if (files.personal_statement && files.personal_statement.size > 0) {
                        updateFields.sopUrl = await FileService.uploadFile(files.personal_statement.tempFilePath || files.personal_statement.data, "documents/sop");
                    }
                    if (files.research_proposal && files.research_proposal.size > 0) {
                        updateFields.researchProposalUrl = await FileService.uploadFile(files.research_proposal.tempFilePath || files.research_proposal.data, "documents/proposals");
                    }
                    if (files.publications && files.publications.size > 0) {
                        updateFields.publicationsUrl = await FileService.uploadFile(files.publications.tempFilePath || files.publications.data, "documents/publications");
                    }
                    if (files.id_proof && files.id_proof.size > 0) {
                        updateFields.idCardUrl = await FileService.uploadFile(files.id_proof.tempFilePath || files.id_proof.data, "documents/identity");
                    }

                    // Student profile image is on User model
                    if (files.avatar && files.avatar.size > 0) {
                        const avatarUrl = await FileService.uploadFile(files.avatar.tempFilePath || files.avatar.data, "profiles/avatars");
                        await UserRepository.update(userId, { avatarUrl } as any);
                    }
                }

                if (updateData.fullName) {
                    await UserRepository.update(userId, { name: updateData.fullName } as any);
                }

                // Map form data to database fields
                if (updateData.gpa !== undefined || updateData.calculatedGpa !== undefined) {
                    updateFields.calculatedGpa = updateData.gpa || updateData.calculatedGpa;
                }
                
                if (updateData.academicHistory !== undefined) updateFields.academicHistory = safeStringify(updateData.academicHistory);
                if (updateData.studyPreferences !== undefined) updateFields.studyPreferences = safeStringify(updateData.studyPreferences);
                if (updateData.intakeSeason !== undefined) updateFields.intakeSeason = updateData.intakeSeason;
                if (updateData.fundingRequirement !== undefined || updateData.preferredFundingType !== undefined) {
                    const fundingVal = updateData.preferredFundingType || updateData.fundingRequirement;
                    updateFields.fundingRequirement = Array.isArray(fundingVal) ? JSON.stringify(fundingVal) : fundingVal;
                }
                if (updateData.gender !== undefined) updateFields.gender = updateData.gender;
                if (updateData.age !== undefined) updateFields.age = parseInt(updateData.age as string) || null;
                if (updateData.workExperience !== undefined) updateFields.workExperience = safeStringify(updateData.workExperience);
                if (updateData.countryInterest !== undefined || updateData.targetLocation !== undefined) {
                    updateFields.countryInterest = updateData.countryInterest || updateData.targetLocation;
                }
                if (updateData.highSchool !== undefined) updateFields.highSchool = updateData.highSchool;
                if (updateData.currentEducationLevel !== undefined || updateData.academicStatus !== undefined) {
                    updateFields.academicStatus = updateData.currentEducationLevel || updateData.academicStatus;
                }
                if (updateData.dateOfBirth !== undefined) updateFields.dateOfBirth = updateData.dateOfBirth;
                if (updateData.nationality !== undefined) updateFields.nationality = updateData.nationality;
                if (updateData.countryOfResidence !== undefined) updateFields.countryOfResidence = updateData.countryOfResidence;
                if (updateData.city !== undefined) updateFields.city = updateData.city;
                if (updateData.phoneNumber !== undefined) updateFields.phoneNumber = updateData.phoneNumber;

                if (updateData.fieldOfStudyInput !== undefined || updateData.fieldOfStudy !== undefined) {
                    updateFields.fieldOfStudy = safeStringify(updateData.fieldOfStudyInput || updateData.fieldOfStudy);
                }
                if (updateData.preferredDegreeLevel !== undefined) updateFields.preferredDegreeLevel = safeStringify(updateData.preferredDegreeLevel);
                if (updateData.preferredCountries !== undefined) updateFields.preferredCountries = safeStringify(updateData.preferredCountries);
                if (updateData.preferredUniversities !== undefined) updateFields.preferredUniversities = safeStringify(updateData.preferredUniversities);
                if (updateData.notificationPreferences !== undefined || updateData.notifications !== undefined) {
                    updateFields.notificationPreferences = safeStringify(updateData.notifications || updateData.notificationPreferences);
                }
                if (updateData.studyMode !== undefined) updateFields.studyMode = safeStringify(updateData.studyMode);
                if (updateData.needsFinancialSupport !== undefined) updateFields.needsFinancialSupport = (updateData.needsFinancialSupport === 'true' || updateData.needsFinancialSupport === true);
                if (updateData.familyIncomeRange !== undefined) updateFields.familyIncomeRange = updateData.familyIncomeRange;
                if (updateData.researchArea !== undefined) updateFields.researchArea = updateData.researchArea;
                if (updateData.proposedResearchTopic !== undefined) updateFields.proposedResearchTopic = updateData.proposedResearchTopic;
                
                if (updateData.currentUniversity !== undefined || updateData.previousUniversity !== undefined) {
                    updateFields.currentUniversity = updateData.currentUniversity || updateData.previousUniversity;
                }
                
                if (updateData.graduationYear !== undefined) updateFields.graduationYear = parseInt(updateData.graduationYear as string) || null;
                if (updateData.degreeSeeking !== undefined) updateFields.degreeSeeking = updateData.degreeSeeking;
                
                if (updateData.languageTestType !== undefined) updateFields.languageTestType = updateData.languageTestType;
                if (updateData.languageScore !== undefined || updateData.testScore !== undefined) {
                    const scoreStr = updateData.languageScore || updateData.testScore;
                    updateFields.languageScore = scoreStr;
                    const scoreNum = parseFloat(scoreStr as string);
                    
                    if (!isNaN(scoreNum)) {
                        if (updateFields.languageTestType === 'IELTS') updateFields.ieltsScore = scoreNum;
                        else if (updateFields.languageTestType === 'TOEFL') updateFields.toeflScore = Math.round(scoreNum);
                        else if (updateFields.languageTestType === 'Duolingo') updateFields.duolingoScore = Math.round(scoreNum);
                    }
                }

                if (cvUrl) updateFields.cvUrl = cvUrl;
                if (transcriptUrl) updateFields.transcriptUrl = transcriptUrl;
                if (degreeCertificateUrl) {
                    updateFields.degreeCertificateUrl = degreeCertificateUrl;
                }
                if (languageCertificateUrl) updateFields.languageCertificateUrl = languageCertificateUrl;

                console.log(`[OnboardingService] Updating student ${userId} with fields:`, Object.keys(updateFields));
                const updatedStudent = await repository.update(userId, updateFields);

                if (updatedStudent) {
                    try {
                        console.log(`[OnboardingService] Generating embedding for student ${userId}`);
                        await VectorService.generateStudentEmbedding(updatedStudent);
                    } catch (err) {
                        console.error("[OnboardingService] Failed to generate student embedding:", err);
                    }
                    
                    // Trigger match notifications
                    setTimeout(async () => {
                        try {
                            const matchesData = await MatchingService.getTopMatches(userId, 50);
                            if (matchesData.rows.length > 0) {
                                await ScholarshipNotificationService.notifyMultipleMatches(user, updatedStudent, matchesData.rows);
                            }
                        } catch (err) {
                            console.error("[OnboardingService] Background match notification failed:", err);
                        }
                    }, 1000);
                }
            } else if (user.role === UserRole.COUNSELOR) {
                const counselorUpdates: any = {
                    bio: updateData.bio || instance?.bio || "",
                    areasOfExpertise: updateData.areasOfExpertise ? (typeof updateData.areasOfExpertise === 'string' ? updateData.areasOfExpertise : JSON.stringify(updateData.areasOfExpertise)) : instance?.areasOfExpertise || "[]",
                    yearsOfExperience: updateData.yearsOfExperience || instance?.yearsOfExperience || 0,
                    isOnboarded: true
                };

                if (files && files.avatar) {
                    const avatarUrl = await FileService.uploadFile(files.avatar.tempFilePath || files.avatar.data, "profiles/avatars");
                    await UserRepository.update(userId, { avatarUrl } as any);
                    counselorUpdates.profileImageUrl = avatarUrl;
                }

                await repository.update(userId, counselorUpdates);
            }

            console.log(`[OnboardingService] Update complete for user ${userId}`);
            return await AuthService.getUserWithProfile(user);
        } catch (error) {
            console.error(`[OnboardingService] Error updating profile for user ${userId}:`, error);
            throw error;
        }
    }
}
