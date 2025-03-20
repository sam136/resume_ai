import express from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { userValidation } from '../validations/userValidation';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
} from '../controllers/userController';

const router = express.Router();

// Protected routes
router.use(protect);

// Profile routes
router.patch('/profile', validate(userValidation.updateProfile), updateProfile);

// Admin only routes
router.use(restrictTo(['admin']));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .patch(validate(userValidation.updateUser), updateUser)
  .delete(deleteUser);

export default router;
