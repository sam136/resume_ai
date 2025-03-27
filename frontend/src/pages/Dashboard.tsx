import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Zap } from 'lucide-react';
import type { RootState } from '../store';
import { LoadingState, initialLoadingState } from '../types/loading';
import jobService from '../services/jobService';
import { getUserResumes, Resume } from '../services/resumeService';

interface DashboardMetrics {
  activeResumes: number;
  averageATSScore: number;
}

interface RecentActivity {
  id: string;
  type: 'resume' | 'application' | 'ats';
  description: string;
  timestamp: string;
}

interface OptimizationTip {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  url: string;
}

const Dashboard = () => {
  const [{ isLoading, error }, setLoadingState] = useState<LoadingState>(initialLoadingState);
  const [userResumes, setUserResumes] = useState<Resume[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingState({ isLoading: true, error: null });
      try {
        // Fetch resumes
        const resumesResponse = await getUserResumes();
        // setUserResumes([
        //   {
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //     id: '1',
        //     title: 'Sample Resume',
        //     content: 'This is a sample resume content.',
        //     atsScore: 80,
        //   },
        //   {
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //     id: '1',
        //     title: 'Sample Resume',
        //     content: 'This is a sample resume content.',
        //     atsScore: 85,
        //   },
        //   {
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //     id: '1',
        //     title: 'Sample Resume',
        //     content: 'This is a sample resume content.',
        //     atsScore: 85,
        //   },
        // ]);

        setUserResumes(resumesResponse)
        console.log('Fetched resumes:', [1,2,3]);

        // Fetch saved jobs
        try {
          const jobsResponse = await jobService.getSavedJobs();
          setSavedJobs(jobsResponse.slice(0, 3));
        } catch (jobsError) {
          console.error('Failed to fetch saved jobs:', jobsError);
          setSavedJobs([]);
        }

        setLoadingState({ isLoading: false, error: null });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setLoadingState({ 
          isLoading: false, 
          error: new Error('Failed to load dashboard data. Please try again later.') 
        });
      }
    };

    fetchDashboardData();
  }, []);

  const metrics: DashboardMetrics = useMemo(() => {
    console.log('Calculating metrics with resumes:', userResumes);

    // Get the latest resume by comparing createdAt timestamps
    const latestResume = userResumes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    console.log('Latest resume:', latestResume);

    return {
      activeResumes: userResumes.length,
      averageATSScore: latestResume?.atsScore || 0,
    };
  }, [userResumes]);

  const recentActivity = useMemo(() => 
    userResumes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map(resume => ({
        id: resume.id,
        type: 'resume' as const,
        description: `${resume.title} Updated`,
        timestamp: new Date(resume.updatedAt).toLocaleString(),
      })),
  [userResumes]);

  const optimizationTips = useMemo(() => {
    const tips: OptimizationTip[] = [];
    
    // Get the latest resume first
    const latestResume = userResumes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

    if (latestResume && latestResume.atsFeedback) {
      // Split feedback into separate tips
      const feedbackLines = latestResume.atsFeedback.split('\n').filter(line => line.trim());
      
      feedbackLines.forEach((line, index) => {
        tips.push({
          id: `${latestResume.id}-${index}`,
          type: latestResume.atsScore > 70 ? 'low' : 
                latestResume.atsScore > 40 ? 'medium' : 'high',
          title: 'ATS Recommendation',
          description: line
        });
      });
    }

    return tips.slice(0, 3);
  }, [userResumes]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link to="/resumes/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Create New Resume
        </Link>
      </div>

      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'User'}!</h2>
        <p className="text-gray-600">Track your job application progress, manage your resumes, and find new opportunities.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="h-10 w-10 text-indigo-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Resumes</h2>
              <p className="text-3xl font-bold text-gray-700">{metrics.activeResumes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Zap className="h-10 w-10 text-yellow-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">ATS Score</h2>
              <p className="text-3xl font-bold text-gray-700">
                {Math.round(metrics.averageATSScore)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link to="/resumes" className="text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-md">
                  <FileText className="h-6 w-6 text-gray-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimization Tips</h2>
          <div className="space-y-4">
            {optimizationTips.length > 0 ? (
              optimizationTips.map((tip) => (
                <div key={tip.id} className="flex items-center p-4 bg-gray-50 rounded-md">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                    <p className="text-sm text-gray-500">{tip.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-sm text-gray-500">No optimization tips available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Jobs */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Saved Jobs</h2>
          <Link to="/jobs" className="text-indigo-600 hover:underline">View All</Link>
        </div>
        
        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedJobs.map(job => (
              <div key={job.id} className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-md mb-1">{job.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{job.company} • {job.location}</p>
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 text-sm hover:underline"
                >
                  View Job
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <p className="text-gray-600 mb-4">You haven't saved any jobs yet.</p>
            <Link 
              to="/jobs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;