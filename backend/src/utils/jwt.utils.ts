import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

interface JwtPayload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for a user
 */
export const generateToken = (user: { _id: Types.ObjectId | string; role?: string }) => {
  const payload = {
    id: user._id,
    role: user.role || 'user'
  };
  
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'] };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    options
  );
};

/**
 * Verify JWT token and return decoded payload
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Validate required fields exist in the token
    if (!decoded || !decoded.id) {
      throw new Error('Invalid token payload');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};
