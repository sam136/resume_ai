import { Job } from 'bull';
import { logger } from '../../../utils/logger';
import { emailService } from '../../email.service';

interface EmailJob {
  to: string;
  templateId: string;
  data: Record<string, any>;
}

export async function emailSendProcessor(job: Job<EmailJob>) {
  const { to, templateId, data } = job.data;
  logger.info(`Sending email to: ${to}`);

  try {
    await job.progress(50);
    await emailService.sendEmail(to, templateId, data);
    
    await job.progress(100);
    return { success: true, to };
  } catch (error) {
    logger.error('Email send failed:', error);
    throw error;
  }
}
