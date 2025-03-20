import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Save, Eye, Download } from 'lucide-react';
import type { RootState } from '../../store';
import { updateResume, addResume } from '../../store/resumeSlice';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import TemplateSelector from './TemplateSelector';
import type { ResumeData } from '../../types';
import { LoadingState, initialLoadingState, handleAsyncOperation } from '../../types/loading';

const templates = [
  { 
    id: 'modern', 
    name: 'Modern', 
    description: 'Clean and contemporary design with a focus on readability' 
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    description: 'Traditional layout perfect for corporate positions' 
  },
  { 
    id: 'basic', 
    name: 'Basic', 
    description: 'Simple and straightforward design that works for any industry' 
  },
];

const ResumeBuilder = () => {
  const dispatch = useDispatch();
  const { activeResumeId, resumes } = useSelector((state: RootState) => state.resume);
  const activeResume = activeResumeId ? resumes.find(r => r.id === activeResumeId) : null;

  const [resumeData, setResumeData] = useState<Partial<ResumeData>>(
    activeResume || {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        title: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
    }
  );
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [showPreview, setShowPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.8);
  const [{ isLoading, error }, setLoadingState] = useState<LoadingState>(initialLoadingState);

  const handleSave = async () => {
    const updatedResume: ResumeData = {
      ...resumeData as ResumeData,
      id: resumeData.id || crypto.randomUUID(),
      title: resumeData.title || 'Untitled Resume',
      createdAt: resumeData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await handleAsyncOperation(
      async () => {
        if (activeResumeId) {
          await dispatch(updateResume(updatedResume));
        } else {
          await dispatch(addResume(updatedResume));
        }
      },
      (loading) => setLoadingState(prev => ({ ...prev, isLoading: loading })),
      (error) => setLoadingState(prev => ({ ...prev, error }))
    );
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    // Could support PDF, DOCX, etc.
  };

  return (
    <div className="h-full flex">
      <div className={`flex-1 overflow-auto p-6 ${showPreview ? 'hidden lg:block' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Resume Builder</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Eye className="h-5 w-5 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Template</h2>
            <TemplateSelector
              templates={templates}
              activeTemplate={activeTemplate}
              onSelect={setActiveTemplate}
            />
          </div>
        </div>

        <ResumeForm
          data={resumeData}
          onChange={setResumeData}
        />
      </div>

      {(showPreview || window.innerWidth >= 1024) && (
        <div className="w-full lg:w-1/2 h-full bg-gray-100 p-6 overflow-auto">
          <div className="sticky top-0 z-10 bg-gray-100 pb-4 mb-4">
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.1"
              value={previewScale}
              onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <ResumePreview
            data={resumeData}
            template={activeTemplate}
            scale={previewScale}
          />
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
