import React, { useRef, useState } from 'react';
import { Upload, File } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete: (data: any) => void;
  onError?: (error: string) => void;
  acceptedFormats?: string[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  onError,
  acceptedFormats = ['.pdf', '.doc', '.docx']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!acceptedFormats.some(format => file.name.toLowerCase().endsWith(format))) {
      onError?.('Invalid file format');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      onUploadComplete(data);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        accept={acceptedFormats.join(',')}
        className="hidden"
      />
      
      <div className="flex flex-col items-center">
        {isProcessing ? (
          <File className="w-12 h-12 text-gray-400 animate-pulse" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400" />
        )}
        <p className="mt-2 text-sm text-gray-600">
          {isProcessing ? 'Processing...' : 'Drop your resume here or click to upload'}
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          Select File
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
