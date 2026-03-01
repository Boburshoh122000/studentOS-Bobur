import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { mediumCache } from '../middleware/cache.middleware.js';
import { scrapeAndSaveScholarship } from '../services/scholarship-scraper.service.js';

const router = Router();

// Query schema
const querySchema = z.object({
  query: z.object({
    country: z.string().optional(),
    studyLevel: z.string().optional(),
    minAmount: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

// Admin: Get all scholarships (including drafts)
router.get(
  '/admin/list',
  authenticate,
  requireAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { search, status, page = '1', limit = '50' } = req.query as any;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page

      const where: any = {};

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { institution: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [scholarships, total] = await Promise.all([
        prisma.scholarship.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.scholarship.count({ where }),
      ]);

      res.json({
        scholarships,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin: Get scholarship stats
router.get(
  '/admin/stats',
  authenticate,
  requireAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const [published, pending, draft, total] = await Promise.all([
        prisma.scholarship.count({ where: { status: 'PUBLISHED' } }),
        prisma.scholarship.count({ where: { status: 'PENDING' } }),
        prisma.scholarship.count({ where: { status: 'DRAFT' } }),
        prisma.scholarship.count(),
      ]);

      // Calculate total funding (parse awardAmount strings)
      const allScholarships = await prisma.scholarship.findMany({
        where: { status: 'PUBLISHED' },
        select: { awardAmount: true },
      });

      let totalFunding = 0;
      allScholarships.forEach((s) => {
        if (s.awardAmount) {
          // Extract numeric value from strings like "$25,000" or "Full Tuition"
          const match = s.awardAmount.replace(/,/g, '').match(/\d+/);
          if (match) {
            totalFunding += parseInt(match[0]);
          }
        }
      });

      res.json({
        published,
        pending,
        draft,
        total,
        totalFunding,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all scholarships - PUBLIC (only PUBLISHED status)
router.get(
  '/',
  optionalAuth,
  mediumCache,
  validate(querySchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { country, studyLevel, minAmount, search, page = '1', limit = '10' } = req.query as any;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page for public

      const where: any = {
        isActive: true,
        status: 'PUBLISHED',
      };

      if (country) where.country = country;
      if (studyLevel) where.studyLevel = studyLevel;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { institution: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [scholarships, total] = await Promise.all([
        prisma.scholarship.findMany({
          where,
          orderBy: { deadline: 'asc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.scholarship.count({ where }),
      ]);

      // Get saved scholarships for authenticated user
      let savedIds: string[] = [];
      if (req.user) {
        const saved = await prisma.savedScholarship.findMany({
          where: { userId: req.user.id },
          select: { scholarshipId: true },
        });
        savedIds = saved.map((s) => s.scholarshipId);
      }

      res.json({
        scholarships: scholarships.map((s) => ({
          ...s,
          isSaved: savedIds.includes(s.id),
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single scholarship
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: req.params.id as string },
    });

    if (!scholarship) {
      res.status(404).json({ error: 'Scholarship not found' });
      return;
    }

    let isSaved = false;
    if (req.user) {
      const saved = await prisma.savedScholarship.findUnique({
        where: {
          userId_scholarshipId: {
            userId: req.user.id,
            scholarshipId: scholarship.id,
          },
        },
      });
      isSaved = !!saved;
    }

    res.json({ ...scholarship, isSaved });
  } catch (error) {
    next(error);
  }
});

// Save scholarship
router.post('/:id/save', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const saved = await prisma.savedScholarship.create({
      data: {
        userId: req.user!.id,
        scholarshipId: req.params.id as string,
      },
    });
    res.status(201).json(saved);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Already saved' });
      return;
    }
    next(error);
  }
});

// Unsave scholarship
router.delete('/:id/save', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.savedScholarship.delete({
      where: {
        userId_scholarshipId: {
          userId: req.user!.id,
          scholarshipId: req.params.id as string,
        },
      },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get user's saved scholarships
router.get('/saved/list', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const saved = await prisma.savedScholarship.findMany({
      where: { userId: req.user!.id },
      include: { scholarship: true },
      orderBy: { savedAt: 'desc' },
    });
    res.json(saved.map((s) => ({ ...s.scholarship, isSaved: true, savedAt: s.savedAt })));
  } catch (error) {
    next(error);
  }
});

// Admin: Create scholarship
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const scholarship = await prisma.scholarship.create({
      data: req.body,
    });
    res.status(201).json(scholarship);
  } catch (error) {
    next(error);
  }
});

// Admin: Update scholarship
router.patch('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const scholarship = await prisma.scholarship.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(scholarship);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete scholarship
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.scholarship.delete({
      where: { id: req.params.id as string },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Admin: AI Scholarship Scraper
// Accepts a URL, scrapes the page, extracts structured data via AI, saves to DB
router.post(
  '/admin/scrape',
  authenticate,
  requireAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'A valid URL is required.' });
        return;
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        res.status(400).json({ error: 'Invalid URL format.' });
        return;
      }

      const result = await scrapeAndSaveScholarship(url);

      res.status(201).json({
        message: 'Scholarship scraped and saved successfully.',
        ...result,
      });
    } catch (error: any) {
      console.error('[Scholarship Scraper] Error:', error.message);

      if (error.message?.includes('Failed to fetch URL')) {
        res.status(502).json({
          error: `Could not reach the URL. The page may be down or blocking automated requests.`,
          details: error.message,
        });
        return;
      }

      if (error.message?.includes('AI_CONFIG_ERROR')) {
        res.status(503).json({
          error: 'AI service is not configured. Please set OPENAI_API_KEY.',
        });
        return;
      }

      if (error.message?.includes('too short')) {
        res.status(422).json({
          error: error.message,
        });
        return;
      }

      next(error);
    }
  }
);

// Authenticated: AI Auto-Match
// Scrapes scholarshipscorner.website, uses AI to filter results matching user profile
router.post('/auto-match', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { studyLevel, countries, major, gpa, fundingTypes } = req.body;

    // Build target URLs to scrape from scholarshipscorner.website
    const baseUrl = 'https://scholarshipscorner.website';
    const urls = [baseUrl];

    // Add country-specific pages if countries are specified
    if (countries && countries.length > 0) {
      countries.forEach((country: string) => {
        const slug = country.toLowerCase().replace(/\s+/g, '-');
        urls.push(`${baseUrl}/scholarships-in-${slug}/`);
        urls.push(`${baseUrl}/${slug}-scholarships/`);
      });
    }

    // Add study-level pages
    if (studyLevel) {
      const levelSlug = studyLevel.toLowerCase().replace('_', '-');
      urls.push(`${baseUrl}/${levelSlug}-scholarships/`);
    }

    // Scrape all target pages (best effort — skip failures)
    const allRawTexts: string[] = [];
    const { scrapePageText } = await import('../services/scholarship-scraper.service.js');

    await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const text = await scrapePageText(url);
          if (text.length > 100) {
            allRawTexts.push(text);
          }
        } catch {
          // Skip failed URLs silently
        }
      })
    );

    // Combine raw text (cap at 12000 chars for AI)
    const combinedText = allRawTexts.join('\n\n---PAGE BREAK---\n\n').slice(0, 12000);

    if (combinedText.length < 100) {
      // Fallback: return database results only
      const dbResults = await prisma.scholarship.findMany({
        where: { isActive: true, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
      res.json({ scholarships: dbResults, source: 'database' });
      return;
    }

    // Send to AI for structured extraction + filtering
    const OpenAI = (await import('openai')).default;
    const { env } = await import('../config/env.js');

    if (!env.OPENAI_API_KEY) {
      // Fallback: return database results
      const dbResults = await prisma.scholarship.findMany({
        where: { isActive: true, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
      res.json({ scholarships: dbResults, source: 'database' });
      return;
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const filterDescription = [
      studyLevel ? `Study Level: ${studyLevel}` : '',
      countries?.length ? `Countries: ${countries.join(', ')}` : '',
      major && major !== 'All Fields' ? `Field of Study: ${major}` : '',
      gpa ? `GPA: ${gpa}` : '',
      fundingTypes?.length ? `Funding: ${fundingTypes.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('. ');

    const prompt = `You are a scholarship data extraction specialist.

From the following scraped web content from scholarshipscorner.website, extract ALL individual scholarships mentioned.
For each scholarship, extract these fields into a JSON array.

USER PROFILE FILTERS:
${filterDescription || 'No specific filters — return all scholarships found.'}

PRIORITIZE scholarships that match the user's filters above. Put the best matches first.

REQUIRED JSON SCHEMA for each scholarship:
{
  "id": "auto-<unique-number>",
  "title": "Full scholarship name",
  "institution": "Organization offering it",
  "country": "Country",
  "studyLevel": "One of: UNDERGRADUATE, POSTGRADUATE, PHD, ANY",
  "awardType": "Full Scholarship, Full Tuition, Partial, Stipend, Grant, or Fellowship",
  "awardAmount": "Amount description or null",
  "deadline": "ISO date YYYY-MM-DD or null",
  "description": "1-2 sentence summary (max 200 chars)",
  "applicationUrl": "URL if found, otherwise null",
  "isActive": true
}

Return a JSON object: { "scholarships": [...] }
Extract up to 10 scholarships. Only include real scholarships with actual data — no fabricated entries.

RAW SCRAPED TEXT:
${combinedText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Always respond with valid JSON only. No markdown, no code fences.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_completion_tokens: 4096,
      response_format: { type: 'json_object' as const },
    });

    const raw = completion.choices[0]?.message?.content || '{"scholarships":[]}';
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    const aiScholarships = parsed.scholarships || [];

    // Save AI results to database (so they persist)
    const { saveScrapedScholarship } = await import('../services/scholarship-scraper.service.js');
    for (const s of aiScholarships) {
      try {
        await saveScrapedScholarship({
          title: s.title || 'Untitled',
          institution: s.institution || 'Unknown',
          country: s.country || 'Unknown',
          studyLevel: s.studyLevel || 'ANY',
          awardType: s.awardType || 'Full Scholarship',
          awardAmount: s.awardAmount || null,
          deadline: s.deadline || null,
          description: s.description || null,
          applicationUrl: s.applicationUrl || null,
        });
      } catch {
        // Skip duplicates or save errors
      }
    }

    res.json({
      scholarships: aiScholarships,
      source: 'ai-scrape',
      pagesScraped: allRawTexts.length,
    });
  } catch (error: any) {
    console.error('[Auto-Match] Error:', error.message);
    // Fallback to database results on any error
    try {
      const dbResults = await prisma.scholarship.findMany({
        where: { isActive: true, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
      res.json({ scholarships: dbResults, source: 'database-fallback' });
    } catch {
      next(error);
    }
  }
});

export default router;
