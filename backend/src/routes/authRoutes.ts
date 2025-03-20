import express from 'express';
import { validate } from '../middleware/validate';
import { authValidation } from '../validations/authValidation';
import { login, register, logout, createTestUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', validate(authValidation.register), register);
router.post('/login', validate(authValidation.login), login);
router.post('/logout', logout);

// Development only routes
if (process.env.NODE_ENV !== 'production') {
  router.post('/create-test-user', createTestUser);
  
  // Add a diagnostic endpoint
  router.get('/check-auth-system', async (req, res) => {
    res.json({
      authSystem: 'bcryptjs',
      bcryptVersion: require('bcryptjs/package.json').version,
      passwordStorage: 'Password is hashed with bcryptjs in User model pre-save hook',
      jwt: {
        secret: process.env.JWT_SECRET ? 'Configured' : 'Missing',
        expiresIn: process.env.JWT_EXPIRES_IN || '30d (default)'
      },
      routes: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout'
      }
    });
  });
}

export default router;
