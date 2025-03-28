import express from "express";
import { ResumeData } from "../types/resume";
import { authenticateUser } from "../middleware/authenticate";

const router = express.Router();

// Mock database or service to fetch resumes
const getResumesByUserId = async (userId: string): Promise<ResumeData[]> => {
  // Replace with actual database query
  return [
    // Example data
    {
      id: "1",
      userId,
      title: "Software Engineer Resume",
      personalInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        location: "New York, NY",
        title: "Software Engineer",
      },
      education: [],
      experience: [],
      skills: [],
    },
  ];
};

// GET /dashboard
router.get("/dashboard", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user` is populated by `authenticateUser`
    const resumes = await getResumesByUserId(userId);
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

export default router;
