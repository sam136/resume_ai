import api from './api';
import axios, { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;  // Changed from firstname to firstName
  lastName: string;   // Changed from lastname to lastName
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    preferences?: {
      theme: 'light' | 'dark' | 'system';
      emailNotifications: boolean;
      jobAlerts: boolean;
    };
  }
}

const authService = {
  login: async (credentials: LoginCredentials) => {
    console.log('Login attempt:', { email: credentials.email, timestamp: new Date().toISOString() });
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: unknown) {
      console.error('Login failed:', error);
      
      // Type guard to check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        // The server responded with an error status
        if (error.response) {
          // Extract error message properly from different response formats
          let errorMessage = 'Authentication failed';
          
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (error.response.data.status === 'error' && error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          }
          
          console.log('Server returned error:', errorMessage);
          throw new Error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('Cannot connect to server. Please make sure the backend server is running.');
        }
      }
      // For other types of errors
      throw new Error('An unexpected error occurred');
    }
  },
  
  register: async (userData: RegisterData) => {
    console.log('Registration attempt:', { 
      email: userData.email, 
      firstName: userData.firstName,
      timestamp: new Date().toISOString()
    });
    try {
      console.log('Attempting registration with:', { email: userData.email, firstName: userData.firstName });
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      
      // Type guard to check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        // The server responded with an error status
        if (error.response) {
          const errorMessage = error.response.data.message || 'Registration failed';
          throw new Error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('Cannot connect to server. Please make sure the backend server is running.');
        }
      }
      // For other types of errors
      throw new Error('An unexpected error occurred');
    }
  },
  
  logout: () => {
    console.log('Logging out user, clearing token');
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    console.log('Getting current user. Token exists:', !!token);
    try {
      const response = await api.get('/users/me');
      console.log('Current user retrieved:', response.data.email);
      return response.data;
    } catch (error: unknown) {
      console.error('Get current user failed:', error);
      // Clear invalid token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('Clearing invalid token');
        localStorage.removeItem('token');
      }
      throw error;
    }
  },
  
  updateProfile: async (profileData: UpdateProfileData) => {
    console.log('Updating user profile:', profileData);
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  verifyToken: async (token: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/verify', { token });
      return response.data;
    } catch (error: unknown) {
      console.error('Token verification failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid or expired token');
        }
      }
      throw new Error('Failed to verify token');
    }
  }
};

export default authService;
