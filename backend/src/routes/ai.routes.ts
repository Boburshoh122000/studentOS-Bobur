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
  getPlagiarismPricingConfig,
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

// GET /career-activity - Unified career tools recent activity feed
router.get('/career-activity', async (req: AuthenticatedRequest, res) => {
  try {
    const atsScans = await prisma.atsScan.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { id: true, score: true, jobRole: true, fileName: true, createdAt: true },
    });

    const activities = atsScans.map((scan) => ({
      id: `ats_${scan.id}`,
      type: 'ats_scan',
      title: scan.fileName || scan.jobRole || 'CV Analysis',
      description: 'Scanned',
      score: scan.score,
      status: null,
      timestamp: scan.createdAt,
      scanId: scan.id,
    }));

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Failed to fetch career activity:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity' });
  }
});

// GET /academic-activity - Unified academic tools activity feed
router.get('/academic-activity', async (req: AuthenticatedRequest, res) => {
  try {
    // Fetch plagiarism documents
    const plagiarismDocs = await prisma.plagiarismDocument.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        wordCount: true,
        status: true,
        createdAt: true,
        report: {
          select: {
            originalityScore: true,
            isOriginal: true,
          },
        },
      },
    });

    // Fetch learning plans
    const learningPlans = await prisma.learningPlan.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        topic: true,
        durationWeeks: true,
        createdAt: true,
        phases: {
          select: { isCompleted: true },
        },
      },
    });

    // Build unified activity list
    const activities: any[] = [];

    for (const doc of plagiarismDocs) {
      activities.push({
        id: `plagiarism_${doc.id}`,
        type: 'plagiarism_check',
        title: doc.name || 'Untitled Document',
        score: doc.report?.originalityScore ?? null,
        isOriginal: doc.report?.isOriginal ?? null,
        timestamp: doc.createdAt,
      });
    }

    for (const plan of learningPlans) {
      const totalPhases = plan.phases.length;
      const completedPhases = plan.phases.filter((p) => p.isCompleted).length;
      activities.push({
        id: `plan_${plan.id}`,
        type: 'learning_plan',
        title: plan.topic,
        durationWeeks: plan.durationWeeks,
        progress: totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0,
        timestamp: plan.createdAt,
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate average originality score for "Academic Score" widget
    const scores = plagiarismDocs
      .map((d) => d.report?.originalityScore)
      .filter((s): s is number => typeof s === 'number');
    const avgOriginalityScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    res.json({
      success: true,
      activities: activities.slice(0, 10),
      stats: {
        totalChecks: plagiarismDocs.length,
        totalPlans: learningPlans.length,
        avgOriginalityScore,
      },
    });
  } catch (error) {
    console.error('Failed to fetch academic activity:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity' });
  }
});

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

// Plagiarism Check — New Pipeline (dynamic word-count pricing)
router.post(
  '/plagiarism-check',
  authenticate,
  aiRateLimit,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { text, modules, documentName } = req.body;

      if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
      }

      // Calculate word count and dynamic credit cost from DB pricing config
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      const pricingConfig = await getPlagiarismPricingConfig();
      const creditCost = calculatePlagiarismCreditCost(wordCount, pricingConfig);

      // Check tool is active
      const tool = await prisma.tool.findUnique({ where: { slug: 'plagiarism-checker' } });
      if (tool && !tool.isActive) {
        res.status(400).json({ error: 'This tool is currently disabled.' });
        return;
      }

      // Pre-flight balance check
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { creditBalance: true },
      });
      if (!user || user.creditBalance < creditCost) {
        res.status(402).json({
          error: 'Not enough credits to run this plagiarism check.',
          code: 'INSUFFICIENT_CREDITS',
          data: {
            required: creditCost,
            available: user?.creditBalance ?? 0,
            shortfall: creditCost - (user?.creditBalance ?? 0),
            toolName: 'Plagiarism Checker',
          },
        });
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

      // Run pipeline — pass pre-calculated cost so PlagiarismDocument stores the correct amount
      const result = await runPlagiarismPipeline(
        text,
        selectedModules,
        req.user!.id,
        documentName || 'Untitled Document',
        creditCost
      );

      // Atomically deduct credits AFTER successful pipeline (interactive transaction)
      const remainingBalance = await prisma
        .$transaction(async (tx) => {
          const latest = await tx.user.findUnique({
            where: { id: req.user!.id },
            select: { creditBalance: true },
          });
          if (!latest || latest.creditBalance < creditCost) {
            const err = new Error('BALANCE_CHANGED');
            (err as any).code = 'BALANCE_CHANGED';
            throw err;
          }
          const updated = await tx.user.update({
            where: { id: req.user!.id },
            data: { creditBalance: { decrement: creditCost } },
            select: { creditBalance: true },
          });
          if (tool) {
            await tx.toolUsage.create({
              data: { userId: req.user!.id, toolId: tool.id, credits: creditCost },
            });
          }
          return updated.creditBalance;
        })
        .catch((e) => {
          if ((e as any).code === 'BALANCE_CHANGED') return null;
          throw e;
        });

      res.json({ ...result, remainingCredits: remainingBalance });
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

// Credit cost preview — reads tiered pricing from DB
router.post('/plagiarism-cost', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { wordCount } = req.body;
    if (!wordCount || wordCount < 1) {
      res.status(400).json({ error: 'wordCount is required' });
      return;
    }
    const config = await getPlagiarismPricingConfig();
    const creditCost = calculatePlagiarismCreditCost(Number(wordCount), config);
    res.json({
      wordCount,
      creditCost,
      tiers: config.tiers,
      extraThreshold: config.extraThreshold,
      extraPer10k: config.extraPer10k,
    });
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

export default router;
