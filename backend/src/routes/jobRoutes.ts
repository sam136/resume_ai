import express from 'express';
import { protect as authenticate } from '../middleware/auth';
import { JobSearchService } from '../services/jobSearchService';
import { Resume } from '../models/Resume';
import { JobMatcherService } from '../services/jobMatcher';

const router = express.Router();
const jobService = new JobSearchService();
const jobMatcher = new JobMatcherService();

// Search for jobs
router.post('/search', authenticate, async (req, res) => {
  try {
    const { keywords } = req.body;
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ message: 'Keywords array is required' });
    }
    
    const jobs = await jobService.searchJobs(keywords);
    res.json(jobs);
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ message: 'Server error while searching jobs' });
  }
});

// Get saved jobs
router.get('/saved', authenticate, async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user!.id;
    
    // Implementation depends on your database models
    // Here's a stub that would need actual implementation:
    // const savedJobs = await JobModel.find({ userId });
    
    // Temporary mock response
    interface Job {
      id: string;
      title?: string;
      company?: string;
      description?: string;
      location?: string;
      createdAt?: Date;
      // Any other job properties would go here
    }
    
    const savedJobs: Job[] = [];
    res.json(savedJobs);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ message: 'Server error while fetching saved jobs' });
  }
});

// Save a job
router.post('/save', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const jobData = req.body;
    
    // Implementation depends on your database models
    // Example: await new JobModel({ ...jobData, userId }).save();
    
    // Return the job with an ID
    res.status(201).json({ ...jobData, id: 'temp-id' });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ message: 'Server error while saving job' });
  }
});

// Delete a saved job
router.delete('/saved/:id', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user!.id;
    const jobId = req.params.id;
    
    // Implementation depends on your database models
    // Example: await JobModel.findOneAndDelete({ _id: jobId, userId });
    
    res.status(200).json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ message: 'Server error while removing saved job' });
  }
});

// Get recommended jobs based on resume keywords
router.get('/recommended/:resumeId', authenticate, async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    // Fetch the resume
    const resume = await Resume.findOne({ _id: resumeId, userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Extract keywords from resume
    const keywords = extractKeywordsFromResume(resume);
    
    if (keywords.length === 0) {
      return res.json([]);
    }
    
    // Use the job matcher service to find matching jobs
    const jobs = await jobMatcher.findMatchingJobsOld(keywords);
    
    // Return jobs sorted by match score
    const sortedJobs = jobs.sort((a, b) => 
      (b.matchScore || 0) - (a.matchScore || 0)
    );
    
    // Return only the top 10 matches
    res.json(sortedJobs.slice(0, 10).map(job => ({
      ...job,
      recommended: true
    })));
    
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({ message: 'Server error while fetching job recommendations' });
  }
});

// Helper function to extract relevant keywords from a resume
function extractKeywordsFromResume(resume: any): string[] {
  const keywords = new Set<string>();
  
  // Extract skills
  if (resume.skills && resume.skills.length > 0) {
    resume.skills.forEach((skill: any) => {
      keywords.add(skill.name);
      
      // Add keywords associated with the skill
      if (skill.keywords && skill.keywords.length > 0) {
        skill.keywords.forEach((keyword: string) => keywords.add(keyword));
      }
    });
  }
  
  // Extract keywords from experience
  if (resume.experience && resume.experience.length > 0) {
    resume.experience.forEach((exp: any) => {
      if (exp.keywords && exp.keywords.length > 0) {
        exp.keywords.forEach((keyword: string) => keywords.add(keyword));
      }
      
      // Add job titles as they're often good keywords
      keywords.add(exp.title);
    });
  }
  
  // Extract keywords from projects
  if (resume.projects && resume.projects.length > 0) {
    resume.projects.forEach((project: any) => {
      if (project.keywords && project.keywords.length > 0) {
        project.keywords.forEach((keyword: string) => keywords.add(keyword));
      }
    });
  }
  
  return Array.from(keywords);
}

export default router;
