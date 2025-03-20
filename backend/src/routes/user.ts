import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';

const router = express.Router();

// Route to get user profile
router.get('/:id', getUserProfile);

// Route to update user profile
router.put('/:id', updateUserProfile);

export default router;