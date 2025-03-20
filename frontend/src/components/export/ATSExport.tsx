import React, { useState } from 'react';
import { FileText, Loader2, Copy, Check } from 'lucide-react';
import { showToast } from '../../utils/notifications';

interface ATSExportProps {
  data: Record<string, any>;
}

const ATSExport: React.FC<ATSExportProps> = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [atsText, setAtsText] = useState<string | null>(null);

  const generateATSText = async () => {
    try {
      setIsGenerating(true);
      const text = [
        `${data.personalInfo?.name || ''}`,
        `${data.personalInfo?.email || ''}`,
        `${data.personalInfo?.phone || ''}`,
        `${data.personalInfo?.location || ''}`,
        '',
        'PROFESSIONAL SUMMARY',
        '-------------------',
        `${data.summary || ''}`,
        '',
        'WORK EXPERIENCE',
        '---------------',
        ...data.experience?.map((exp: any) => 
          `${exp.title} | ${exp.company} | ${exp.startDate} - ${exp.endDate}\n` +
          exp.highlights?.map((h: string) => `• ${h}`).join('\n')
        ) || [],
        '',
        'SKILLS',
        '------',
        data.skills?.map((skill: any) => `• ${skill.name} (${skill.level})`).join('\n') || '',
      ].join('\n');
      
      setAtsText(text);
      showToast({ message: 'ATS text generated successfully!', type: 'success' });
    } catch (error) {
      console.error('ATS text generation failed:', error);
      showToast({ message: 'Failed to generate ATS text', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (atsText) {
        await navigator.clipboard.writeText(atsText);
        setShowCopied(true);
        showToast({ message: 'Copied to clipboard!', type: 'success' });
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      showToast({ message: 'Failed to copy text', type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generateATSText}
        disabled={isGenerating}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        Generate ATS Text
      </button>

      {atsText && (
        <div className="relative">
          <pre className="mt-4 p-4 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
            {atsText}
          </pre>
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
            title="Copy to clipboard"
          >
            {showCopied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ATSExport;
