import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';  // Changed from bcrypt to bcryptjs for consistency
import { Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log("Register request body:", req.body); // Debug log
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missing: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          password: !password
        }
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();
    
    // Generate token for immediate login after registration
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '30d' });
    
    // Create a user object without sensitive data
    const userObj = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObj; // Remove password from response
    
    // Return in the same format as the controller
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ 
      message: 'Error registering user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' }); // Changed to 30d to match controller
    
      // Create a user object without sensitive data
      const { password: _, ...userObj } = user.toObject();
      
      res.status(200).json({ token, user: userObj });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
  }
};

export const validateToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};