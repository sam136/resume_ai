import { Router } from 'express';
import { ResumeController } from '../controllers/resumeController';
import { protect } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const resumeController = new ResumeController();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes (no authentication required)
router.post('/parse', upload.single('resume'), resumeController.parseResume);
router.get('/:id/export', resumeController.exportResume);

// Protected routes (authentication required)
router.use(protect); // Apply authentication middleware to all routes below
router.get('/', resumeController.getResumes); // Changed from /user/:userId to /
router.get('/:id', resumeController.getResumeById);
router.post('/', resumeController.createResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

export default router;