import React, { useEffect } from 'react';
import type { ATSScannerProps } from './types';
import { calculateATSScore } from './utils';

const ATSScanner: React.FC<ATSScannerProps> = ({ 
  resumeContent, 
  options = {}, 
  onScanComplete 
}) => {
  useEffect(() => {
    const resumeData = JSON.parse(resumeContent);
    const score = calculateATSScore(resumeData, options);
    onScanComplete?.(score);
  }, [resumeContent, options, onScanComplete]);

  return null; // This component only handles the scanning logic
};

export default ATSScanner;
