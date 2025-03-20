import api from './api';

export interface AnalysisResult {
  score: number;
  feedback: string;
  suggestions: string[];
  keywordMatches: string[];
}

const analysisService = {
  analyzeResume: async (resumeId: string, jobDescription: string) => {
    const response = await api.post<AnalysisResult>('/analysis/resume', { 
      resumeId, 
      jobDescription 
    });
    return response.data;
  },
  
  getKeywordSuggestions: async (jobDescription: string) => {
    const response = await api.post<string[]>('/analysis/keywords', { jobDescription });
    return response.data;
  }
};

export default analysisService;
