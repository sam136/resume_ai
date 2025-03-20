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
    
    if (!this.adzunaAppId || !this.adzunaApiKey) {
      throw new Error('Adzuna API credentials are required');
    }
  }

  async findMatchingJobs(keywords: Keywords): Promise<Job[]> {
    try {
      // Ignore keywords and directly call findMatchingJobsOld
      // return await this.findMatchingJobsOld();
        const keys = Object.keys(keywords)
        if(keys.length === 0 ) return [];

        const url = `${this.baseUrl}/in/search/1`;
        
        const response = await axios.get<AdzunaResponse>(url, {
          params: {
            app_id: this.adzunaAppId,
            app_key: this.adzunaApiKey,
            what_or: keys.join(" "),  
            where: 'India',
            results_per_page: 50
          }
        });
  
        if (!response.data.results) {
          console.log('No results found');
          return [];
        }
  
        console.log(`Found ${response.data.results.length} jobs`); // Add logging
  
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
        console.error('Error fetching jobs from Adzuna:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
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

  // Remove unused parameters since we're only testing with "tech"
  async findMatchingJobsOld(): Promise<Job[]> {
    try {
      const url = `${this.baseUrl}/in/search/1`;
      
      const response = await axios.get<AdzunaResponse>(url, {
        params: {
          app_id: this.adzunaAppId,
          app_key: this.adzunaApiKey,
          what_or: "python golang c++",  
          where: 'India',
          results_per_page: 50
        }
      });

      if (!response.data.results) {
        console.log('No results found');
        return [];
      }

      console.log(`Found ${response.data.results.length} jobs`); // Add logging

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
      console.error('Error fetching jobs from Adzuna:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
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
      const url = `${this.baseUrl}/gb/search/1`;
      await axios.get(url, {
        params: {
          app_id: this.adzunaAppId,
          app_key: this.adzunaApiKey,
          what: 'test',
          results_per_page: 1
        }
      });
      return { isConnected: true };
    } catch (error: any) {
      return {
        isConnected: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}
