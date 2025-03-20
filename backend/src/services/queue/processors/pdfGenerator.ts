import { Job } from 'bull';
import { logger } from '../../../utils/logger';
import { exportResumeToPDF } from '../../exportService';
import type { ResumeData } from '../../../types/resume';

interface PDFGenerateJob {
  resumeId: string;
  resumeData: ResumeData;
  options?: {
    template?: string;
    format?: 'pdf' | 'docx';
  };
}

export async function pdfGenerateProcessor(job: Job<PDFGenerateJob>) {
  const { resumeData, options } = job.data;
  logger.info(`Generating PDF for resume: ${resumeData.id}`);

  try {
    await job.progress(50);
    const pdfBuffer = await exportResumeToPDF(resumeData, options);
    
    await job.progress(100);
    return { success: true, pdfBuffer };
  } catch (error) {
    logger.error('PDF generation failed:', error);
    throw error;
  }
}
