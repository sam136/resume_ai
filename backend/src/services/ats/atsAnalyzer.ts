import { ATSScore, ResumeData } from '../../types';

interface AnalysisOptions {
  jobTitle?: string;
  jobDescription?: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

interface KeywordMatch {
  keyword: string;
  count: number;
  locations: string[];
}

export class ATSAnalyzer {
  private findKeywordMatches(content: string, keywords: string[]): KeywordMatch[] {
    const matches: KeywordMatch[] = [];
    const contentLower = content.toLowerCase();

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const count = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
      
      if (count > 0) {
        const sections = ['summary', 'experience', 'skills'].filter(section => 
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        matches.push({ keyword, count, locations: sections });
      }
    });

    return matches;
  }

  public analyzeResume(resume: ResumeData, options: AnalysisOptions): ATSScore {
    const content = JSON.stringify(resume).toLowerCase();
    
    // Analyze required and preferred skills
    const requiredMatches = this.findKeywordMatches(content, options.requiredSkills);
    const preferredMatches = this.findKeywordMatches(content, options.preferredSkills);
    
    const requiredScore = (requiredMatches.length / options.requiredSkills.length) * 100;
    const preferredScore = (preferredMatches.length / options.preferredSkills.length) * 100;

    // Analyze format and content
    const formatScore = this.analyzeFormat(resume);
    const contentScore = this.analyzeContent(resume);
    
    const overall = Math.round(
      (requiredScore * 0.4) + 
      (preferredScore * 0.2) + 
      (formatScore * 0.2) + 
      (contentScore * 0.2)
    );

    return {
      overall,
      sections: {
        keywords: {
          score: Math.round((requiredScore + preferredScore) / 2),
          matches: [...requiredMatches, ...preferredMatches].map(m => m.keyword),
          missing: this.getMissingKeywords(options, requiredMatches, preferredMatches)
        },
        format: {
          score: formatScore,
          issues: this.getFormatIssues(resume)
        },
        content: {
          score: contentScore,
          suggestions: this.getContentSuggestions(resume)
        }
      },
      jobMatch: {
        score: Math.round(requiredScore),
        title: options.jobTitle || '',
        company: '',
        requiredSkills: {
          matched: requiredMatches.map(m => m.keyword),
          missing: options.requiredSkills.filter(skill => 
            !requiredMatches.find(m => m.keyword.toLowerCase() === skill.toLowerCase())
          )
        }
      },
      recommendations: this.generateRecommendations(resume, {
        requiredMatches,
        preferredMatches,
        formatScore,
        contentScore
      })
    };
  }

  private analyzeFormat(resume: ResumeData): number {
    const issues = this.getFormatIssues(resume);
    return Math.max(0, Math.min(100, 100 - (issues.length * 10)));
  }

  private analyzeContent(resume: ResumeData): number {
    const suggestions = this.getContentSuggestions(resume);
    return Math.max(0, Math.min(100, 100 - (suggestions.length * 10)));
  }

  private getFormatIssues(resume: ResumeData): string[] {
    const issues: string[] = [];
    
    if (!resume.personalInfo?.email) issues.push('Missing email address');
    if (!resume.personalInfo?.phone) issues.push('Missing phone number');
    if (!resume.experience?.length) issues.push('No work experience listed');
    if (!resume.education?.length) issues.push('No education history listed');
    
    return issues;
  }

  private getContentSuggestions(resume: ResumeData): string[] {
    const suggestions: string[] = [];
    
    if (!resume.personalInfo?.summary) {
      suggestions.push('Add a professional summary');
    }
    
    resume.experience?.forEach(exp => {
      if (!exp.highlights?.length || exp.highlights.length < 3) {
        suggestions.push(`Add more achievements for ${exp.title} at ${exp.company}`);
      }
    });
    
    return suggestions;
  }

  private getMissingKeywords(
    options: AnalysisOptions, 
    requiredMatches: KeywordMatch[], 
    preferredMatches: KeywordMatch[]
  ): string[] {
    return [
      ...options.requiredSkills.filter(skill => 
        !requiredMatches.find(m => m.keyword.toLowerCase() === skill.toLowerCase())
      ),
      ...options.preferredSkills.filter(skill => 
        !preferredMatches.find(m => m.keyword.toLowerCase() === skill.toLowerCase())
      )
    ];
  }

  private generateRecommendations(resume: ResumeData, scores: any): ATSScore['recommendations'] {
    const recommendations: ATSScore['recommendations'] = [];

    if (scores.requiredMatches.length < scores.requiredSkills?.length) {
      recommendations.push({
        priority: 'high',
        section: 'keywords',
        message: 'Missing critical job requirements',
        action: 'Add missing required skills to your experience section'
      });
    }

    if (scores.formatScore < 80) {
      recommendations.push({
        priority: 'medium',
        section: 'format',
        message: 'Resume format needs improvement',
        action: 'Review format issues and update structure'
      });
    }

    return recommendations;
  }
}
