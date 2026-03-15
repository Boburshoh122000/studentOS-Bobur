/**
 * Admin Scholarship Scraper Routes
 *
 * Endpoints:
 *   POST /api/admin/scholarships/auto-scrape      → Trigger full auto-scrape
 *   POST /api/admin/scholarships/scrape-test       → Test a single source by index
 *   GET  /api/admin/scholarships/scrape-status      → Get last report + running state
 *   GET  /api/admin/scholarships/scrape-sources      → List all configured sources
 */

import { Router } from 'express';
import {
  triggerManualScrape,
  getLastScrapeReport,
  isScrapeRunning,
} from '../services/scholarship-cron.js';
import { SCHOLARSHIP_SOURCES } from '../services/scholarship-sources.config.js';

const router = Router();

router.post('/auto-scrape', async (req, res, next) => {
  try {
    if (isScrapeRunning()) {
      return res.status(409).json({
        error: 'A scrape is already in progress',
        lastReport: getLastScrapeReport(),
      });
    }

    res.json({
      message: 'Auto-scrape started. Check /scrape-status for progress.',
      startedAt: new Date().toISOString(),
    });

    triggerManualScrape().catch((err) => {
      console.error('Auto-scrape background error:', err?.message);
    });
  } catch (error) {
    next(error);
  }
});

router.post('/scrape-test', async (req, res, next) => {
  try {
    const { sourceIndex } = req.body;

    if (sourceIndex === undefined || sourceIndex < 0 || sourceIndex >= SCHOLARSHIP_SOURCES.length) {
      return res.status(400).json({
        error: `Invalid sourceIndex. Must be 0-${SCHOLARSHIP_SOURCES.length - 1}`,
        sources: SCHOLARSHIP_SOURCES.map((s, i) => ({
          index: i,
          name: s.name,
          enabled: s.enabled,
        })),
      });
    }

    if (isScrapeRunning()) {
      return res.status(409).json({ error: 'A scrape is already in progress' });
    }

    const report = await triggerManualScrape(sourceIndex);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.get('/scrape-status', (_req, res) => {
  res.json({
    isRunning: isScrapeRunning(),
    lastReport: getLastScrapeReport(),
  });
});

router.get('/scrape-sources', (_req, res) => {
  res.json(
    SCHOLARSHIP_SOURCES.map((s, i) => ({
      index: i,
      name: s.name,
      type: s.type,
      url: s.url,
      enabled: s.enabled,
      maxLinks: s.maxLinks || null,
    }))
  );
});

export default router;
