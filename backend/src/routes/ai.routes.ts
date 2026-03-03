import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { aiRateLimit } from '../middleware/rateLimit.middleware.js';
import { requireCredits } from '../middleware/credits.middleware.js';
import {
  analyzeCV,
  generateCoverLetter,
  generateLearningPlan,
  checkPlagiarism,
  runPlagiarismPipeline,
  calculatePlagiarismCreditCost,
  generatePresentationContent,
  extractTextFromFile,
} from '../services/ai.service.js';
import { CheckModule } from '@prisma/client';

// Configure multer for memory storage (for PDF processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  },
});

const router = Router();

// Helper function to handle AI errors gracefully — always responds to client
const handleAIError = (error: any, res: Response, _next: NextFunction): void => {
  const errorMessage = error?.message || 'An unexpected error occurred';

  // Handle rate limit errors
  if (
    errorMessage.includes('AI_RATE_LIMIT') ||
    errorMessage.includes('429') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('insufficient_quota') ||
    errorMessage.includes('rate_limit')
  ) {
    res.status(429).json({
      error: 'Too many AI requests. Please wait a moment and try again.',
    });
    return;
  }

  // Handle API key / configuration errors
  if (
    errorMessage.includes('API key') ||
    errorMessage.includes('AI_CONFIG') ||
    errorMessage.includes('not configured') ||
    errorMessage.includes('does not have access') ||
    errorMessage.includes('Incorrect API key')
  ) {
    res.status(503).json({
      error: 'AI service is temporarily unavailable. Please try again later.',
    });
    return;
  }

  // Handle safety / content blocks
  if (
    errorMessage.includes('SAFETY') ||
    errorMessage.includes('AI_SAFETY_BLOCK') ||
    errorMessage.includes('content_policy')
  ) {
    res.status(400).json({
      error: errorMessage.includes('PDF')
        ? 'Could not process this PDF file. Please try using the "Paste Text" option instead.'
        : 'The AI had trouble processing this content. Please try simplifying the text or use the "Paste Text" option.',
    });
    return;
  }

  // Unknown error — still respond with the actual message
  console.error('Unhandled AI route error:', error);
  res.status(500).json({
    error: errorMessage,
  });
};

// ── Test endpoint (no auth required) ─────────────────────────────────────────
router.get('/test', async (_req, res) => {
  try {
    const { env } = await import('../config/env.js');

    if (!env.OPENAI_API_KEY) {
      res.status(500).json({
        success: false,
        error: 'API Key is missing. Set OPENAI_API_KEY.',
      });
      return;
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'user',
          content: "Say exactly this: 'Hello! Your OpenAI integration is working perfectly!'",
        },
      ],
      max_completion_tokens: 50,
    });
    const message = completion.choices[0]?.message?.content || '';

    res.json({ success: true, provider: 'OpenAI', message });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Unknown error',
      code: error?.status || error?.code || null,
    });
  }
});

// All AI routes require authentication AND rate limiting (10 req/min)
router.use(authenticate, aiRateLimit);

// GET /ats-history - Get recent ATS scan history
router.get('/ats-history', async (req: AuthenticatedRequest, res) => {
  try {
    const scans = await prisma.atsScan.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        score: true,
        jobRole: true,
        fileName: true,
        createdAt: true,
      },
    });
    res.json({ success: true, data: scans });
  } catch (error) {
    console.error('Failed to fetch ATS history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scan history' });
  }
});

// GET /ats-history/:id - Get full scan result by ID
router.get('/ats-history/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const scan = await prisma.atsScan.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!scan) {
      res.status(404).json({ success: false, error: 'Scan not found' });
      return;
    }
    res.json({ success: true, data: scan });
  } catch (error) {
    console.error('Failed to fetch ATS scan:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch scan' });
  }
});

// DELETE /ats-history/:id - Delete a scan
router.delete('/ats-history/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const scan = await prisma.atsScan.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!scan) {
      res.status(404).json({ success: false, error: 'Scan not found' });
      return;
    }
    await prisma.atsScan.delete({ where: { id: scan.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ATS scan:', error);
    res.status(500).json({ success: false, error: 'Failed to delete scan' });
  }
});

// CV/ATS Analysis
router.post(
  '/analyze-cv',
  requireCredits('ats-checker'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { cvText, jobDescription, fileName } = req.body;

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

      // Save scan to history and return scanId
      let scanId: string | null = null;
      try {
        const scan = await prisma.atsScan.create({
          data: {
            userId: req.user!.id,
            score: analysis.score,
            jobRole: jobDescription ? jobDescription.substring(0, 100) : null,
            fileName: fileName || null,
            jobDescription: jobDescription || null,
            result: analysis as any,
          },
        });
        scanId = scan.id;
      } catch (dbError) {
        console.error('Failed to save ATS scan history:', dbError);
      }

      res.json({ ...analysis, scanId, remainingCredits: (req as any).remainingBalance ?? null });
    } catch (error: any) {
      handleAIError(error, res, next);
    }
  }
);

// Cover Letter Generation
router.post(
  '/cover-letter',
  requireCredits('cover-letter'),
  async (req: AuthenticatedRequest, res, next) => {
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

      res.json({ coverLetter, remainingCredits: (req as any).remainingBalance ?? null });
    } catch (error: any) {
      handleAIError(error, res, next);
    }
  }
);

