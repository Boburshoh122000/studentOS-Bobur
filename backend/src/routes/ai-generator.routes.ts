import { Router, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { aiRateLimit } from '../middleware/rateLimit.middleware.js';
import {
  analyzeCV,
  generateCoverLetter,
  generateLearningPlan,
  checkPlagiarism,
  generatePresentationContent,
} from '../services/ai.service.js';

const router = Router();

// All AI generator routes require authentication AND rate limiting
router.use(authenticate, aiRateLimit);

// Supported action types
type AIActionType =
  | 'ats_check' // CV & ATS Checker
  | 'cover_letter' // Cover Letter Generator
  | 'learning_plan' // Learning Plan Generator
  | 'plagiarism_check' // Plagiarism Checker
  | 'presentation'; // Presentation Generator

interface AIGeneratorRequest {
  type: AIActionType;
  // ATS Check inputs
  cvText?: string;
  jobDescription?: string;
  // Cover Letter inputs
  jobTitle?: string;
  company?: string;
  // Learning Plan inputs
  goal?: string;
  timeframe?: string;
  // Plagiarism Check inputs
  text?: string;
  // Presentation inputs
  topic?: string;
  slideCount?: number;
  style?: string;
}

/**
 * Unified AI Generator Endpoint
 * POST /api/ai-generator
 *
 * Uses a 'type' parameter to switch between different AI tools:
 * - ats_check: CV & ATS analysis
 * - cover_letter: Cover letter generation
 * - learning_plan: Personalized learning plan
 * - plagiarism_check: Text plagiarism analysis
 * - presentation: Presentation content generation
 */
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const body = req.body as AIGeneratorRequest;
    const { type } = body;

    if (!type) {
      res.status(400).json({
        error: 'Missing required field: type',
        validTypes: [
          'ats_check',
          'cover_letter',
          'learning_plan',
          'plagiarism_check',
          'presentation',
        ],
      });
      return;
    }

    // Get user profile (used by multiple actions)
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    switch (type) {
      case 'ats_check': {
        const { cvText, jobDescription } = body;

        if (!cvText) {
          res.status(400).json({ error: 'CV text is required for ATS check' });
          return;
        }

        const analysis = await analyzeCV(cvText, jobDescription);

        // Update user's ATS score in their profile
        if (profile) {
          await prisma.studentProfile.update({
            where: { userId: req.user!.id },
            data: { atsScore: analysis.score },
          });
        }

        res.json({
          success: true,
          type: 'ats_check',
          data: {
            score: analysis.score,
            missing_keywords: analysis.missing_keywords,
            weaknesses: analysis.weaknesses,
            actionable_fixes: analysis.actionable_fixes,
          },
        });
        return;
      }

      case 'cover_letter': {
        const { jobTitle, company, jobDescription } = body;

        if (!jobTitle || !company || !jobDescription) {
          res.status(400).json({
            error:
              'Job title, company, and job description are required for cover letter generation',
          });
          return;
        }

        const coverLetter = await generateCoverLetter(jobTitle, company, jobDescription, {
          name: profile?.fullName || 'Applicant',
          skills: profile?.skills || [],
          experience: profile?.bio || undefined,
        });

        res.json({
          success: true,
          type: 'cover_letter',
          data: { coverLetter },
        });
        return;
      }

      case 'learning_plan': {
        const { goal, timeframe = '4 weeks' } = body;

        if (!goal) {
          res.status(400).json({ error: 'Learning goal is required' });
          return;
        }

        const plan = await generateLearningPlan(goal, profile?.skills || [], timeframe);

        res.json({
          success: true,
          type: 'learning_plan',
          data: plan,
        });
        return;
      }

      case 'plagiarism_check': {
        const { text } = body;

        if (!text) {
          res.status(400).json({ error: 'Text is required for plagiarism check' });
          return;
        }

        const result = await checkPlagiarism(text);

        res.json({
          success: true,
          type: 'plagiarism_check',
          data: result,
        });
        return;
      }

      case 'presentation': {
        const { topic, slideCount = 5, style = 'professional' } = body;

        if (!topic) {
          res.status(400).json({ error: 'Presentation topic is required' });
          return;
        }

        const presentation = await generatePresentationContent(topic, slideCount, style);

        // Set author name if available
        presentation.author = profile?.fullName || '';

        res.json({
          success: true,
          type: 'presentation',
          data: presentation,
        });
        return;
      }

      default: {
        res.status(400).json({
          error: `Unknown action type: ${type}`,
          validTypes: [
            'ats_check',
            'cover_letter',
            'learning_plan',
            'plagiarism_check',
            'presentation',
          ],
        });
        return;
      }
    }
  } catch (error: any) {
    // Handle Gemini API rate limit errors gracefully
    if (error.message?.includes('AI_RATE_LIMIT')) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'You have made too many AI requests. Please wait a moment and try again.',
        retryAfter: 60,
      });
      return;
    }

    // Handle configuration errors
    if (error.message?.includes('AI_CONFIG_ERROR')) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'AI service is temporarily unavailable. Please try again later.',
      });
      return;
    }

    // Pass other errors to the error handler
    next(error);
  }
});

export default router;
