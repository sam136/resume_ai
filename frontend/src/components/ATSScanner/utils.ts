import type { ATSScore, ResumeData } from '../../types';
import type { KeywordMatch, ScanOptions } from './types';

export function findKeywordMatches(content: string, keywords: string[]): KeywordMatch[] {
  const matches: KeywordMatch[] = [];
  const contentLower = content.toLowerCase();

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
    
    if (count > 0) {
      const sections = ['summary', 'experience', 'skills'].filter(section => 
        content.toLowerCase().includes(keyword.toLowerCase())
      );
      
      matches.push({
        keyword,
        count,
        locations: sections
      });
    }
  });

  return matches;
}

export function calculateATSScore(resumeData: ResumeData, options: ScanOptions): ATSScore {
  const content = JSON.stringify(resumeData).toLowerCase();
  const requiredMatches = findKeywordMatches(content, options.requiredSkills || []);
  const preferredMatches = findKeywordMatches(content, options.preferredSkills || []);
  
  const requiredScore = options.requiredSkills ? 
    (requiredMatches.length / options.requiredSkills.length) * 100 : 100;
  const preferredScore = options.preferredSkills ? 
    (preferredMatches.length / options.preferredSkills.length) * 100 : 100;

  const formatScore = analyzeFormat(resumeData);
  const contentScore = analyzeContent(resumeData);
  
  const overall = Math.round((requiredScore * 0.4) + (preferredScore * 0.2) + 
    (formatScore * 0.2) + (contentScore * 0.2));

  return {
    overall,
    sections: {
      keywords: {
        score: Math.round((requiredScore + preferredScore) / 2),
        matches: [...requiredMatches, ...preferredMatches].map(m => m.keyword),
        missing: [
          ...(options.requiredSkills || []).filter(skill => 
            !requiredMatches.find(m => m.keyword.toLowerCase() === skill.toLowerCase())
          ),
          ...(options.preferredSkills || []).filter(skill => 
            !preferredMatches.find(m => m.keyword.toLowerCase() === skill.toLowerCase())
          )
        ]
      },
      format: {
        score: formatScore,
        issues: getFormatIssues(resumeData)
      },
      content: {
        score: contentScore,
        suggestions: getContentSuggestions(resumeData)
      }
    },
    jobMatch: {
      score: Math.round(requiredScore),
      title: options.jobTitle || '',
      company: '',
      requiredSkills: {
        matched: requiredMatches.map(m => m.keyword),
        missing: (options.requiredSkills || []).filter(skill => 
          !requiredMatches.find(m => m.keyword.toLowerCase() === skill.toLowerCase())
        )
      }
    },
    recommendations: generateRecommendations(resumeData, {
      requiredMatches,
      preferredMatches,
      formatScore,
      contentScore
    })
  };
}

function analyzeFormat(resumeData: ResumeData): number {
  let score = 100;
  const issues = getFormatIssues(resumeData);
  score -= issues.length * 10;
  return Math.max(0, Math.min(100, score));
}

function analyzeContent(resumeData: ResumeData): number {
  let score = 100;
  const suggestions = getContentSuggestions(resumeData);
  score -= suggestions.length * 10;
  return Math.max(0, Math.min(100, score));
}

function getFormatIssues(resumeData: ResumeData): string[] {
  const issues: string[] = [];
  
  if (!resumeData.personalInfo.email) {
    issues.push('Missing email address');
  }
  if (!resumeData.personalInfo.phone) {
    issues.push('Missing phone number');
  }
  if (resumeData.experience.length === 0) {
    issues.push('No work experience listed');
  }
  if (resumeData.education.length === 0) {
    issues.push('No education history listed');
  }
  
  return issues;
}

function getContentSuggestions(resumeData: ResumeData): string[] {
  const suggestions: string[] = [];
  
  if (!resumeData.personalInfo.summary) {
    suggestions.push('Add a professional summary');
  }
  
  resumeData.experience.forEach(exp => {
    if (exp.highlights.length < 3) {
      suggestions.push(`Add more achievements for ${exp.title} at ${exp.company}`);
    }
    if (!exp.keywords || exp.keywords.length < 2) {
      suggestions.push(`Add relevant skills/keywords for ${exp.title} role`);
    }
  });
  
  return suggestions;
}

function generateRecommendations(resumeData: ResumeData, scores: any): ATSScore['recommendations'] {
  const recommendations: ATSScore['recommendations'] = [];
  
  if (scores.requiredMatches.length < 3) {
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
  
  if (scores.contentScore < 70) {
    recommendations.push({
      priority: 'high',
      section: 'content',
      message: 'Content lacks depth',
      action: 'Add more detailed achievements and metrics'
    });
  }
  
  return recommendations;
}
