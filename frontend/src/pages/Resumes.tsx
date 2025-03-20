import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Plus, Search, Filter, MoreVertical, Edit, Trash2, Upload, X, AlertCircle, Check } from 'lucide-react';
import resumeService, { Resume } from '../services/resumeService';
import { ResumeUpload } from '../components/resume/ResumeUpload';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';

const Resumes = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);
  
  // Resume upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    atsScore?: number;
    keywords?: string[];
    skills?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowUploadModal(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadResults(null);
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resumeService.getAllResumes();
      setResumes(data);
    } catch (err: any) {
      console.error('Failed to fetch resumes:', err);
      setError('Failed to fetch resumes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.deleteResume(id);
        setResumes(resumes.filter(resume => resume.id !== id));
      } catch (err) {
        console.error('Failed to delete resume:', err);
        setError('Failed to delete resume. Please try again.');
      }
    }
    setShowDropdownId(null);
  };

  const handleCreateNew = () => {
    navigate('/resumes/new');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change detected");
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    setShowUploadModal(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadResults(null);
    setIsUploading(true);

    try {
      // Validate file
      if (!file) {
        throw new Error('Please select a file');
      }

      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const isValidType = allowedTypes.includes(file.type) || 
                         ['pdf', 'doc', 'docx'].includes(fileExtension || '');
      
      if (!isValidType) {
        throw new Error('Invalid file type. Please upload a PDF or Word document');
      }

      const formData = new FormData();
      formData.append('resume', file, file.name); // Include filename
      formData.append('type', file.type); // Include file type
      
      const response = await resumeService.parseResume(formData);
      
      if (!response || !response.atsScore) {
        throw new Error('Invalid response from server');
      }
      
      await handleUploadSuccess(response);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const closeUploadModal = () => {
    console.log("Closing upload modal");
    setShowUploadModal(false);
  };

  const handleUploadSuccess = async (data: {
    atsScore: number;
    keywords: string[];
    skills: string[];
    matchingJobs: any[];
  }) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please log in to save your resume');
      }

      setIsUploading(true);
      setUploadProgress(90);
      
      const resumeData = {
        title: `Resume ${new Date().toLocaleDateString()}`,
        content: data.skills.join(', ') + '\n\n' + data.keywords.join(', '),
        atsScore: data.atsScore,
        keywords: data.keywords,
        skills: data.skills,
        status: 'Draft'
      };
      
      const savedResume = await resumeService.createResume(resumeData);
      console.log('Resume saved successfully:', savedResume);
      
      // Update the resume list
      console.log("Resume saved:", savedResume);
      setResumes(prevResumes => [savedResume, ...prevResumes]);
      
      setUploadProgress(100);
      setUploadSuccess(true);
      setUploadResults({
        atsScore: data.atsScore,
        keywords: data.keywords,
        skills: data.skills
      });
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        // Reset states after closing
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadProgress(0);
          setUploadResults(null);
        }, 300);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving resume:', err);
      if (err.message.includes('Authentication')) {
        navigate('/login', { state: { from: '/resumes' } });
      } else {
        setUploadError(err.message || 'Failed to save resume data');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDropdown = (id: string) => {
    setShowDropdownId(showDropdownId === id ? null : id);
  };

  const filteredResumes = searchQuery
    ? resumes.filter(resume => 
        resume.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : resumes;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Unable to load your resumes</h3>
        </div>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => fetchResumes()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md transition-colors"
          >
            Try again
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleUpload(e);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            Upload a resume
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Resumes</h1>
          <button 
            onClick={handleCreateNew}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Resume
          </button>
        </div>

        {/* Search and Actions */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </button>
          <button 
            onClick={handleUpload}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </button>
        </div>

        {/* Content */}
        {filteredResumes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No resumes found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No resumes match your search criteria" : "Start by creating your first resume"}
            </p>
            {!searchQuery && (
              <div className="space-x-4">
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Resume
                </button>
                <button
                  onClick={handleUpload}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Resume
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ATS Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{resume.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{resume.atsScore || 0}%</span>
                        <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${resume.atsScore || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${resume.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {resume.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => toggleDropdown(resume.id)}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {showDropdownId === resume.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <Link 
                            to={`/resumes/${resume.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Resume
                          </Link>
                          <button 
                            onClick={() => handleDelete(resume.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Resume
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={closeUploadModal}></div>
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-gray-900">Upload Resume</h3>
                <button 
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={closeUploadModal}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {uploadSuccess && uploadResults ? (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center mb-3">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700 font-medium">Resume uploaded successfully!</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">ATS Score</p>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900 mr-2">{uploadResults.atsScore}%</span>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              (uploadResults.atsScore || 0) > 70 ? 'bg-green-500' : 
                              (uploadResults.atsScore || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${uploadResults.atsScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {uploadResults.keywords && uploadResults.keywords.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Keywords Detected</p>
                        <div className="flex flex-wrap gap-2">
                          {uploadResults.keywords.map((keyword, index) => (
                            <span 
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadResults.skills && uploadResults.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Skills Detected</p>
                        <div className="flex flex-wrap gap-2">
                          {uploadResults.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <ResumeUpload onUploadSuccess={handleUploadSuccess} />
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  type="button"
                  onClick={closeUploadModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {uploadSuccess ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Resumes;