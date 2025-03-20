import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ status: 'error', message: 'Email already exists' });
  }

  // Don't hash the password here, let the User model pre-save hook handle it
  const user = await User.create({
    email,
    password, // Plain password - will be hashed by pre-save hook
    firstName,
    lastName
  });

  // Remove password from response
  const userObject = user.toObject();
  const { password: _, ...userWithoutPassword } = userObject;

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '30d'
  });

  res.status(201).json({ token, user: userWithoutPassword });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log(`Login attempt for email: ${email}`);

  if (!email || !password) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Email and password are required' 
    });
  }

  try {
    // Use a single query to find the user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }
    
    console.log(`User found: ${user._id}, with email: ${user.email}`);
    
    // Make sure password field exists
    if (!user.password) {
      console.error('User found but password field is missing');
      return res.status(500).json({
        status: 'error',
        message: 'Authentication error. Please contact support.'
      });
    }
    
    // Log password details for debugging (hash length only, for security)
    console.log(`Password field exists, hash length: ${user.password.length}`);
    
    // Compare password directly
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password comparison result: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`Invalid password for email: ${email}`);
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    // Password matched, create JWT token
    console.log('Password matched, creating token');
    
    // Remove password from response
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '30d'
    });

    console.log(`Login successful for email: ${email}`);
    res.json({ 
      status: 'success',
      token, 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error('Error during login process:', err);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during login'
    });
  }
});

export const logout = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// Add this helper function to create test users when needed
export const createTestUser = catchAsync(async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      status: 'error',
      message: 'This endpoint is only available in development'
    });
  }

  const { email = 'test@example.com', password = 'password123', firstName = 'Test', lastName = 'User' } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(200).json({
        status: 'success',
        message: 'Test user already exists',
        userId: existingUser._id
      });
    }
    
    // Create user with plain password, let the model's pre-save hook handle hashing
    const user = await User.create({
      email,
      password, // Plain password
      firstName,
      lastName
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Test user created',
      userId: user._id,
      email: user.email
    });
  } catch (err) {
    console.error('Error creating test user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create test user'
    });
  }
});