// Learning Plan Generation
router.post(
  '/learning-plan',
  requireCredits('learning-plan'),
  async (req: AuthenticatedRequest, res, next) => {
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

      res.json({ ...plan, remainingCredits: (req as any).remainingBalance ?? null });
    } catch (error: any) {
      handleAIError(error, res, next);
    }
  }
);

// Plagiarism Check — New Pipeline
router.post(
  '/plagiarism-check',
  requireCredits('plagiarism-checker'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { text, modules, documentName } = req.body;

      if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
      }

      // Map frontend option IDs to CheckModule enum values
      const MODULE_MAP: Record<string, CheckModule> = {
        'advanced-ai': CheckModule.ADVANCED_AI,
        plagiarism: CheckModule.PLAGIARISM,
        hallucinations: CheckModule.HALLUCINATIONS,
        feedback: CheckModule.FEEDBACK,
      };

      const selectedModules: CheckModule[] = (modules || ['advanced-ai'])
        .map((m: string) => MODULE_MAP[m])
        .filter(Boolean);

      // Always include PLAGIARISM for baseline originality
      if (!selectedModules.includes(CheckModule.PLAGIARISM)) {
        selectedModules.push(CheckModule.PLAGIARISM);
      }

      const result = await runPlagiarismPipeline(
        text,
        selectedModules,
        req.user!.id,
        documentName || 'Untitled Document'
      );

      res.json({ ...result, remainingCredits: (req as any).remainingBalance ?? null });
    } catch (error: any) {
      handleAIError(error, res, next);
    }
  }
);

// Plagiarism History — list user's past documents
router.get('/plagiarism-history', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const documents = await prisma.plagiarismDocument.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        wordCount: true,
        status: true,
        modules: true,
        creditCost: true,
        createdAt: true,
        report: {
          select: {
            originalityScore: true,
            aiProbabilityScore: true,
            isOriginal: true,
            summary: true,
          },
        },
      },
    });
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch plagiarism history' });
  }
});

// Plagiarism Report — get full report for a document
router.get('/plagiarism-report/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const docId = String(req.params.id);
    const doc = await prisma.plagiarismDocument.findFirst({
      where: { id: docId, userId: req.user!.id },
      include: { report: true },
    });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Delete Plagiarism Document
router.delete('/plagiarism-document/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const docId = String(req.params.id);
    const doc = await prisma.plagiarismDocument.findFirst({
      where: { id: docId, userId: req.user!.id },
    });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    await prisma.plagiarismDocument.delete({ where: { id: doc.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Credit cost preview
router.post('/plagiarism-cost', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { wordCount } = req.body;
    if (!wordCount || wordCount < 1) {
      res.status(400).json({ error: 'wordCount is required' });
      return;
    }
    const cost = calculatePlagiarismCreditCost(wordCount);
    res.json({ wordCount, creditCost: cost });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate cost' });
  }
});

// Text Extraction Only (no analysis) — for file upload → preview → analyze flow
router.post(
  '/extract-text',
  upload.single('file'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      let extractedText: string;

      if (req.file.mimetype === 'text/plain') {
        // Plain text files — just read the buffer
        extractedText = req.file.buffer.toString('utf-8');
      } else {
        // PDF or DOCX — use extractTextFromFile
        extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
      }

      // Truncate to 20,000 characters to prevent token overflow
      if (extractedText.length > 20000) {
        extractedText = extractedText.substring(0, 20000);
      }

      res.json({
        extractedText,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        truncated: extractedText.length >= 20000,
      });
    } catch (error: any) {
      handleAIError(error, res, next);
    }
  }
);

// CV Upload with PDF/DOCX Text Extraction + Analysis (legacy endpoint)
router.post(
  '/upload-cv',
  upload.single('file'),
  requireCredits('ats-checker'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { jobDescription } = req.body;

      let extractedText: string;
      if (req.file.mimetype === 'text/plain') {
        extractedText = req.file.buffer.toString('utf-8');
      } else {
        extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype);
      }

      // Truncate to 20,000 characters
      if (extractedText.length > 20000) {
        extractedText = extractedText.substring(0, 20000);
      }

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

      // Save scan to history
      try {
        await prisma.atsScan.create({
          data: {
            userId: req.user!.id,
            score: analysis.score,
            jobRole: jobDescription ? jobDescription.substring(0, 100) : null,
            fileName: req.file!.originalname || null,
            jobDescription: jobDescription || null,
            result: analysis as any,
          },
        });
      } catch (dbError) {
        console.error('Failed to save ATS scan history:', dbError);
      }

      res.json({
        extractedText,
        analysis,
        remainingCredits: (req as any).remainingBalance ?? null,
      });
    } catch (error: any) {
      handleAIError(error, res, next);
    }
  }
);

// Presentation Content Generation
router.post(
  '/generate-presentation',
  requireCredits('presentation-maker'),
  async (req: AuthenticatedRequest, res, next) => {
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

      res.json({ ...presentation, remainingCredits: (req as any).remainingBalance ?? null });
    } catch (error: any) {
      handleAIError(error, res, next);
    }
  }
);

export default router;
