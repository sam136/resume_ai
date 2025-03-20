import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

// Updated to match jobService interface
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedDate?: string;
  source?: string;
  salary?: string;
  matchScore?: number;
  type?: string;
}

interface JobMatchesProps {
  jobs: Job[];
}

export const JobMatches: React.FC<JobMatchesProps> = ({ jobs }) => {
  return (
    <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WorkIcon color="primary" />
        Matching Jobs ({jobs.length})
      </Typography>

      <List>
        {jobs.map((job, index) => (
          <React.Fragment key={job.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="span">
                      {job.title}
                    </Typography>
                    {job.matchScore && (
                      <Chip
                        label={`${job.matchScore}% Match`}
                        color={job.matchScore >= 80 ? 'success' : 'primary'}
                        size="small"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {job.company} • {job.location}
                    </Typography>
                    {job.salary && (
                      <Typography variant="body2" color="text.secondary">
                        Salary: {job.salary}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mt: 1,
                      }}
                    >
                      {job.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 1 }}
                    >
                      View Job
                    </Button>
                  </Box>
                }
              />
            </ListItem>
            {index < jobs.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};
