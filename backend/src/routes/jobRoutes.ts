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
    console.log(`[jobRoutes] Getting recommended jobs for resumeId: ${resumeId}`);
    
    if (!req.user) {
      console.log('[jobRoutes] No user found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userId = req.user.id;
    console.log(`[jobRoutes] User ID: ${userId}`);
    
    // Log the resume ID we're looking for
    console.log(`[jobRoutes] Looking for resume with ID: ${resumeId} and userId: ${userId}`);
    
    // First try to find by exact ID
    console.log('[jobRoutes] Attempting to find resume by ID');
    let resume = await Resume.findById(resumeId);
    
    if (!resume) {
      console.log('[jobRoutes] Resume not found by ID, trying without userId filter');
      
      // If not found, try with string comparison (in case of ObjectId vs string issues)
      console.log('[jobRoutes] Checking if Resume model has a find method:', typeof Resume.find);
      
      try {
        const allResumes = await Resume.find({});
        console.log(`[jobRoutes] Found ${allResumes.length} total resumes`);
        
        // Print IDs of first few resumes for debugging
        if (allResumes.length > 0) {
          console.log('[jobRoutes] Sample resume IDs:');
          allResumes.slice(0, 3).forEach(r => {
            console.log(`- ID: ${r._id}, toString: ${r._id.toString()}`);
          });
        }
        
        // Find resume manually by comparing string IDs
        resume = allResumes.find(r => r._id.toString() === resumeId) || null;
        
        if (!resume) {
          console.log(`[jobRoutes] Resume ${resumeId} not found after manual search`);
          return res.status(404).json({ message: 'Resume not found' });
        }
        
        console.log('[jobRoutes] Found resume by string ID comparison');
      } catch (findError) {
        console.error('[jobRoutes] Error during find operation:', findError);
        return res.status(500).json({ message: 'Error searching for resume' });
      }
    } else {
      console.log('[jobRoutes] Resume found by direct ID lookup');
    }
    
    // Extract keywords from resume
    console.log('[jobRoutes] Extracting keywords from resume');
    const keywords = extractKeywordsFromResume(resume);
    console.log(`[jobRoutes] Extracted ${keywords.length} keywords:`, keywords);
    
    if (keywords.length === 0) {
      console.log('[jobRoutes] No keywords found in resume, returning empty array');
      return res.json([]);
    }
    
    // Use the job matcher service to find matching jobs
    console.log('[jobRoutes] Calling findMatchingJobsOld() for keywords');
    const jobs = await jobMatcher.findMatchingJobsOld(keywords);
    console.log(`[jobRoutes] Found ${jobs.length} matching jobs`);
    
    // Return jobs sorted by match score
    const sortedJobs = jobs.sort((a, b) => 
      (b.matchScore || 0) - (a.matchScore || 0)
    );
    
    // Return only the top 10 matches
    const topJobs = sortedJobs.slice(0, 10).map(job => ({
      ...job,
      recommended: true
    }));
    
    console.log(`[jobRoutes] Returning ${topJobs.length} top jobs`);
    res.json(topJobs);
    
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({ message: 'Server error while fetching job recommendations' });
  }
});

// Helper function to extract relevant keywords from a resume
function extractKeywordsFromResume(resume: any): string[] {
  console.log('[extractKeywordsFromResume] Resume structure:', Object.keys(resume));
  
  // Try multiple places where keywords might be stored
  let keywords: string[] = [];
  
  // Check if resume has direct keywords property
  if (resume.keywords && Array.isArray(resume.keywords)) {
    console.log('[extractKeywordsFromResume] Found direct keywords array');
    keywords = resume.keywords;
  } 
  // Check if resume has skills property
  else if (resume.skills && Array.isArray(resume.skills)) {
    console.log('[extractKeywordsFromResume] Found skills array');
    keywords = resume.skills;
  }
  // Check if resume is nested with a skills object containing currentSkills
  else if (resume.skills && resume.skills.currentSkills && Array.isArray(resume.skills.currentSkills)) {
    console.log('[extractKeywordsFromResume] Found nested currentSkills');
    keywords = resume.skills.currentSkills;
  }
  // Check if resume has content that might contain keywords
  else if (resume.content) {
    console.log('[extractKeywordsFromResume] Extracting from content');
    // Simple extraction - split by spaces and filter out short words
    keywords = resume.content
      .split(/\s+/)
      .filter((word: string) => word.length > 4)
      .slice(0, 10);
  }
  
  // If we have a toObject method (Mongoose document), use it
  if (resume.toObject) {
    console.log('[extractKeywordsFromResume] Converting Mongoose document to object');
    const resumeObj = resume.toObject();
    
    // Logging the structure to find keywords
    console.log('[extractKeywordsFromResume] Resume as object:', 
      Object.keys(resumeObj).filter(key => typeof resumeObj[key] !== 'function'));
      
    // Try to find keywords in the converted object
    if (!keywords.length && resumeObj.keywords) {
      keywords = resumeObj.keywords;
    }
  }
  
  // If still no keywords found, use default technology keywords
  if (!keywords.length) {
    console.log('[extractKeywordsFromResume] No keywords found, using defaults');
    keywords = ["javascript", "react", "node", "typescript", "python"];
  }
  
  console.log(`[extractKeywordsFromResume] Final keywords (${keywords.length}):`, keywords);
  return keywords;
}

export default router;
