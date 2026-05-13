export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: 'file' | 'text' | 'link';
}

export type EducationLevel = "High School" | "Bachelor's" | "Master's" | "PhD";

export const DOCUMENT_REQUIREMENTS: Record<EducationLevel, DocumentRequirement[]> = {
  "High School": [
    { id: 'transcript', name: 'Middle School Transcript', description: 'Your official transcript from previous years', required: true, type: 'file' },
    { id: 'id_proof', name: 'ID / Passport', description: 'Copy of your ID or Passport', required: true, type: 'file' },
    { id: 'recommendation', name: 'Recommendation Letter', description: 'Letter from a teacher or principal', required: false, type: 'file' },
  ],
  "Bachelor's": [
    { id: 'high_school_transcript', name: 'High School Transcript', description: 'Official transcript from Grade 9-12', required: true, type: 'file' },
    { id: 'grade_12_certificate', name: 'Grade 12 Certificate', description: 'Your final graduation certificate', required: true, type: 'file' },
    { id: 'english_proficiency', name: 'English Proficiency', description: 'IELTS, TOEFL, or Duolingo results', required: true, type: 'file' },
    { id: 'personal_statement', name: 'Personal Statement', description: 'Essay about your goals and motivations', required: true, type: 'file' },
    { id: 'cv', name: 'CV/Resume', description: 'Your updated resume', required: false, type: 'file' },
  ],
  "Master's": [
    { id: 'bachelor_degree', name: "Bachelor's Degree Certificate", description: 'Official degree certificate', required: true, type: 'file' },
    { id: 'university_transcript', name: 'University Transcript', description: 'Official transcript of your Bachelor studies', required: true, type: 'file' },
    { id: 'cv', name: 'CV/Resume', description: 'Your professional and academic resume', required: true, type: 'file' },
    { id: 'recommendation_letters', name: 'Recommendation Letters', description: 'At least two academic recommendation letters', required: true, type: 'file' },
    { id: 'personal_statement', name: 'Statement of Purpose', description: 'Detailed essay on research goals', required: true, type: 'file' },
  ],
  "PhD": [
    { id: 'master_degree', name: "Master's Degree Certificate", description: 'Official degree certificate', required: true, type: 'file' },
    { id: 'research_proposal', name: 'Research Proposal', description: 'Detailed plan of your intended research', required: true, type: 'file' },
    { id: 'publications', name: 'Publications', description: 'Links or copies of your published work', required: false, type: 'file' },
    { id: 'recommendation_letters', name: 'Recommendation Letters', description: 'Three academic recommendation letters', required: true, type: 'file' },
    { id: 'cv', name: 'Academic CV', description: 'Detailed academic resume', required: true, type: 'file' },
  ]
};
