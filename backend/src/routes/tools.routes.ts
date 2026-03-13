import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// All tools admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// =============================================================================
// TOOLS ENDPOINTS
// =============================================================================

// GET /admin/tools - List all tools
router.get('/tools', async (req, res) => {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    res.json({
      success: true,
      data: tools.map((tool) => ({
        ...tool,
        usageCount: tool._count.usages,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tools' });
  }
});

// POST /admin/tools - Create new tool
router.post('/tools', async (req, res) => {
  try {
    const { name, slug, description, category, icon, creditCost, isActive } = req.body;

    if (!name || !slug || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name, slug, and category are required',
      });
    }

    // Check if slug already exists
    const existing = await prisma.tool.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A tool with this slug already exists',
      });
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        description: description || null,
        category,
        icon: icon || null,
        creditCost: creditCost || 0,
        isActive: isActive !== false,
      },
    });

    res.status(201).json({ success: true, data: tool });
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ success: false, error: 'Failed to create tool' });
  }
});

// PATCH /admin/tools/:id - Update tool
router.patch('/tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, category, icon, creditCost, isActive } = req.body;

    const tool = await prisma.tool.update({
      where: { id: id as string },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(icon !== undefined && { icon }),
        ...(creditCost !== undefined && { creditCost }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, data: tool });
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(500).json({ success: false, error: 'Failed to update tool' });
  }
});

// PATCH /admin/tools/:id/toggle - Toggle tool active status
router.patch('/tools/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const tool = await prisma.tool.findUnique({ where: { id: id as string } });
    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }

    const updated = await prisma.tool.update({
      where: { id: id as string },
      data: { isActive: !tool.isActive },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error toggling tool:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle tool' });
  }
});

// DELETE /admin/tools/:id - Delete tool
router.delete('/tools/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tool.delete({ where: { id: id as string } });

    res.json({ success: true, message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({ success: false, error: 'Failed to delete tool' });
  }
});

// GET /admin/tools/usage-stats - Tool usage statistics (includes all tools, even with 0 uses)
router.get('/tools/usage-stats', async (req, res) => {
  try {
    const period = (req.query.period as string) || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

    // Get ALL tools (so we show 0-use tools too)
    const allTools = await prisma.tool.findMany({
      select: { id: true, name: true, slug: true, category: true },
      orderBy: { name: 'asc' },
    });

    if (allTools.length === 0) {
      return res.json({
        success: true,
        period,
        total_usages: 0,
        total_active_users: 0,
        total_trend: '+0%',
        total_trend_direction: 'up',
        users_trend: '+0%',
        users_trend_direction: 'up',
        stats: [],
        no_tools: true,
      });
    }

    // Current period stats per tool
    const currentStats = await prisma.toolUsage.groupBy({
      by: ['toolId'],
      where: { usedAt: { gte: periodStart } },
      _count: { id: true },
    });

    // Previous period stats per tool (for trend)
    const prevStats = await prisma.toolUsage.groupBy({
      by: ['toolId'],
      where: { usedAt: { gte: prevPeriodStart, lt: periodStart } },
      _count: { id: true },
    });

    // Distinct users per tool in current period
    const uniqueUsersRaw: Array<{ toolId: string; unique_users: bigint }> = await prisma.$queryRaw`
        SELECT "toolId", COUNT(DISTINCT "userId") as unique_users
        FROM "ToolUsage"
        WHERE "usedAt" >= ${periodStart}
        GROUP BY "toolId"
      `;

    // Total unique active users in current period
    const totalUniqueRaw: Array<{ count: bigint }> = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "ToolUsage"
      WHERE "usedAt" >= ${periodStart}
    `;

    // Previous period total unique users
    const prevUniqueRaw: Array<{ count: bigint }> = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "ToolUsage"
      WHERE "usedAt" >= ${prevPeriodStart} AND "usedAt" < ${periodStart}
    `;

    const currentMap = new Map(currentStats.map((s) => [s.toolId, s._count.id]));
    const prevMap = new Map(prevStats.map((s) => [s.toolId, s._count.id]));
    const uniqueUsersMap = new Map(uniqueUsersRaw.map((r) => [r.toolId, Number(r.unique_users)]));

    const totalUsages = currentStats.reduce((sum, s) => sum + s._count.id, 0);
    const prevTotalUsages = prevStats.reduce((sum, s) => sum + s._count.id, 0);
    const totalActiveUsers = Number(totalUniqueRaw[0]?.count || 0);
    const prevTotalActiveUsers = Number(prevUniqueRaw[0]?.count || 0);

    // Build stats for ALL tools (LEFT JOIN style — 0 counts for unused tools)
    const stats = allTools
      .map((tool) => {
        const total_uses = currentMap.get(tool.id) || 0;
        const prevCount = prevMap.get(tool.id) || 0;
        const trendPct =
          prevCount > 0
            ? Math.round(((total_uses - prevCount) / prevCount) * 100)
            : total_uses > 0
              ? 100
              : 0;

        return {
          tool_id: tool.slug,
          tool_name: tool.name,
          category: tool.category,
          total_uses,
          unique_users: uniqueUsersMap.get(tool.id) || 0,
          percentage: totalUsages > 0 ? Math.round((total_uses / totalUsages) * 1000) / 10 : 0,
          trend: `${trendPct >= 0 ? '+' : ''}${trendPct}%`,
          trend_direction: (trendPct >= 0 ? 'up' : 'down') as 'up' | 'down',
        };
      })
      .sort((a, b) => b.total_uses - a.total_uses);

    const totalTrendPct =
      prevTotalUsages > 0
        ? Math.round(((totalUsages - prevTotalUsages) / prevTotalUsages) * 100)
        : totalUsages > 0
          ? 100
          : 0;
    const usersTrendPct =
      prevTotalActiveUsers > 0
        ? Math.round(((totalActiveUsers - prevTotalActiveUsers) / prevTotalActiveUsers) * 100)
        : totalActiveUsers > 0
          ? 100
          : 0;

    res.json({
      success: true,
      period,
      total_usages: totalUsages,
      total_active_users: totalActiveUsers,
      total_trend: `${totalTrendPct >= 0 ? '+' : ''}${totalTrendPct}%`,
      total_trend_direction: totalTrendPct >= 0 ? 'up' : 'down',
      users_trend: `${usersTrendPct >= 0 ? '+' : ''}${usersTrendPct}%`,
      users_trend_direction: usersTrendPct >= 0 ? 'up' : 'down',
      stats,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch usage stats' });
  }
});

// =============================================================================
// APP SETTINGS ENDPOINTS
// =============================================================================

// GET /admin/settings - Get all settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.appSettings.findMany();

    // Convert to object format
    const settingsObject: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObject[s.key] = s.value;
    });

    res.json({ success: true, data: settingsObject });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// PATCH /admin/settings - Update settings
