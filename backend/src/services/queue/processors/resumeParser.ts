import { Job } from 'bull';
import { logger } from '../../../utils/logger';
import { AnalysisService } from '../../analysisService';

interface ResumeParseJob {
  resumeId: string;
  fileUrl: string;
}

export async function resumeParseProcessor(job: Job<ResumeParseJob>) {
  const { resumeId, fileUrl } = job.data;
  logger.info(`Processing resume parse job for resumeId: ${resumeId}`);

  try {
    const analysisService = new AnalysisService();
    await analysisService.analyzeResume(resumeId);
    
    await job.progress(100);
    return { success: true, resumeId };
  } catch (error) {
    logger.error('Resume parse failed:', error);
    throw error;
  }
}
