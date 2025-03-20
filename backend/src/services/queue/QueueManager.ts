import Bull, { Queue, Job } from 'bull';
import { queueConfig, queueNames } from '../../config/queue';
import { logger } from '../../utils/logger';

export class QueueManager {
  private queues: Map<string, Queue>;

  constructor() {
    this.queues = new Map();
    this.initializeQueues();
  }

  private initializeQueues(): void {
    Object.values(queueNames).forEach(queueName => {
      const queue = new Bull(queueName, queueConfig);
      queue.on('error', this.handleError);
      queue.on('failed', this.handleFailed);
      this.queues.set(queueName, queue);
    });
  }

  private handleError(error: Error): void {
    logger.error('Queue error:', error);
  }

  private handleFailed(job: Job, error: Error): void {
    logger.error(`Job ${job.id} failed:`, error);
  }

  public getQueue(name: string): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue ${name} not found`);
    }
    return queue;
  }

  public async addJob(
    queueName: string,
    data: any,
    opts?: Bull.JobOptions
  ): Promise<Job> {
    const queue = this.getQueue(queueName);
    return queue.add(data, opts);
  }

  public async clearQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.empty();
  }

  public async closeAll(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map(queue => 
      queue.close()
    );
    await Promise.all(closePromises);
  }
}
