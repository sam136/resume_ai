import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import resumeService from '../../services/resumeService';
import analysisService, { AnalysisResult } from '../../services/analysisService';
import fileService from '../../services/fileService';

const ResumeBuilder: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  const handleSave = async () => {
    if (!title || !content) {
      setError('Please provide a title and content for your resume');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const resumeData = {
        title,
        content
      };
      
      const savedResume = resumeId 
        ? await resumeService.updateResume(resumeId, resumeData)
        : await resumeService.createResume(resumeData);
      
      setResumeId(savedResume.id);
      if (!resumeId) {
        // Only navigate away if this was a new resume
        navigate('/resumes');
      }
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setError(err.message || 'Failed to save resume');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploadLoading(true);
    setError(null);
    
    try {
      const result = await fileService.uploadFile(file, 'resume');
      // Assuming the API returns the parsed content
      if (result.content) {
        setContent(result.content);
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploadLoading(false);
    }
  };
  
  const handleAnalyzeResume = async () => {
    if (!resumeId) {
      // Save the resume first if it doesn't exist yet
      await handleSave();
      if (!resumeId) return; // If saving failed, exit
    }
    
    if (!jobDescription) {
      setError('Please provide a job description for analysis');
      return;
    }
    
    setAnalysisLoading(true);
    setError(null);
    
    try {
      const result = await analysisService.analyzeResume(resumeId, jobDescription);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Error analyzing resume:', err);
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Resume Builder</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Resume Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="e.g., Software Developer Resume"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="content">
              Resume Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded h-80"
              placeholder="Enter your resume content..."
            />
          </div>
          
          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Resume'}
            </button>
            
            <button
              onClick={() => navigate('/resumes')}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">Import from File</h3>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="flex-1"
                accept=".pdf,.doc,.docx,.txt"
              />
              <button
                onClick={handleFileUpload}
                disabled={uploadLoading || !file}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Resume Analysis</h3>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="jobDescription">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded h-40"
              placeholder="Paste the job description here for resume analysis..."
            />
          </div>
          
          <button
            onClick={handleAnalyzeResume}
            disabled={analysisLoading || !content}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 mb-4"
          >
            {analysisLoading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
          
          {analysis && (
            <div className="border rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Analysis Results</h4>
              <div className="mb-2">
                <span className="font-medium">Score: </span>
                <span className={`font-bold ${
                  analysis.score > 80 ? 'text-green-600' :
                  analysis.score > 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.score}/100
                </span>
              </div>
              
              <div className="mb-3">
                <p className="font-medium mb-1">Feedback:</p>
                <p>{analysis.feedback}</p>
              </div>
              
              {analysis.suggestions.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium mb-1">Suggestions:</p>
                  <ul className="list-disc list-inside">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.keywordMatches.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Matching Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywordMatches.map((keyword, index) => (
                      <span 
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
