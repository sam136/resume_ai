import express from 'express';
import { json } from 'body-parser';
import { connect } from './utils/database';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import userRoutes from './routes/user';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import config from './config';

const app = express();

// Connect to the database
connect();

// Middleware
app.use(json());
app.use(authenticate);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});