import PDFKit from 'pdfkit';
import { pdfConfig } from '../config/services';
import fs from 'fs';
import path from 'path';

class PDFService {
  async generateResume(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFKit();
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add content to PDF
        this.addResumeContent(doc, data);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addResumeContent(doc: PDFKit.PDFDocument, data: any) {
    // Add header
    doc.fontSize(24).text(`${data.firstName} ${data.lastName}`, { align: 'center' });
    doc.fontSize(14).text(data.title, { align: 'center' });
    doc.moveDown();

    // Add contact info
    doc.fontSize(10).text(`Email: ${data.email}`);
    doc.text(`Phone: ${data.phone}`);
    doc.text(`Location: ${data.location}`);
    doc.moveDown();

    // Add sections (experience, education, etc.)
    if (data.experience?.length) {
      doc.fontSize(16).text('Experience');
      doc.moveDown();
      // Add experience entries
      // ...existing code for experience...
    }

    // Additional sections
    // ...existing code for other sections...
  }
}

export const pdfService = new PDFService();
