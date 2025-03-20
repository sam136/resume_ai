import React, { useState } from 'react';
import { Linkedin } from 'lucide-react';
import { LoadingState, initialLoadingState, handleAsyncOperation } from '../../types/loading';

interface LinkedInImportProps {
  onImportComplete: (data: any) => void;
  onError?: (error: string) => void;
}

const LinkedInImport: React.FC<LinkedInImportProps> = ({ onImportComplete, onError }) => {
  const [{ isLoading, error }, setLoadingState] = useState<LoadingState>(initialLoadingState);

  const handleImport = async () => {
    await handleAsyncOperation(
      async () => {
        const response = await fetch('/api/linkedin/import');
        const data = await response.json();
        onImportComplete(data);
        return data;
      },
      (loading) => setLoadingState(prev => ({ ...prev, isLoading: loading })),
      (error) => {
        setLoadingState(prev => ({ ...prev, error }));
        onError?.(error?.message ?? 'An unknown error occurred');
      }
    );
  };

  return (
    <button
      onClick={handleImport}
      disabled={isLoading}
      className="flex items-center px-4 py-2 bg-[#0077b5] text-white rounded-md hover:bg-[#006097] disabled:opacity-50"
    >
      <Linkedin className="w-5 h-5 mr-2" />
      {isLoading ? 'Importing...' : 'Import from LinkedIn'}
    </button>
  );
};

export default LinkedInImport;
