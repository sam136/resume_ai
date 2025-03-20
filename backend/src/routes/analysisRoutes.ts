import express from 'express';
import { protect } from '../middleware/auth';
import { 
    getResumeAnalysis, 
    getJobMatchAnalysis,
    getUserStats 
} from '../controllers/analysisController';

const router = express.Router();

router.use(protect);

router.get('/resume/:resumeId', getResumeAnalysis);
router.post('/job-match', getJobMatchAnalysis);
router.get('/user-stats', getUserStats);

export default router;
