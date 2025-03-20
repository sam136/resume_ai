import { Request, Response } from 'express';
import { ATSAnalyzer } from '../services/ats/atsAnalyzer';

const atsAnalyzer = new ATSAnalyzer();

export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const { resume, options } = req.body;

    if (!resume || !options) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const analysis = atsAnalyzer.analyzeResume(resume, options);
    
    res.json(analysis);
  } catch (error) {
    console.error('ATS Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};
