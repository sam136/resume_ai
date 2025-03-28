import mongoose, { Schema, Document } from 'mongoose';
import { ParsedResume } from "../types";

const PersonalInfoSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  title: { type: String, required: true },
  summary: String,
  website: String,
  linkedin: String,
  github: String,
});

const ExperienceSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  highlights: [String],
  keywords: [String],
});

const EducationSchema = new Schema({
  id: { type: String, required: true },
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  location: String,
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  gpa: String,
  highlights: [String],
});

const ProjectSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: String,
  highlights: [String],
  keywords: [String],
});

const SkillSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    default: "intermediate",
  },
  keywords: [String],
});

const ResumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      default: "000000000000000000000000", // Default ObjectId for anonymous users
    },
    title: { type: String, required: true },
    personalInfo: { type: PersonalInfoSchema, required: true },
    experience: [ExperienceSchema],
    education: [EducationSchema],
    skills: [SkillSchema],
    projects: [ProjectSchema],
    version: { type: Number, default: 1 },
    atsScore: { type: Number, default: 0 },
    atsStatus: {
      type: String,
      enum: ["draft", "submitted", "reviewing", "accepted", "rejected"],
      default: "draft",
    },
    atsKeywords: [String],
    atsFeedback: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-increment version on update
ResumeSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.updatedAt = new Date();
  }
  next();
});

export type ResumeDocument = Document & ResumeData;
export const Resume = mongoose.model<ResumeDocument>("Resume", ResumeSchema);

export interface ResumeData {
  userId: mongoose.Types.ObjectId;
  title: string;
  personalInfo: {
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
  };
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
    keywords: string[];
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    highlights: string[];
  }[];
  skills: {
    id: string;
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    keywords: string[];
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    url?: string;
    highlights: string[];
    keywords: string[];
  }[];
  version: number;
  atsScore: number;
  atsStatus: "draft" | "submitted" | "reviewing" | "accepted" | "rejected";
  atsKeywords: string[];
  atsFeedback?: string;
  createdAt: Date;
  updatedAt: Date;

  parsedData: object;
}