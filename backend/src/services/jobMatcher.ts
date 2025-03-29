import axios from 'axios';
import { Keywords } from '../types/resume';
import { Job } from '../types/job';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  url: string;
}

interface AdzunaLocation {
  display_name: string;
}

interface AdzunaJobCompany {
  display_name: string;
}

interface AdzunaJobResult {
  id: string;
  title: string;
  company: AdzunaJobCompany;
  location?: AdzunaLocation;
  description: string;
  redirect_url: string;
  salary_min: number;
  salary_max: number;
}

interface AdzunaResponse {
  results: AdzunaJobResult[];
}

export class JobMatcherService {
  private readonly adzunaAppId: string;
  private readonly adzunaApiKey: string;
  private readonly baseUrl = 'https://api.adzuna.com/v1/api/jobs';

  constructor() {
    this.adzunaAppId = process.env.ADZUNA_APP_ID || '';
    this.adzunaApiKey = process.env.ADZUNA_API_KEY || '';
    
    console.log('JobMatcherService initialized with:');
    console.log(`- Base URL: ${this.baseUrl}`);
    console.log(`- App ID exists: ${!!this.adzunaAppId}`);
    console.log(`- API Key exists: ${!!this.adzunaApiKey}`);
    console.log(`- App ID length: ${this.adzunaAppId?.length || 0}`);
    console.log(`- API Key length: ${this.adzunaApiKey?.length || 0}`);
    
    if (!this.adzunaAppId || !this.adzunaApiKey) {
      throw new Error('Adzuna API credentials are required');
    }
  }

  async findMatchingJobs(keywords: Keywords): Promise<Job[]> {
    try {
        const keys = Object.keys(keywords);
        console.log(`Finding jobs with ${keys.length} keywords:`, keys);
        
        if(keys.length === 0 ) {
          console.log('No keywords provided, returning empty results');
          return [];
        }

        const url = `${this.baseUrl}/us/search/1`; // Changed from 'in' to 'us' for testing
        console.log(`Making API request to: ${url}`);
        
        const params = {
          app_id: this.adzunaAppId,
          app_key: this.adzunaApiKey,
          what_or: keys.join(" "),
          results_per_page: 50
        };
        
        console.log('Request parameters:', JSON.stringify(params, null, 2));
        
        console.log('Sending request to Adzuna API...');
        const response = await axios.get<AdzunaResponse>(url, {
          params
        });
        
        console.log('Received response with status:', response.status);
        console.log('Response headers:', JSON.stringify(response.headers, null, 2));
  
        if (!response.data.results) {
          console.log('No results found in response data');
          console.log('Response data structure:', JSON.stringify(Object.keys(response.data), null, 2));
          return [];
        }
  
        console.log(`Found ${response.data.results.length} jobs`);
        if (response.data.results.length > 0) {
          console.log('Sample job data:', JSON.stringify(response.data.results[0], null, 2));
        }
  
        return response.data.results.map((job: AdzunaJobResult): Job => ({
          id: job.id || String(Math.random()),
          title: job.title,
          company: job.company.display_name,
          location: job.location?.display_name || 'Remote',
          description: job.description,
          url: job.redirect_url,
          salary: {
            min: job.salary_min || 0,
            max: job.salary_max || 0,
            currency: 'INR' // Changed from 'INR' to 'INR' to match US market
          },
          matchScore: 100
        }));
      } catch (error) {
        console.error('Error fetching jobs from Adzuna:');
        if (axios.isAxiosError(error)) {
          console.error('Request URL:', error.config?.url);
          console.error('Request Params:', error.config?.params);
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
          console.error('Response headers:', error.response?.headers);
        } else {
          console.error('Non-Axios error:', error);
        }
        return [];
    }
  }

  private async searchLinkedIn(keywords: string[]): Promise<Job[]> {
    // Implement LinkedIn API integration
    throw new Error('Not implemented');
  }

  private async searchIndeed(keywords: string[]): Promise<Job[]> {
    // Implement Indeed API integration
    throw new Error('Not implemented');
  }

  private async fetchJobsFromAPIs(keywords: string[]): Promise<JobPosting[]> {
    // Implement multiple job board API calls
    throw new Error('Not implemented');
  }

  private calculateJobMatch(job: JobPosting, keywords: string[]): number {
    // Implement matching score calculation
    throw new Error('Not implemented');
  }

