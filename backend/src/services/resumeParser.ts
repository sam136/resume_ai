import pdf from "pdf-parse";
import mammoth from "mammoth";
import natural from "natural";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";
import { ParsedResume, Skill } from "../types/resume";

interface AIAnalysisResult {
  technicalSkills: Skill[];
  softSkills: Skill[];
  industryKeywords: string[];
  certifications: string[];
  actionVerbs: string[];

  basicInfo: {
    name: string;
    email: string;
    mobile: string;
    address: string;
  };
  skills: {
    currentSkills: string[];
    recommendedSkills: string[];
  };
  courseRecommendations: {
    platform: string;
    courseName: string;
    link: string;
  }[];
  appreciation: string[];
  resumeTips: string[];
  atsScore: number;
  aiResumeSummary: string;
  matchingJobRoles: string[];
  atsKeywords: string[];
  projectSuggestions: {
    improvementTips: string[];
    newProjectRecommendations: string[];
  };
}

export class ResumeParser {
  private tokenizer = new natural.WordTokenizer();
  private tfidf = new natural.TfIdf();
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
  }

  public async parseResume(
    file: Buffer,
    fileType: string
  ): Promise<ParsedResume> {
    try {
      logger.info(`Starting resume parse for file type: ${fileType}`);
      const text = await this.extractText(file, fileType);
      if (!text || text.trim().length === 0) {
        throw new Error("No text content extracted from file");
      }

      let aiAnalysis: AIAnalysisResult;
      try {
        logger.info("Attempting AI analysis...");
        aiAnalysis = await this.analyzeWithAI(text);
      } catch (aiError: any) {
        logger.warn("AI analysis failed, falling back to basic parser:", {
          error: aiError.message,
        });
        aiAnalysis = await this.basicAnalysis(text);
      }

      // const atsScore = await this.calculateATSScore(aiAnalysis);

      return {
        text,
        rawText: text,
        ...aiAnalysis,
        atsScore: aiAnalysis.atsScore,
      };
    } catch (error: any) {
      logger.error("Resume parsing failed:", {
        error: error.message,
        stack: error.stack,
        fileType,
      });
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  private async extractText(file: Buffer, fileType: string): Promise<string> {
    try {
      if (fileType.includes("pdf")) {
        const pdfData = await pdf(file);
        return pdfData.text;
      } else if (fileType.includes("word")) {
        const { value } = await mammoth.extractRawText({ buffer: file });
        return value;
      }
      throw new Error(`Unsupported file type: ${fileType}`);
    } catch (error: any) {
      logger.error("Text extraction failed:", {
        error: error.message,
        fileType,
      });
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  private formatSkills(skills: string[]): Skill[] {
    return skills.map((skill, index) => ({
      id: index.toString(),
      name: skill,
      keywords: [skill.toLowerCase()],
      level: "beginner",
    }));
  }

  private async analyzeWithAI(text: string): Promise<AIAnalysisResult> {
    const prompt = `
    You are an expert resume analyzer. You must produce valid JSON output and ensure all URLs are valid and relevant to the recommended courses. Additionally, you must tailor job roles to the candidate’s experience level. For example, if the resume indicates an entry-level or student background, include junior- or intern-level job roles (e.g., 'Data Science Intern', 'Junior Data Scientist', 'Machine Learning Intern') rather than exclusively senior positions.

Evaluation Criteria for Resume Score:
- Formatting and structure (clear sections, bullet points)
- ATS Optimization (use of industry-relevant keywords)
- Content Quality (clarity, conciseness, grammar)
- Relevance (matching skills and experience)
- Readability and presentation

Return the JSON structure as follows:
{{
    "basicInfo": {{
        "name": string,
        "email": string,
        "mobile": string,
        "address": string
    }},
    "skills": {{
        "currentSkills": list of at least 5 key skills,
        "recommendedSkills": list of at least 5 skills for improvement
    }},
    "courseRecommendations": list of at least 5 courses with details as:
    {{
        "platform": string,
        "course_name": string,
        "link": valid URL (ensure this is an active youtube url, relevant course URL)
    }},
    "appreciation": list of at least 5 personalized positive comments,
    "resumeTips": list of at least 5 suggestions for improvement,
    "atsScore": number (score out of 100 in interger format),
    "aiResumeSummary": string (a concise summary for ATS optimization),
    "matchingJobRoles": list of 2-3 job roles specifically relevant to the candidate’s experience level,
    "atsKeywords": list of at least 5 industry-relevant keywords,
    "projectSuggestions": {{
        "improvementTips": list of 2-3 tips to enhance existing projects,
        "newProjectRecommendations": list of 2-3 suggested projects
    }}
}}

Ensure the JSON is valid before outputting.
    Resume Text:
    ${text}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Clean up the response text by removing any markdown formatting
      const cleanJson = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      console.log(cleanJson);
      const parsedResult = JSON.parse(cleanJson);
      console.log("HEE");
      console.log(parsedResult);

      return {
        technicalSkills: this.formatSkills(parsedResult.technicalSkills || []),
        softSkills: this.formatSkills(parsedResult.softSkills || []),
        industryKeywords: parsedResult.industryKeywords || [],
        certifications: parsedResult.certifications || [],
        actionVerbs: parsedResult.actionVerbs || [],
        basicInfo: parsedResult.basicInfo || {
          name: "",
          email: "",
          mobile: "",
          address: "",
        },
        skills: parsedResult.skills || {
          currentSkills: [],
          recommendedSkills: [],
        },
        courseRecommendations: parsedResult.courseRecommendations || [],
        appreciation: parsedResult.appreciation || [],
        resumeTips: parsedResult.resumeTips || [],
        atsScore: parsedResult.resumeScore || "",
        aiResumeSummary: parsedResult.aiResumeSummary || "",
        matchingJobRoles: parsedResult.matchingJobRoles || [],
        atsKeywords: parsedResult.atsKeywords || [],
        projectSuggestions: parsedResult.projectSuggestions || {
          improvementTips: [],
          newProjectRecommendations: [],
        },
        ...parsedResult,
      };
    } catch (error) {
      logger.error("Gemini AI analysis failed:", error);
      throw error;
    }
  }

  private async basicAnalysis(text: string): Promise<AIAnalysisResult> {
    // Extract common programming languages and technologies
    const techKeywords = [
      "javascript",
      "typescript",
      "python",
      "java",
      "react",
      "node",
    ];
    const softSkills = [
      "leadership",
      "communication",
      "teamwork",
      "problem-solving",
    ];
    const actionVerbs = [
      "developed",
      "implemented",
      "managed",
      "created",
      "designed",
    ];

    const techMatches = techKeywords.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    const softMatches = softSkills.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase())
    );
    const verbMatches = actionVerbs.filter((verb) =>
      text.toLowerCase().includes(verb.toLowerCase())
    );

    // Extract potential certifications (basic approach)
    const certRegex =
      /(?:certified|certification|certificate|AWS|Azure|PMP|CISSP)/gi;
    const certMatches = text.match(certRegex) || [];

    // Get industry keywords using TF-IDF
    this.tfidf.addDocument(text);
    const industryKeywords = this.extractTopKeywords(text, 10);

    return {
      technicalSkills: this.formatSkills(Array.from(new Set(techMatches))),
      softSkills: this.formatSkills(Array.from(new Set(softMatches))),
      industryKeywords: Array.from(new Set(industryKeywords)),
      certifications: Array.from(new Set(certMatches)),
      actionVerbs: Array.from(new Set(verbMatches)),
      basicInfo: {
        name: "John Doe",
        email: "",
        mobile: "",
        address: "",
      },
      skills: {
        currentSkills: techMatches,
        recommendedSkills: ["AWS", "Docker", "Kubernetes"],
      },
      courseRecommendations: [
        {
          platform: "Coursera",
          courseName: "AWS Certified Solutions Architect",
          link: "https://www.coursera.org/specializations/aws-fundamentals",
        },
        {
          platform: "Udemy",
          courseName: "Docker Mastery",
          link: "https://www.udemy.com/course/docker-mastery/",
        },
      ],
      appreciation: [
        "Great work on your projects!",
        "Excellent communication skills.",
      ],
      resumeTips: [
        "Add more action verbs to your experience section.",
        "Include specific achievements and metrics.",
      ],
      atsScore: 85,
      aiResumeSummary: "AI and ML enthusiast with strong JavaScript skills.",
      matchingJobRoles: ["Software Engineer", "Frontend Developer"],
      atsKeywords: ["JavaScript", "React", "Node.js"],
      projectSuggestions: {
        improvementTips: [
          "Add more unit tests for your projects.",
          "Include a README file for each project.",
        ],
        newProjectRecommendations: [
          "Build a personal portfolio website.",
          "Create a full-stack e-commerce application.",
        ],
      },
    };
  }

  private extractTopKeywords(text: string, limit: number): string[] {
    const words = this.tokenizer.tokenize(text) || [];
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
    ]);

    return words
      .filter((word) => !stopWords.has(word.toLowerCase()))
      .filter((word) => word.length > 2)
      .slice(0, limit);
  }

  public async calculateATSScore(analysis: AIAnalysisResult): Promise<number> {
    let score = 0;

    // Technical skills weight (40% of total score)
    score += Math.min(analysis.technicalSkills.length * 4, 40);

    // Soft skills weight (20% of total score)
    score += Math.min(analysis.softSkills.length * 2, 20);

    // Industry keywords weight (20% of total score)
    score += Math.min(analysis.industryKeywords.length * 2, 20);

    // Certifications weight (10% of total score)
    score += Math.min(analysis.certifications.length * 5, 10);

    // Action verbs weight (10% of total score)
    score += Math.min(analysis.actionVerbs.length, 10);

    return Math.round(score);
  }
}
