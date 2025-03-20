import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { showToast } from '../../utils/notifications';

interface DocxExportProps {
  data: Record<string, any>;
  filename?: string;
}

const DocxExport: React.FC<DocxExportProps> = ({ data, filename = 'resume' }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: data.personalInfo?.name || '', bold: true, size: 28 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: data.personalInfo?.email || '', size: 24 }),
              ],
            }),
            // Add more sections for experience, skills, etc.
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${filename}.docx`);
      
      showToast({ message: 'DOCX exported successfully!', type: 'success' });
    } catch (error) {
      console.error('DOCX export failed:', error);
      showToast({ message: 'Failed to export DOCX', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      Export DOCX
    </button>
  );
};

export default DocxExport;