router.patch('/settings', async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Settings object is required',
      });
    }

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      await prisma.appSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    // Return updated settings
    const settings = await prisma.appSettings.findMany();
    const settingsObject: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObject[s.key] = s.value;
    });

    res.json({ success: true, data: settingsObject });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

// =============================================================================
// PLAGIARISM PRICING CONFIG (Admin)
// =============================================================================

const PRICING_KEYS = [
  'plagiarism_pricing_tiers',
  'plagiarism_extra_threshold',
  'plagiarism_extra_base_credits',
  'plagiarism_extra_per_10k',
] as const;

// GET /admin/tools/plagiarism-pricing
router.get('/tools/plagiarism-pricing', async (_req, res) => {
  try {
    const rows = await prisma.appSettings.findMany({ where: { key: { in: [...PRICING_KEYS] } } });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({
      success: true,
      data: {
        tiers: map.plagiarism_pricing_tiers ? JSON.parse(map.plagiarism_pricing_tiers) : [],
        extraThreshold: Number(map.plagiarism_extra_threshold ?? 30000),
        extraBase: Number(map.plagiarism_extra_base_credits ?? 80),
        extraPer10k: Number(map.plagiarism_extra_per_10k ?? 25),
      },
    });
  } catch (error) {
    console.error('Error fetching plagiarism pricing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch plagiarism pricing' });
  }
});

// PUT /admin/tools/plagiarism-pricing
router.put('/tools/plagiarism-pricing', async (req, res) => {
  try {
    const { tiers, extraThreshold, extraBase, extraPer10k } = req.body;
    if (!Array.isArray(tiers)) {
      res.status(400).json({ success: false, error: 'tiers must be an array' });
      return;
    }
    await prisma.$transaction([
      prisma.appSettings.upsert({
        where: { key: 'plagiarism_pricing_tiers' },
        update: { value: JSON.stringify(tiers) },
        create: { key: 'plagiarism_pricing_tiers', value: JSON.stringify(tiers) },
      }),
      prisma.appSettings.upsert({
        where: { key: 'plagiarism_extra_threshold' },
        update: { value: String(extraThreshold ?? 30000) },
        create: { key: 'plagiarism_extra_threshold', value: String(extraThreshold ?? 30000) },
      }),
      prisma.appSettings.upsert({
        where: { key: 'plagiarism_extra_base_credits' },
        update: { value: String(extraBase ?? 80) },
        create: { key: 'plagiarism_extra_base_credits', value: String(extraBase ?? 80) },
      }),
      prisma.appSettings.upsert({
        where: { key: 'plagiarism_extra_per_10k' },
        update: { value: String(extraPer10k ?? 25) },
        create: { key: 'plagiarism_extra_per_10k', value: String(extraPer10k ?? 25) },
      }),
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating plagiarism pricing:', error);
    res.status(500).json({ success: false, error: 'Failed to update plagiarism pricing' });
  }
});

export default router;
