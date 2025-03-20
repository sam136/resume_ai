import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request Config:', {
      url: config.url,
      method: config.method,
      tokenExists: !!token,
      currentHeaders: config.headers
    });

    if (token) {
      // Ensure Authorization header is properly set
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request:', {
        tokenPreview: `${token.substring(0, 10)}...`,
        headerSet: !!config.headers.Authorization
      });
    } else {
      console.warn('No token found in localStorage for request:', config.url);
    }
    
    if (config.data instanceof FormData) {
      console.log('FormData detected, removing Content-Type header');
      delete config.headers['Content-Type'];
    }
    
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`, 
        config.data instanceof FormData ? 'FormData' : config.data || '');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', { 
      url: response.config.url,
      status: response.status,
      hasData: !!response.data 
    });
    if (import.meta.env.DEV) {
      console.log(`✅ Response:`, response.config.url, 
        typeof response.data === 'string' ? 'Binary data' : response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token on auth failure
      if (error.response.data?.message?.includes('Invalid token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Handle other 401 errors
      console.error('Authentication error:', {
        status: error.response.status,
        message: error.response.data?.message,
        endpoint: originalRequest.url
      });
    }

    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      error: error.response?.data || error.message
    });
    if (error.response) {
      const errorData = {
        status: error.response.status,
        data: error.response.data,
        endpoint: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
      };

      if (import.meta.env.DEV) {
        console.error('❌ API Error', errorData);
      }

      // Enhanced error messages
      switch (error.response.status) {
        case 500:
          error.message = `Server error: ${error.response.data?.message || 'Please try again later.'}`;
          break;
        case 413:
          error.message = 'File size too large.';
          break;
        case 415:
          error.message = 'Unsupported file type.';
          break;
        case 400:
          error.message = error.response.data?.message || 'Invalid request.';
          break;
      }
    } else if (error.request) {
      console.error('API No Response:', error.request);
      error.message = 'No response from server. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
