import express from 'express';
import { json } from "body-parser";
import resumeRoutes from "./routes/resume";
import userRoutes from "./routes/user";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate } from "./middleware/auth";
import config from "./config";

const app = express();

// Middleware
app.use(json());
app.use(authenticate);

// Routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});