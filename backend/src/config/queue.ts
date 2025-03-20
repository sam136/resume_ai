import { QueueOptions } from 'bull';

export const queueConfig: QueueOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export const queueNames = {
  RESUME_PARSE: 'resume-parse',
  PDF_GENERATE: 'pdf-generate',
  EMAIL_SEND: 'email-send',
};
