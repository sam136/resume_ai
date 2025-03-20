import type { ATSScore } from '../../types';

export interface ScanOptions {
  jobTitle?: string;
  jobDescription?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
}

export interface KeywordMatch {
  keyword: string;
  count: number;
  locations: string[];
}

export interface ATSScannerProps {
  resumeContent: string;
  options?: ScanOptions;
  onScanComplete?: (score: ATSScore) => void;
}

export interface ATSResultsProps {
  score: ATSScore;
  className?: string;
}