  async findMatchingJobsOld(keywords: string[]): Promise<Job[]> {
    try {
      const url = `${this.baseUrl}/in/search/1`; // Changed from 'in' to 'us' for testing
      console.log(`[findMatchingJobsOld] Making API request to: ${url}`);
      
      const params = {
        app_id: this.adzunaAppId,
        app_key: this.adzunaApiKey,
        what_or: "python golang c++",
        results_per_page: 50
      };
      
      console.log('[findMatchingJobsOld] Request parameters:', JSON.stringify(params, null, 2));
      
      console.log('[findMatchingJobsOld] Sending request to Adzuna API...');
      const response = await axios.get<AdzunaResponse>(url, {
        params
      });
      
      console.log('[findMatchingJobsOld] Received response with status:', response.status);

      if (!response.data.results) {
        console.log('[findMatchingJobsOld] No results found');
        console.log('[findMatchingJobsOld] Response data structure:', JSON.stringify(Object.keys(response.data), null, 2));
        return [];
      }

      console.log(`[findMatchingJobsOld] Found ${response.data.results.length} jobs`);
      if (response.data.results.length > 0) {
        console.log('[findMatchingJobsOld] Sample job:', JSON.stringify(response.data.results[0], null, 2));
      }

      return response.data.results.map((job: AdzunaJobResult): Job => ({
        id: job.id || String(Math.random()),
        title: job.title,
        company: job.company.display_name,
        location: job.location?.display_name || 'Remote',
        description: job.description,
        url: job.redirect_url,
        salary: {
          min: job.salary_min || 0,
          max: job.salary_max || 0,
          currency: 'INR'
        },
        matchScore: 100
      }));
    } catch (error) {
      console.error('[findMatchingJobsOld] Error fetching jobs from Adzuna:');
      if (axios.isAxiosError(error)) {
        console.error('[findMatchingJobsOld] Request URL:', error.config?.url);
        console.error('[findMatchingJobsOld] Request Params:', error.config?.params);
        console.error('[findMatchingJobsOld] Response status:', error.response?.status);
        console.error('[findMatchingJobsOld] Response data:', error.response?.data);
        console.error('[findMatchingJobsOld] Response headers:', error.response?.headers);
      } else {
        console.error('[findMatchingJobsOld] Non-Axios error:', error);
      }
      return [];
    }
  }

  calculateMatchScore(description: string, keywords: string[]): number {
    const descriptionLower = description.toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      descriptionLower.includes(keyword.toLowerCase())
    );
    return Math.round((matchedKeywords.length / keywords.length) * 100);
  }

  async testAdzunaConnection(): Promise<{ isConnected: boolean; error?: string }> {
    try {
      console.log('[testAdzunaConnection] Testing Adzuna API connection...');
      
      // Try UK endpoint first (gb)
      const ukUrl = `${this.baseUrl}/gb/search/1`;
      console.log(`[testAdzunaConnection] Testing UK endpoint: ${ukUrl}`);
      
      const params = {
        app_id: this.adzunaAppId,
        app_key: this.adzunaApiKey,
        what: 'test',
        results_per_page: 1
      };
      
      console.log('[testAdzunaConnection] Request parameters:', JSON.stringify(params, null, 2));
      
      const ukResponse = await axios.get(ukUrl, { params });
      console.log(`[testAdzunaConnection] UK endpoint successful, status: ${ukResponse.status}`);
      
      // Try US endpoint
      const usUrl = `${this.baseUrl}/us/search/1`;
      console.log(`[testAdzunaConnection] Testing US endpoint: ${usUrl}`);
      const usResponse = await axios.get(usUrl, { params });
      console.log(`[testAdzunaConnection] US endpoint successful, status: ${usResponse.status}`);
      
      // Try India endpoint
      try {
        const inUrl = `${this.baseUrl}/in/search/1`;
        console.log(`[testAdzunaConnection] Testing India endpoint: ${inUrl}`);
        const inResponse = await axios.get(inUrl, { params });
        console.log(`[testAdzunaConnection] India endpoint successful, status: ${inResponse.status}`);
      } catch (inError) {
        console.error('[testAdzunaConnection] India endpoint failed:', inError);
      }
      
      return { isConnected: true };
    } catch (error: any) {
      console.error('[testAdzunaConnection] Connection test failed:');
      if (axios.isAxiosError(error)) {
        console.error('Request URL:', error.config?.url);
        console.error('Request Params:', error.config?.params);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      } else {
        console.error('Non-Axios error:', error);
      }
      
      return {
        isConnected: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}
