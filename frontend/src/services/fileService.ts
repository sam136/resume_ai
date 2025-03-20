import api from './api';

const fileService = {
  uploadFile: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  downloadFile: async (fileId: string) => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default fileService;
