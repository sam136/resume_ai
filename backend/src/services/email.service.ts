import sgMail from '@sendgrid/mail';
import { emailConfig } from '../config/services';

interface JobAlertData {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salary?: string;
  applyUrl: string;
}

interface ApplicationUpdateData {
  jobTitle: string;
  company: string;
  status: 'accepted' | 'rejected' | 'interview';
  nextSteps?: string;
}

class EmailService {
  private client: typeof sgMail;

  constructor() {
    this.client = sgMail;
    this.client.setApiKey(emailConfig.apiKey!);
  }

  async sendEmail(to: string, templateId: string, dynamicData: any) {
    try {
      await this.client.send({
        to,
        from: emailConfig.fromEmail,
        templateId,
        dynamicTemplateData: dynamicData,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    return this.sendEmail(to, emailConfig.templates.welcome, {
      firstName,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      completeProfileUrl: `${process.env.FRONTEND_URL}/settings`
    });
  }

  async sendPasswordReset(to: string, resetToken: string) {
    return this.sendEmail(to, emailConfig.templates.resetPassword, {
      resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      expiresIn: '1 hour'
    });
  }

  async sendJobAlert(to: string, jobs: JobAlertData[]) {
    return this.sendEmail(to, emailConfig.templates.jobAlert, {
      jobs,
      matchCount: jobs.length,
      preferencesUrl: `${process.env.FRONTEND_URL}/settings#notifications`
    });
  }

  async sendApplicationUpdate(to: string, data: ApplicationUpdateData) {
    return this.sendEmail(to, emailConfig.templates.applicationUpdate, {
      ...data,
      trackUrl: `${process.env.FRONTEND_URL}/applications`
    });
  }
}

export const emailService = new EmailService();
