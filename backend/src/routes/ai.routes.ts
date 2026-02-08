import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { aiRateLimit } from '../middleware/rateLimit.middleware.js';
import {
  analyzeCV,
  generateCoverLetter,
  generateLearningPlan,
  checkPlagiarism,
  generatePresentationContent,
  extractTextFromPDF,
} from '../services/gemini.service.js';

// Configure multer for memory storage (for PDF processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

const router = Router();

// Helper function to handle AI errors gracefully
const handleAIError = (error: any, res: Response, next: NextFunction): boolean => {
  const errorMessage = error?.message || '';

  // Handle rate limit errors
  if (
    errorMessage.includes('AI_RATE_LIMIT') ||
    errorMessage.includes('429') ||
    errorMessage.includes('quota')
  ) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many AI requests. Please wait a moment and try again.',
    });
    return true;
  }

  // Handle API key / configuration errors
  if (
    errorMessage.includes('API key') ||
    errorMessage.includes('AI_CONFIG') ||
    errorMessage.includes('not configured')
  ) {
    res.status(503).json({
      error: 'Service unavailable',
      message: 'AI service is temporarily unavailable. Please try again later.',
    });
    return true;
  }

  // Handle Google AI safety blocks
  if (
    errorMessage.includes('GoogleGenerativeAI') ||
    errorMessage.includes('SAFETY') ||
    errorMessage.includes('AI_SAFETY_BLOCK')
  ) {
    res.status(400).json({
      error: 'Content processing issue',
      message: errorMessage.includes('PDF')
        ? 'Could not process this PDF file. Please try using the "Paste Text" option instead.'
        : 'The AI had trouble processing this content. Please try simplifying the text or use the "Paste Text" option.',
    });
    return true;
  }

  // Not an AI-specific error, pass to default handler
  return false;
};

// All AI routes require authentication AND rate limiting (10 req/min)
router.use(authenticate, aiRateLimit);

// CV/ATS Analysis
router.post('/analyze-cv', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { cvText, jobDescription } = req.body;

    if (!cvText) {
      res.status(400).json({ error: 'CV text is required' });
      return;
    }

    const analysis = await analyzeCV(cvText, jobDescription);

    // Update user's ATS score (use upsert to handle missing profile)
    try {
      await prisma.studentProfile.upsert({
        where: { userId: req.user!.id },
        update: { atsScore: analysis.score },
        create: {
          userId: req.user!.id,
          atsScore: analysis.score,
          fullName: req.user!.email?.split('@')[0] || 'User',
        },
      });
    } catch (dbError) {
      console.error('Failed to update ATS score in profile:', dbError);
    }

    res.json(analysis);
  } catch (error: any) {
    if (!handleAIError(error, res, next)) {
      next(error);
    }
  }
});

// Cover Letter Generation
router.post('/cover-letter', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { jobTitle, company, jobDescription } = req.body;

    if (!jobTitle || !company || !jobDescription) {
      res.status(400).json({ error: 'Job title, company, and description are required' });
      return;
    }

    // Get user profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const coverLetter = await generateCoverLetter(jobTitle, company, jobDescription, {
      name: profile?.fullName || 'Applicant',
      skills: profile?.skills || [],
      experience: profile?.bio || undefined,
    });

    res.json({ coverLetter });
  } catch (error: any) {
    if (!handleAIError(error, res, next)) {
      next(error);
    }
  }
});

// Learning Plan Generation
router.post('/learning-plan', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { goal, timeframe = '4 weeks' } = req.body;

    if (!goal) {
      res.status(400).json({ error: 'Learning goal is required' });
      return;
    }

    // Get user's current skills
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const plan = await generateLearningPlan(goal, profile?.skills || [], timeframe);

    res.json(plan);
  } catch (error: any) {
    if (!handleAIError(error, res, next)) {
      next(error);
    }
  }
});

// Plagiarism Check
router.post('/plagiarism-check', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const result = await checkPlagiarism(text);
    res.json(result);
  } catch (error: any) {
    if (!handleAIError(error, res, next)) {
      next(error);
    }
  }
});

// CV Upload with PDF Text Extraction
router.post('/upload-cv', upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { jobDescription } = req.body;

    // Convert file buffer to base64
    const base64Content = req.file.buffer.toString('base64');

    // Extract text from PDF using Gemini
    const extractedText = await extractTextFromPDF(base64Content);

    // Analyze the CV
    const analysis = await analyzeCV(extractedText, jobDescription);

    // Update user's ATS score (use upsert to handle missing profile)
    try {
      await prisma.studentProfile.upsert({
        where: { userId: req.user!.id },
        update: { atsScore: analysis.score },
        create: {
          userId: req.user!.id,
          atsScore: analysis.score,
          fullName: req.user!.email?.split('@')[0] || 'User',
        },
      });
    } catch (dbError) {
      console.error('Failed to update ATS score in profile:', dbError);
    }

    res.json({
      extractedText,
      analysis,
    });
  } catch (error: any) {
    if (!handleAIError(error, res, next)) {
      next(error);
    }
  }
});

// Presentation Content Generation
router.post('/generate-presentation', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { topic, slideCount = 5, style = 'professional' } = req.body;

    if (!topic) {
      res.status(400).json({ error: 'Presentation topic is required' });
      return;
    }

    // Get user's name for author field
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const presentation = await generatePresentationContent(topic, slideCount, style);

    // Set author name if available
    presentation.author = profile?.fullName || '';

    res.json(presentation);
  } catch (error: any) {
    if (!handleAIError(error, res, next)) {
      next(error);
    }
  }
});

export default router;
