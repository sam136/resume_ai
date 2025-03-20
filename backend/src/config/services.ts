export const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'sendgrid',
  apiKey: process.env.EMAIL_API_KEY,
  fromEmail: process.env.FROM_EMAIL || 'noreply@stutsproject.com',
  templates: {
    welcome: 'template_welcome_id',
    resetPassword: 'template_reset_password_id',
    jobAlert: 'template_job_alert_id',
    applicationUpdate: 'template_application_update_id'
  }
};

export const storageConfig = {
  bucketName: process.env.GRIDFS_BUCKET_NAME || 'uploads',
  chunkSize: 261120, // 255KB, MongoDB default
  acceptedFileTypes: ['application/pdf', 'image/jpeg', 'image/png']
};

export const pdfConfig = {
  tempDir: process.env.PDF_TEMP_DIR || '/tmp/pdfs',
  fontDir: process.env.PDF_FONT_DIR || '../assets/fonts'
};
