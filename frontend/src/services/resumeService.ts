import api from './api';

export interface Resume {
  id: string;
  title: string;
  content: string;
  atsScore?: number;
  keywords?: string[];
  skills?: string[];
  status?: string;
  createdAt: string;
  updatedAt: string;
}

const resumeService = {
  getAllResumes: async (): Promise<Resume[]> => {
    const response = await api.get('/resumes'); // Remove duplicate /api prefix
    return response.data;
  },

  getResume: async (id: string): Promise<Resume> => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  createResume: async (data: Partial<Resume>): Promise<Resume> => {
    const token = localStorage.getItem('token');
    console.log('Resume creation attempt:', {
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : 'none',
      headers: api.defaults.headers
    });

    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    try {
      const response = await api.post('/resumes', data);
      console.log('Resume creation success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Resume creation failed:', {
        error: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });

      if (error.response?.status === 401) {
        localStorage.removeItem('token'); // Clear invalid token
        throw new Error('Authentication expired. Please log in again.');
      }
      throw error;
    }
  },

  deleteResume: async (id: string): Promise<void> => {
    await api.delete(`/resumes/${id}`);
  },

  parseResume: async (formData: FormData) => {
    const file = formData.get('resume') as File;
    console.log('Parsing resume:', { 
      fileName: file?.name,
      fileSize: file?.size,
      token: localStorage.getItem('token'),
      hasAuth: !!api.defaults.headers.common['Authorization']
    });
    if (!file) {
      throw new Error('No file provided');
    }

    // Additional file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!allowedTypes.includes(file.type) && 
        !['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
      throw new Error('Invalid file type. Please upload a PDF or Word document');
    }

    try {
      const response = await api.post('/resumes/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 120000, // Increase timeout for large files to 2 minutes
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          console.log('Upload progress:', percentCompleted);
        },
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error: any) {
      console.error('Resume parse error:', error);
      // Get detailed error information
      const errorResponse = error.response?.data;
      const errorMessage = errorResponse?.message || errorResponse?.error || error.message;
      console.error('Detailed error:', errorResponse);
      
      if (error.response?.status === 500) {
        throw new Error(`Server error while parsing resume: ${errorMessage}`);
      }
      if (error.response?.status === 413) {
        throw new Error('File size too large. Please upload a smaller file.');
      }
      if (error.response?.status === 415) {
        throw new Error('Unsupported file type. Please upload a PDF or Word document.');
      }
      throw new Error(errorMessage || 'Failed to parse resume');
    }
  },
};

export default resumeService;
