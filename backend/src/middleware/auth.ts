import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/appError';

// Add user property to Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    console.log('Auth middleware - Full Headers:', {
      headers: req.headers,
      path: req.path,
      method: req.method,
      authorization: req.headers.authorization
    });
    
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', { token: token.substring(0, 10) + '...' });

      try {
        // Ensure JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET is not configured');
          return res.status(500).json({
            status: 'error',
            message: 'JWT configuration error'
          });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
        console.log('Token decoded successfully:', { userId: decoded.id });

        const user = await User.findById(decoded.id);
        if (!user) {
          console.warn('No user found for token ID:', decoded.id);
          return res.status(401).json({
            status: 'error',
            message: 'User not found'
          });
        }

        // Set user on request object
        req.user = {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'user'
        };

        console.log('User authenticated:', {
          id: req.user.id,
          email: req.user.email,
          path: req.path
        });

        next();
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid authentication token'
        });
      }
    } else {
      console.warn('No Bearer token found in Authorization header');
      return res.status(401).json({
        status: 'error',
        message: 'No authentication token provided'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication'
    });
  }
};

// Simplified middleware that doesn't require authentication for certain routes
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for login and register routes
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register') || req.path === '/api/health') {
    return next();
  }
  
  return protect(req, res, next);
};

export const restrictTo = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this route', 403));
    }
    next();
  };
};