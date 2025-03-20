import React, { useState, useEffect } from 'react';
import { ResumeUpload } from '../components/resume/ResumeUpload';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  atsScore: number;
  keywords: string[];
  skills: string[];
  matchingJobs: any[];
}

export const ResumeDashboard: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Try to load previous analysis from localStorage on component mount
  useEffect(() => {
    try {
      const savedAnalysis = localStorage.getItem('lastResumeAnalysis');
      if (savedAnalysis) {
        setAnalysisResult(JSON.parse(savedAnalysis));
      }
    } catch (err) {
      console.error('Failed to load saved analysis:', err);
    }
  }, []);

  const handleUploadSuccess = (data: AnalysisResult) => {
    setAnalysisResult(data);
    
    // Save this result to localStorage for persistence
    localStorage.setItem('lastResumeAnalysis', JSON.stringify(data));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/resumes" className="text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Resume Analysis Dashboard</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <ResumeUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {analysisResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ATS Score</h2>
              <div className={`text-5xl font-bold text-center ${
                analysisResult.atsScore >= 80 ? 'text-green-600' : 
                analysisResult.atsScore >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {analysisResult.atsScore}%
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.length > 0 ? (
                  analysisResult.keywords.map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No keywords detected</p>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {analysisResult.skills.length > 0 ? (
                  analysisResult.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No skills detected</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Matching Jobs</h2>
            {analysisResult.matchingJobs && analysisResult.matchingJobs.length > 0 ? (
              <div className="space-y-4">
                {analysisResult.matchingJobs.map((job, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                      </div>
                      {job.matchScore && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.matchScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {job.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-2 line-clamp-2">{job.description}</p>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                    >
                      View Job
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No matching jobs found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ResumeDashboard;
