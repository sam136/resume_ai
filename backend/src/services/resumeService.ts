// filepath: backend/src/services/resumeService.ts
import { Resume } from '../models/Resume';
import { ResumeData } from '../types';

export const createResume = async (resumeData: ResumeData) => {
    const resume = new Resume(resumeData);
    return await resume.save();
};

export const getResumes = async (userId: string) => {
    return await Resume.find({ userId });
};

export const updateResume = async (resumeId: string, resumeData: ResumeData) => {
    return await Resume.findByIdAndUpdate(resumeId, resumeData, { new: true });
};

export const deleteResume = async (resumeId: string) => {
    return await Resume.findByIdAndDelete(resumeId);
};