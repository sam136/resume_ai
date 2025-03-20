import puppeteer from 'puppeteer';
import type { ResumeData } from '../types/resume';
import { generateResumeHTML } from '../utils/templateUtils';

export interface ExportOptions {
  format?: 'pdf' | 'docx';
  template?: string;
  scale?: number;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'pdf',
  template: 'professional',
  scale: 1,
  margin: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.5in',
    left: '0.5in'
  }
};

export async function exportResumeToPDF(
  resume: ResumeData, 
  options: ExportOptions = {}
): Promise<Buffer> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Generate HTML from resume data
    const html = await generateResumeHTML(resume, mergedOptions.template);

    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create new page
    const page = await browser.newPage();
    
    // Set content and wait for network idle
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      scale: mergedOptions.scale,
      margin: mergedOptions.margin,
      preferCSSPageSize: true,
    });

    // Close browser
    await browser.close();

    return Buffer.from(pdf);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
}

export async function exportResumeToDocx(
  resume: ResumeData,
  options: ExportOptions = {}
): Promise<Buffer> {
  // TODO: Implement DOCX export
  throw new Error('DOCX export not implemented');
}
