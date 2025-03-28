import React, { useState, useEffect, useRef } from 'react';
import { BarChart2, TrendingUp, Users, Download, ChevronDown, Lightbulb, Award, FileText, BookOpen, Code } from 'lucide-react';
import resumeService from '../services/resumeService';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { showToast } from '../utils/notifications';

const Analytics = () => {
  const [selectedResume, setSelectedResume] = useState("Sneh Shah's Resume");
  const [resumeList, setResumeList] = useState<{id: string, name: string}[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resumeData, setResumeData] = useState(null); // Initialize resumeData as null
  const analyticsContentRef = useRef<HTMLDivElement>(null);
  
  // Fetch list of available resumes from backend
  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        // Use the resume service to fetch resumes
        const resumes = await resumeService.getAllResumes();
        
        // Transform the data to match the expected format
        const formattedResumes = resumes.map(resume => ({
          id: resume.id,
          name: resume.title
        }));
        
        setResumeList(formattedResumes);
        
        // If there are resumes available, set the first one as selected by default
        if (formattedResumes.length > 0) {
          setSelectedResume(formattedResumes[0].name);
        }
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumes();
  }, []);

  // Handle resume selection
  const handleResumeSelect = async (resumeId: string, resumeName: string) => {
    setIsLoading(true);
    setSelectedResume(resumeName);
    setIsDropdownOpen(false);

    try {
      // Make API call to fetch resume data
      const response = await fetch(`http://localhost:8000/resume/${resumeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resume data');
      }
      const data = await response.json();
      setResumeData(data); // Update resumeData with API response
    } catch (error) {
      console.error('Error fetching resume data:', error);
      showToast({ message: 'Failed to load resume data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!analyticsContentRef.current) {
      console.error('Analytics content ref is null');
      showToast({ message: 'Failed to locate content for export', type: 'error' });
      return;
    }
    
    try {
      console.log('Starting PDF export process');
      setIsExporting(true);
      
      // Create a PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const contentElements = analyticsContentRef.current.children;
      console.log(`Found ${contentElements.length} content sections to process`);
      
      let currentY = 10; // Starting Y position
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(`Resume Analytics: ${selectedResume}`, 10, currentY);
      currentY += 15;
      
      // Process each section
      for (let i = 0; i < contentElements.length; i++) {
        const section = contentElements[i] as HTMLElement;
        console.log(`Processing section ${i+1}/${contentElements.length}`);
        
        try {
          // Ensure the section is visible and styled properly for capture
          const originalDisplay = section.style.display;
          section.style.display = 'block';
          
          // Convert section to image with quality settings
          console.log(`Converting section ${i+1} to image`);
          const sectionImage = await htmlToImage.toPng(section, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          
          // Restore original styling
          section.style.display = originalDisplay;
          
          // Check if we need to add a new page
          if (currentY > 270) { // A4 height is about 297mm, leave margin
            console.log('Adding new page to PDF');
            pdf.addPage();
            currentY = 10;
          }
          
          // Get dimensions and preserve aspect ratio
          const imgWidth = 190; // Width with margins
          const imgProps = pdf.getImageProperties(sectionImage);
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          
          console.log(`Adding image to PDF: width=${imgWidth}mm, height=${imgHeight}mm`);
          
          // Add image to PDF
          pdf.addImage(sectionImage, 'PNG', 10, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10; // Add spacing between sections
          
        } catch (err) {
          console.error(`Error processing section ${i+1}:`, err);
          showToast({ 
            message: `Error processing section ${i+1}. Export may be incomplete.`, 
            type: 'error' 
          });
        }
      }
      
      // Save the PDF
      const filename = `${selectedResume.replace(/\s+/g, '_')}_analytics.pdf`;
      console.log(`Saving PDF as: ${filename}`);
      pdf.save(filename);
      
      showToast({ message: 'Analytics exported successfully!', type: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      showToast({ message: 'Failed to export analytics', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <button 
              className="flex items-center justify-between w-64 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{isLoading ? 'Loading...' : selectedResume}</span>
              <ChevronDown className="h-5 w-5 ml-2" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
                {resumeList.length > 0 ? (
                  <ul className="max-h-60 overflow-auto py-1">
                    {resumeList.map((resume) => (
                      <li 
                        key={resume.id}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedResume === resume.name ? 'bg-gray-50' : ''}`}
                        onClick={() => handleResumeSelect(resume.id, resume.name)}
                      >
                        {resume.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No resumes available</div>
                )}
              </div>
            )}
          </div>
          <button 
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="h-5 w-5 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div ref={analyticsContentRef} className="space-y-6">
          {/* Render UI only if resumeData is available */}
          {resumeData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ATS Score</p>
                      <p className="text-2xl font-semibold text-gray-900">{resumeData.atsScore}%</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <BarChart2 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <span className="text-sm text-purple-600">Good Score</span>
                      <span className="ml-2 text-sm text-gray-500">above average</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Job Match Level</p>
                      <p className="text-2xl font-semibold text-gray-900">Entry Level</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <span className="text-sm text-blue-600">{resumeData.jobLevelScore[1].score}%</span>
                      <span className="ml-2 text-sm text-gray-500">match score</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Best Matching Role</p>
                      <p className="text-2xl font-semibold text-gray-900">{resumeData.matchingJobRoles[0]}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <span className="text-sm text-green-600">High compatibility</span>
                      <span className="ml-2 text-sm text-gray-500">for current skills</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Skills Score</h2>
                  <div className="space-y-4">
                    {resumeData.relevantSkillsScore.map((item) => (
                      <div key={item.skill} className="flex items-center">
                        <div className="w-32 text-sm text-gray-500">{item.skill}</div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600"
                              style={{ width: `${item.score}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm text-gray-500">
                          {item.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Level Compatibility</h2>
                  <div className="space-y-4">
                    {resumeData.jobLevelScore.map((item) => (
                      <div key={item.level} className="flex items-center">
                        <div className="w-32 text-sm text-gray-500">{item.level}</div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600"
                              style={{ width: `${item.score}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm text-gray-500">
                          {item.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ATS Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.atsKeywords.map((keyword) => (
                    <span 
                      key={keyword} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Career Growth Trajectory</h2>
                
                <div className="relative">
                  {/* Timeline bar */}
                  <div className="absolute left-0 top-6 w-full h-1 bg-gray-200"></div>
                  
                  {/* Timeline nodes */}
                  <div className="flex justify-between relative">
                    {[resumeData.careerGrowthTrajectory[0].currentRole, 
                      resumeData.careerGrowthTrajectory[0].nextRole, 
                      ...resumeData.careerGrowthTrajectory[0].futureRoles].map((role, index) => (
                      <div key={index} className="flex flex-col items-center relative" style={{width: `${100/(6+1)}%`}}>
                        <div className={`w-4 h-4 rounded-full z-10 ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className={`mt-4 text-xs font-medium text-center ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                          {role}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Current
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Growth Recommendations</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    {resumeData.careerGrowthTrajectory[0].suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-700 text-sm">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* New section for Recommended Skills */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Recommended Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.recommendedSkills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Course Recommendations */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Course Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumeData.courseRecommendations.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-2">
                          {course.platform[0]}
                        </span>
                        <span className="text-sm text-gray-500">{course.platform}</span>
                      </div>
                      <h3 className="font-medium text-gray-900">{course.course_name}</h3>
                      <a 
                        href={course.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        View course
                        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appreciation */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <Award className="h-5 w-5 text-green-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Strengths & Appreciation</h2>
                </div>
                <div className="space-y-3">
                  {resumeData.appreciation.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Tips */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Resume Improvement Tips</h2>
                </div>
                <div className="space-y-3">
                  {resumeData.resumeTips.map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-xs">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Suggestions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <Code className="h-5 w-5 text-purple-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Project Suggestions</h2>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Improvement Tips for Existing Projects</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    {resumeData.projectSuggestions.improvementTips.map((tip, index) => (
                      <li key={index} className="text-gray-700">{tip}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Recommended New Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resumeData.projectSuggestions.newProjectRecommendations.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 mb-3">
                          <span className="text-purple-600 text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-800">{project}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;