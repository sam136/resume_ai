import express from 'express';
import { analyzeResume } from '../controllers/atsController';

const router = express.Router();

router.post('/analyze', analyzeResume);

export default router;
