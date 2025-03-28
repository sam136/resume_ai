import { Request, Response } from "express";
import { Resume } from "../models/Resume";
import { exportResumeToPDF } from "../services/exportService";
import { QueryBuilder } from "../utils/db/queryBuilder";
import { toJSON, parseQueryFilters } from "../utils/db/transform";
import type { ResumeData, Keywords, ParsedResume } from "../types/resume";
import { ResumeParser } from "../services/resumeParser"; // Updated import path
import { JobMatcherService } from "../services/jobMatcher";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class ResumeController {
  private readonly resumeParser: ResumeParser;
  private readonly jobMatcher: JobMatcherService;

  constructor() {
    this.resumeParser = new ResumeParser();
    this.jobMatcher = new JobMatcherService();

    // Bind methods to maintain 'this' context
    this.getResumes = this.getResumes.bind(this);
    this.getResumeById = this.getResumeById.bind(this);
    this.createResume = this.createResume.bind(this);
    this.updateResume = this.updateResume.bind(this);
    this.deleteResume = this.deleteResume.bind(this);
    this.exportResume = this.exportResume.bind(this);
    this.parseResume = this.parseResume.bind(this);
  }

  // Get all resumes for a user
  async getResumes(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // Get ID from authenticated user
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const query = new QueryBuilder<ResumeData>()
        .filter({})
        .sort({ updatedAt: -1 })
        .build();

      const resumes = await Resume.find(query.filter || {}).sort(query.sort);

      res.json(resumes.map((resume) => toJSON(resume)));
    } catch (error) {
      logger.error("Failed to fetch resumes:", error);
      res.status(500).json({ error: "Failed to fetch resumes" });
    }
  }

  // Get single resume by ID
  async getResumeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const query = new QueryBuilder<ResumeData>()
        .filter({ _id: id })
        .populate(["skills", "education", "experience"])
        .build();

      const query_result = Resume.findOne(query.filter);
      const resume = query.populate
        ? await query_result.populate(query.populate)
        : await query_result;
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json(toJSON(resume));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resume" });
    }
  }

  // Create new resume
  async createResume(req: Request, res: Response) {
    try {
      console.log("Resume creation request:", {
        auth: {
          hasUser: !!req.user,
          userId: req.user?.id,
          userEmail: req.user?.email,
        },
        headers: {
          authorization: req.headers.authorization,
          contentType: req.headers["content-type"],
        },
      });

      const resumeData: Partial<ResumeData> = req.body;

      if (!req.user) {
        console.log("No authenticated user found");
        return res.status(401).json({
          status: "error",
          message: "Authentication required to create resume",
        });
      }

      const userId = req.user.id;
      console.log("Creating resume for authenticated user:", userId);

      const enrichedResumeData = {
        userId,
        title: resumeData.title || `Resume ${new Date().toLocaleDateString()}`,
        personalInfo: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          title: resumeData.title || "My Resume",
          email: req.user.email,
          phone: resumeData.personalInfo?.phone || "Not Specified",
          location: resumeData.personalInfo?.location || "Not Specified",
          ...resumeData.personalInfo,
        },
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: resumeData.skills || [],
        atsScore: resumeData.atsScore || 69,
        parsedData: resumeData.parsedData || {
          rawText: "",
          keywords: {},
          atsScore: 0,
        },
        atsKeywords: ["Python", "SDE", "MERN", "FullStack"],
      };

      logger.info("Creating resume with data:", enrichedResumeData);

      const resume = new Resume(enrichedResumeData);
      const savedResume = await resume.save();

      logger.info("Resume saved successfully:", {
        resumeId: savedResume.id,
        userId: savedResume.userId,
      });

      res.status(201).json(toJSON(savedResume));
    } catch (error: any) {
      logger.error("Failed to create resume:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Invalid resume data",
          details: error.message,
        });
      }

      res.status(500).json({
        error: "Failed to create resume",
        details: error.message,
      });
    }
  }

  // Update resume
  async updateResume(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resumeData: Partial<ResumeData> = req.body;
      const resume = await Resume.findByIdAndUpdate(id, resumeData, {
        new: true,
        runValidators: true,
      });
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json(toJSON(resume));
    } catch (error) {
      res.status(500).json({ error: "Failed to update resume" });
    }
  }

  // Delete resume
  async deleteResume(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resume = await Resume.findByIdAndDelete(id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete resume" });
    }
  }

  // Export resume
  async exportResume(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { format = "pdf" } = req.query;
      const resume = await Resume.findById(id);

      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      const exportedFile = await exportResumeToPDF(
        toJSON(resume) as unknown as ResumeData
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=resume-${id}.pdf`
      );
      res.send(exportedFile);
    } catch (error) {
      res.status(500).json({ error: "Failed to export resume" });
    }
  }

  // Parse resume
  async parseResume(req: Request, res: Response) {
    try {
      console.log("Resume PARSE request:", {
        auth: {
          hasUser: !!req.user,
          userId: req.user?.id,
          userEmail: req.user?.email,
        },
        headers: {
          authorization: req.headers.authorization,
          contentType: req.headers["content-type"],
        },
      });

      console.log("Parse resume request:", {
        userId: req.user?.id,
        fileInfo: req.file && {
          size: req.file.size,
          type: req.file.mimetype,
          name: req.file.originalname,
        },
      });
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          details: "Please ensure you are sending a file in the request",
        });
      }

      const fileType = req.file.mimetype;
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(fileType)) {
        return res.status(415).json({
          error: "Invalid file type",
          details: "Only PDF and Word documents are supported",
        });
      }

      logger.info("Starting resume parse", {
        fileType,
        fileSize: req.file.size,
        originalName: req.file.originalname,
      });

      let savedResume = null;
      const rs = await Resume.findOne({});
      const newResume = new Resume({
        ...rs.toObject(),
        _id: undefined,
        id: undefined,
      });
      console.log(Object.keys(newResume));
      console.log(Object.keys(newResume.parsedData ?? { NUlll: "" }));

      savedResume = await newResume.save();
      logger.info("Resume saved to database", { resumeId: savedResume.id });

      // Send response
      return res.json({
        success: true,
        resumeId: savedResume?.id,
        atsScore: 0,
        keywords: [],
        skills: [],
        saved: !!savedResume,
        resumeUrl: savedResume ? `/resumes/${savedResume.id}` : undefined,
      });

      // Parse the resume with OpenAI
      const parseResult = await this.resumeParser.parseResume(
        req.file.buffer,
        fileType
      );

      console.log(Object.keys(parseResult));
      // Format the parsed data for database storage
      const resumeData = this.formatForDatabase(
        parseResult,
        req.user?.id || "anonymous"
      );
      console.log(Object.keys(resumeData.parsedData!));

      // Only save if user is authenticated
      console.log(`SHOULD ${req.user?.id}`);

      if (req.user?.id) {
        console.log(`HERE ${req.user?.id}`);
        const newResume = new Resume(resumeData);
        newResume.parsedData = resumeData.parsedData;
        console.log(Object.keys(newResume));
        console.log(Object.keys(newResume.parsedData ?? { NUlll: "" }));

        savedResume = await newResume.save();
        logger.info("Resume saved to database", { resumeId: savedResume.id });
      }

      // Send response
      return res.json({
        success: true,
        resumeId: savedResume?.id,
        atsScore: parseResult.atsScore,
        keywords: parseResult.industryKeywords,
        skills: parseResult.technicalSkills,
        saved: !!savedResume,
        resumeUrl: savedResume ? `/resumes/${savedResume.id}` : undefined,
      });
    } catch (error: any) {
      logger.error("Resume parse failed:", {
        error: error.message,
        stack: error.stack,
        file: req.file?.originalname,
      });

      return res.status(500).json({
        error: "Failed to parse resume",
        details: error.message,
      });
    }
  }

  private formatForDatabase(
    parseResult: ParsedResume,
    userId: string
  ): Partial<ResumeData> {
    const resumeTitle = `Resume ${new Date().toLocaleDateString()}`;

    return {
      userId: userId === "anonymous" ? "000000000000000000000000" : userId,
      title: resumeTitle,
      personalInfo: {
        firstName: parseResult.basicInfo?.name || "Anonymous",
        lastName: " ",
        email: parseResult.basicInfo?.email || "anonymous@example.com",
        phone: parseResult.basicInfo?.mobile || "000-000-0000",
        location: parseResult.basicInfo?.address || "Not Specified",
        title: "Resume",
      },
      skills: [
        ...parseResult.technicalSkills.map((skill) => ({
          id: uuidv4(),
          name: String(skill),
          level: "intermediate" as const,
          keywords: [String(skill)],
        })),
        ...parseResult.softSkills.map((skill) => ({
          id: uuidv4(),
          name: String(skill),
          level: "intermediate" as const,
          keywords: [String(skill)],
        })),
      ],
      parsedData: {
        rawText: parseResult.text,
        keywords: this.convertToKeywordMap([
          ...parseResult.industryKeywords,
          ...parseResult.actionVerbs,
        ]),
        atsScore: parseResult.atsScore,
      },
      certifications: parseResult.certifications.map((cert) => ({
        name: cert,
        issuer: cert,
        date: new Date(),
      })),
    };
  }

  private convertToKeywordMap(keywords: string[]): Record<string, number> {
    return keywords.reduce((acc, keyword) => {
      acc[keyword] = 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
