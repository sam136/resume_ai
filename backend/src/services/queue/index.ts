import { QueueManager } from './QueueManager';
import { queueNames } from '../../config/queue';
import { resumeParseProcessor } from './processors/resumeParser';
import { pdfGenerateProcessor } from './processors/pdfGenerator';
import { emailSendProcessor } from './processors/emailSender';

const queueManager = new QueueManager();

// Register processors
queueManager.getQueue(queueNames.RESUME_PARSE).process(resumeParseProcessor);
queueManager.getQueue(queueNames.PDF_GENERATE).process(pdfGenerateProcessor);
queueManager.getQueue(queueNames.EMAIL_SEND).process(emailSendProcessor);

export { queueManager };
