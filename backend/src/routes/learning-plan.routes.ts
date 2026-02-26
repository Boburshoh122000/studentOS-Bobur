import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireCredits } from '../middleware/credits.middleware.js';
import { generateLearningPlan } from '../services/ai.service.js';

const router = Router();

router.use(authenticate);

// ─── GET active plan ─────────────────────────────────────────────────────────
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const plan = await prisma.learningPlan.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        phases: {
          orderBy: { orderIndex: 'asc' },
          include: { resources: true },
        },
      },
    });

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

// ─── POST generate plan ──────────────────────────────────────────────────────
router.post('/generate', requireCredits('learning-plan'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { topic, duration = '4 weeks' } = req.body;

    if (!topic?.trim()) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    // Get user skills for better plan
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    // Generate via OpenAI with user-specified duration
    let generated: any;
    try {
      generated = await generateLearningPlan(topic.trim(), profile?.skills || [], duration);
    } catch {
      // Fallback mock if AI unavailable
      generated = null;
    }

    // Derive duration from what the AI returned
    const durationWeeks = generated?.roadmap?.length || 4;

    // Transform to phases + resources structure
    const phases = transformToPhases(topic.trim(), generated, durationWeeks);

    // Delete existing plan for this user (one active plan at a time)
    await prisma.learningPlan.deleteMany({ where: { userId: req.user!.id } });

    // Create plan with nested phases and resources
    const plan = await prisma.learningPlan.create({
      data: {
        userId: req.user!.id,
        topic: topic.trim(),
        durationWeeks,
        phases: {
          create: phases.map((phase, pi) => ({
            title: phase.title,
            description: phase.description,
            orderIndex: pi,
            resources: {
              create: phase.resources.map((r) => ({
                title: r.title,
                type: r.type,
                url: r.url || null,
                durationText: r.durationText || null,
              })),
            },
          })),
        },
      },
      include: {
        phases: {
          orderBy: { orderIndex: 'asc' },
          include: { resources: true },
        },
      },
    });

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH toggle resource completion ────────────────────────────────────────
router.patch('/resources/:id/toggle', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;

    // Verify ownership
    const resource = await prisma.planResource.findUnique({
      where: { id },
      include: { phase: { include: { plan: true } } },
    });

    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    const phase = resource.phase;
    if (!phase || phase.plan.userId !== req.user!.id) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Toggle
    const updated = await prisma.planResource.update({
      where: { id },
      data: { isCompleted: !resource.isCompleted },
    });

    // Auto-complete phase if ALL resources in this phase are done
    const phaseResources = await prisma.planResource.findMany({
      where: { phaseId: resource.phaseId },
    });
    const allDone = phaseResources.every((r) =>
      r.id === id ? !resource.isCompleted : r.isCompleted
    );

    if (allDone !== phase.isCompleted) {
      await prisma.planPhase.update({
        where: { id: resource.phaseId },
        data: { isCompleted: allDone },
      });
    }

    res.json({ resource: updated, phaseCompleted: allDone });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE plan ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;

    const plan = await prisma.learningPlan.findUnique({ where: { id } });
    if (!plan || plan.userId !== req.user!.id) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    await prisma.learningPlan.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ─── Helper: transform AI output to phases ──────────────────────────────

interface PhaseInput {
  title: string;
  description: string;
  resources: { title: string; type: 'VIDEO' | 'ARTICLE'; url?: string; durationText?: string }[];
}

function transformToPhases(topic: string, aiResult: any, durationWeeks: number): PhaseInput[] {
  // GPT-4o format: AI returns { title, overview, roadmap: [...] }
  if (aiResult?.roadmap?.length) {
    return aiResult.roadmap.map((entry: any, i: number) => {
      const resources: PhaseInput['resources'] = [];

      // Map tasks → ARTICLE resources with URLs (actionable items)
      if (entry.tasks?.length) {
        for (const task of entry.tasks.slice(0, 5)) {
          const taskTitle = typeof task === 'string' ? task : task.title;
          const taskUrl =
            typeof task === 'string'
              ? `https://www.google.com/search?q=${encodeURIComponent(taskTitle)}`
              : task.url || `https://www.google.com/search?q=${encodeURIComponent(task.title)}`;
          const taskDuration =
            typeof task === 'string' ? '15 min task' : task.duration || '15 min task';
          resources.push({
            title: taskTitle,
            type: 'ARTICLE' as const,
            url: taskUrl,
            durationText: taskDuration,
          });
        }
      }

      // Map resources.videos → VIDEO resources with direct URLs
      if (entry.resources?.videos?.length) {
        for (const v of entry.resources.videos) {
          resources.push({
            title: v.title,
            type: 'VIDEO' as const,
            url:
              v.url ||
              `https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchQuery || v.title)}`,
            durationText: '30 mins',
          });
        }
      }

      // Map resources.articles → ARTICLE resources with direct URLs
      if (entry.resources?.articles?.length) {
        for (const a of entry.resources.articles) {
          resources.push({
            title: a.title,
            type: 'ARTICLE' as const,
            url:
              a.url ||
              `https://www.google.com/search?q=${encodeURIComponent(a.searchQuery || a.title)}`,
            durationText: '15 min read',
          });
        }
      }

      return {
        title: entry.phase || `Week ${i + 1}`,
        description: entry.theme || '',
        resources:
          resources.length > 0
            ? resources
            : [
              {
                title: `Introduction to ${topic}`,
                type: 'VIDEO' as const,
                durationText: '25 mins',
              },
              { title: `${topic} Guide`, type: 'ARTICLE' as const, durationText: '10 min read' },
            ],
      };
    });
  }

  // Legacy format: AI returns { planTitle, description, phases: [...] }
  if (aiResult?.phases?.length) {
    return aiResult.phases.map((phase: any, i: number) => {
      const resources: PhaseInput['resources'] = [];

      // Convert actionItems into ARTICLE resources
      if (phase.actionItems?.length) {
        for (const item of phase.actionItems.slice(0, 2)) {
          resources.push({
            title: item,
            type: 'ARTICLE' as const,
            durationText: '10 min read',
          });
        }
      }

      // Convert AI resources with linkQuery into searchable URLs
      if (phase.resources?.length) {
        for (const r of phase.resources) {
          const isVideo = r.type === 'video';
          const searchUrl = isVideo
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(r.linkQuery || r.title)}`
            : `https://www.google.com/search?q=${encodeURIComponent(r.linkQuery || r.title)}`;

          resources.push({
            title: r.title,
            type: isVideo ? 'VIDEO' : 'ARTICLE',
            url: searchUrl,
            durationText: isVideo ? '30 mins' : '15 min read',
          });
        }
      }

      return {
        title: phase.title || `Week ${i + 1}`,
        description: phase.focus || phase.description || '',
        resources:
          resources.length > 0
            ? resources
            : [
              {
                title: `Introduction to ${topic}`,
                type: 'VIDEO' as const,
                durationText: '25 mins',
              },
              { title: `${topic} Guide`, type: 'ARTICLE' as const, durationText: '10 min read' },
            ],
      };
    });
  }

  // Legacy format: AI returns { weeks: [...] }
  if (aiResult?.weeks?.length) {
    const weeksPerPhase = Math.max(1, Math.ceil(aiResult.weeks.length / 3));
    const phases: PhaseInput[] = [];

    for (let p = 0; p < 3 && p * weeksPerPhase < aiResult.weeks.length; p++) {
      const slice = aiResult.weeks.slice(p * weeksPerPhase, (p + 1) * weeksPerPhase);
      const allTopics = slice.flatMap((w: any) => w.topics || []);
      const allResources = slice.flatMap((w: any) => w.resources || []);

      const phaseNames = ['Foundations', 'Core Skills', 'Advanced & Practice'];
      phases.push({
        title: `Phase ${p + 1}: ${phaseNames[p] || `Phase ${p + 1}`}`,
        description: allTopics.slice(0, 3).join(', '),
        resources: allResources.slice(0, 4).map((r: string, i: number) => ({
          title: r,
          type: i % 2 === 0 ? ('VIDEO' as const) : ('ARTICLE' as const),
          durationText: i % 2 === 0 ? '30 mins' : '15 min read',
        })),
      });
    }

    for (const phase of phases) {
      if (phase.resources.length === 0) {
        phase.resources = [
          { title: `Introduction to ${topic}`, type: 'VIDEO', durationText: '25 mins' },
          { title: `${topic} Guide`, type: 'ARTICLE', durationText: '10 min read' },
        ];
      }
    }

    return phases;
  }

  // Fallback: generate a sensible mock
  return generateMockPhases(topic, durationWeeks);
}

function generateMockPhases(topic: string, weeks: number): PhaseInput[] {
  const phaseCount = Math.min(4, Math.max(2, Math.ceil(weeks / 2)));

  const phaseTemplates = [
    {
      suffix: 'Foundations',
      desc: `Understanding the basics of ${topic}`,
      resources: [
        { title: `${topic} for Beginners`, type: 'VIDEO' as const, durationText: '45 mins' },
        {
          title: `Introduction to ${topic}`,
          type: 'ARTICLE' as const,
          durationText: '12 min read',
        },
        {
          title: `${topic} Fundamentals Crash Course`,
          type: 'VIDEO' as const,
          durationText: '30 mins',
        },
      ],
    },
    {
      suffix: 'Core Concepts',
      desc: `Deep dive into key ${topic} principles`,
      resources: [
        { title: `Mastering ${topic} Essentials`, type: 'VIDEO' as const, durationText: '50 mins' },
        {
          title: `${topic} Best Practices Guide`,
          type: 'ARTICLE' as const,
          durationText: '15 min read',
        },
        {
          title: `Case Study: ${topic} in Action`,
          type: 'ARTICLE' as const,
          durationText: '10 min read',
        },
      ],
    },
    {
      suffix: 'Hands-on Practice',
      desc: `Building real projects with ${topic}`,
      resources: [
        {
          title: `Build Your First ${topic} Project`,
          type: 'VIDEO' as const,
          durationText: '60 mins',
        },
        {
          title: `${topic} Project Walkthrough`,
          type: 'ARTICLE' as const,
          durationText: '20 min read',
        },
      ],
    },
    {
      suffix: 'Advanced & Portfolio',
      desc: `Advanced techniques and portfolio building`,
      resources: [
        { title: `Advanced ${topic} Techniques`, type: 'VIDEO' as const, durationText: '40 mins' },
        {
          title: `${topic} Portfolio Guide`,
          type: 'ARTICLE' as const,
          durationText: '18 min read',
        },
      ],
    },
  ];

  return phaseTemplates.slice(0, phaseCount).map((tmpl, i) => ({
    title: `Phase ${i + 1}: ${tmpl.suffix}`,
    description: tmpl.desc,
    resources: tmpl.resources,
  }));
}

export default router;
