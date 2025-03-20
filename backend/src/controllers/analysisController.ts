import { Request, Response } from 'express';
import { AnalysisService } from '../services/analysisService';

const analysisService = new AnalysisService();

export const getResumeAnalysis = async (req: Request, res: Response) => {
  const analysis = await analysisService.analyzeResume(req.params.resumeId);
  res.json(analysis);
};

export const getJobMatchAnalysis = async (req: Request, res: Response) => {
  const { resumeId, jobDescription } = req.body;
  const analysis = await analysisService.analyzeJobMatch(resumeId, jobDescription);
  res.json(analysis);
};

export const getUserStats = async (req: Request, res: Response) => {
  const stats = await analysisService.getUserStats(req.user!.id);
  res.json(stats);
};
