export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  id: string;
  title: string; // Job title
  company: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  highlights: string[];
  keywords: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  achievements?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  keywords: string[];
  yearsOfExperience?: number;
}

export interface Keywords {
  [key: string]: number; // keyword -> weight mapping
}

export interface ResumeData {
  id?: string;
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    url?: string;
    technologies?: string[];
  }>;
  parsedData?: {
    rawText: string;
    keywords: Keywords;
    atsScore: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ParsedSkill {
  name: string;
  level?: string;
}

export interface ParsedResume {
  text: string;
  rawText: string; // Required field
  technicalSkills: ParsedSkill[];
  softSkills: ParsedSkill[];
  industryKeywords: string[];
  certifications: string[];
  actionVerbs: string[];
  atsScore: number;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    title?: string;
  };
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    highlights: string[];
    keywords: string[];
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    field: string;
    location?: string;
    startDate: string;
    endDate: string;
    gpa?: number;
    highlights: string[];
  }>;
}
