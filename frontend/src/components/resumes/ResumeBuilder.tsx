import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import resumeService from '../../services/resumeService';
import analysisService, { AnalysisResult } from '../../services/analysisService';
import fileService from '../../services/fileService';

// Sample resume data for demo purposes
const demoResumeData = {
  title: 'Full Stack Developer Resume',
  personalInfo: {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Full Stack Developer',
    summary: 'Passionate full stack developer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud technologies with a strong focus on performance optimization and user experience.',
    website: 'https://alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan'
  },
  experience: [
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      company: 'TechInnovate Solutions',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: 'Present',
      highlights: [
        'Led a team of 5 developers to rebuild the company\'s flagship product, resulting in a 40% increase in user engagement',
        'Architected and implemented a microservices solution that reduced server costs by 35%',
        'Optimized front-end performance, improving page load times by 60%',
        'Implemented CI/CD pipelines using GitHub Actions, reducing deployment time by 75%'
      ],
      keywords: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'MongoDB']
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'DataVision Inc.',
      location: 'Oakland, CA',
      startDate: '2018-06',
      endDate: '2021-02',
      highlights: [
        'Developed RESTful APIs and WebSocket services for real-time data visualization',
        'Built responsive dashboard interfaces viewed by over 10,000 daily users',
        'Collaborated with data science team to implement machine learning features',
        'Reduced database query times by 45% through optimization techniques'
      ],
      keywords: ['JavaScript', 'Express', 'PostgreSQL', 'Redis', 'React', 'D3.js']
    },
    {
      id: '3',
      title: 'Junior Web Developer',
      company: 'CreativeWeb Studios',
      location: 'Berkeley, CA',
      startDate: '2016-09',
      endDate: '2018-05',
      highlights: [
        'Developed and maintained client websites using modern front-end frameworks',
        'Created custom WordPress themes and plugins for small business clients',
        'Optimized site performance and implemented SEO best practices',
        'Participated in UX research and design sprints'
      ],
      keywords: ['HTML/CSS', 'JavaScript', 'WordPress', 'PHP', 'SEO']
    }
  ],
  education: [
    {
      id: '1',
      institution: 'University of California, Berkeley',
      degree: 'Master of Science',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      gpa: '3.9',
      startDate: '2014-08',
      endDate: '2016-05',
      highlights: [
        'Specialization in Artificial Intelligence and Machine Learning',
        'Graduate Research Assistant in the Human-Computer Interaction Lab',
        'Published paper on "Optimizing User Interfaces Through Machine Learning"'
      ]
    },
    {
      id: '2',
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      field: 'Computer Engineering',
      location: 'Stanford, CA',
      gpa: '3.7',
      startDate: '2010-09',
      endDate: '2014-06',
      highlights: [
        'Graduated with honors',
        'Member of ACM and IEEE student chapters',
        'Teaching Assistant for Introduction to Data Structures'
      ]
    }
  ],
  projects: [
    {
      id: '1',
      name: 'HealthTracker Pro',
      description: 'A full-stack health monitoring application that integrates with wearable devices to track fitness metrics and provide personalized recommendations.',
      url: 'https://github.com/alexmorgan/health-tracker',
      highlights: [
        'Implemented OAuth 2.0 authentication for secure data access',
        'Built a real-time dashboard using WebSockets and D3.js',
        'Developed RESTful APIs for device integration',
        'Implemented machine learning algorithms for personalized recommendations'
      ],
      keywords: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Machine Learning', 'OAuth 2.0']
    },
    {
      id: '2',
      name: 'E-commerce Microservices Platform',
      description: 'A distributed e-commerce platform built with microservices architecture to handle high volume transactions and provide a seamless shopping experience.',
      url: 'https://github.com/alexmorgan/ecommerce-platform',
      highlights: [
        'Implemented service discovery and load balancing with Kubernetes',
        'Built a payment processing service that handles 1000+ transactions per minute',
        'Designed a distributed caching system to improve performance',
        'Implemented event-driven architecture using Kafka'
      ],
      keywords: ['Microservices', 'Docker', 'Kubernetes', 'Kafka', 'Spring Boot', 'React']
    },
    {
      id: '3',
      name: 'CodeCollaborate',
      description: 'An open-source collaborative code editor that allows multiple developers to work on the same codebase in real-time.',
      url: 'https://github.com/alexmorgan/code-collaborate',
      highlights: [
        'Implemented operational transformation for conflict resolution',
        'Built a plugin system for customizable IDE features',
        'Created a secure multi-user authentication system',
        'Developed syntax highlighting for 15+ programming languages'
      ],
      keywords: ['WebRTC', 'Socket.IO', 'React', 'Monaco Editor', 'Express', 'PostgreSQL']
    }
  ],
  skills: [
    {
      id: '1',
      name: 'Front-end Development',
      level: 'Expert',
      keywords: ['React', 'TypeScript', 'Redux', 'HTML5', 'CSS3', 'Webpack']
    },
    {
      id: '2',
      name: 'Back-end Development',
      level: 'Expert',
      keywords: ['Node.js', 'Express', 'Python', 'Java', 'Spring Boot', 'GraphQL', 'REST']
    },
    {
      id: '3',
      name: 'Database Technologies',
      level: 'Advanced',
      keywords: ['MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch', 'SQL', 'NoSQL']
    },
    {
      id: '4',
      name: 'DevOps & Cloud',
      level: 'Advanced',
      keywords: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform']
    },
    {
      id: '5',
      name: 'Software Architecture',
      level: 'Advanced',
      keywords: ['Microservices', 'Event-driven', 'Domain-driven design', 'System design']
    }
  ]
};

const ResumeBuilder: React.FC = () => {
  // Start with empty data instead of pre-filled
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
  
  // Function to load demo data
  const loadDemoData = () => {
    setTitle(demoResumeData.title);
    setContent(JSON.stringify(demoResumeData, null, 2));
    setJobDescription('Senior Full Stack Developer with 5+ years of experience in React, Node.js, and cloud technologies. Experience with microservices architecture and containerization. Strong knowledge of database optimization and front-end performance techniques.');
    setAnalysis({
      score: 85,
      feedback: "Strong technical resume with excellent project descriptions and clear demonstration of impact. Good alignment with the target role's requirements.",
      suggestions: [
        "Consider quantifying more achievements in your experience section",
        "Add specific performance metrics for your projects",
        "Include certifications related to cloud technologies"
      ],
      keywordMatches: ["React", "Node.js", "TypeScript", "AWS", "Docker", "Microservices", "Full Stack", "MongoDB"]
    });
  };
  
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700" htmlFor="title">
                Resume Title
              </label>
              <button
                onClick={loadDemoData}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Load Demo Data
              </button>
            </div>
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
