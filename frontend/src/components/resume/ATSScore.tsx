import React from 'react';
import { Box, Paper, Typography, Chip, CircularProgress } from '@mui/material';

interface ATSScoreProps {
  score: number;
  keywords: string[];
  skills: string[];
}

export const ATSScore: React.FC<ATSScoreProps> = ({ score, keywords, skills }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ATS Score
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={score}
            size={80}
            sx={{ color: getScoreColor(score) }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" component="div" color="text.secondary">
              {score}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Detected Keywords
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {keywords.map((keyword, index) => (
            <Chip key={index} label={keyword} color="primary" variant="outlined" />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill, index) => (
            <Chip key={index} label={skill} color="secondary" variant="outlined" />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};
