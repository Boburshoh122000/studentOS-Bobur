/**
 * Scholarship Cron Scheduler
 *
 * Runs the auto-scraper on a schedule.
 * Uses simple setInterval instead of node-cron to avoid extra dependency.
 *
 * Schedule: Every 24 hours (first run 5 minutes after server start)
 * Override: Set SCHOLARSHIP_CRON_INTERVAL_HOURS env var
 */

import { runAutoScraper, AutoScrapeReport } from './scholarship-auto-scraper.service.js';

let lastReport: AutoScrapeReport | null = null;
let isRunning = false;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;

export function getLastScrapeReport(): AutoScrapeReport | null {
  return lastReport;
}

export function isScrapeRunning(): boolean {
  return isRunning;
}

export async function triggerManualScrape(sourceIndex?: number): Promise<AutoScrapeReport> {
  if (isRunning) {
    throw new Error('A scrape is already in progress. Please wait for it to finish.');
  }

  isRunning = true;
  try {
    const report = await runAutoScraper(sourceIndex);
    lastReport = report;
    return report;
  } finally {
    isRunning = false;
  }
}

export function startScholarshipCron(): void {
  const intervalHours = parseInt(process.env.SCHOLARSHIP_CRON_INTERVAL_HOURS || '24', 10);
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const initialDelayMs = 5 * 60 * 1000;

  console.log(`📅 Scholarship cron scheduled: every ${intervalHours}h (first run in 5 minutes)`);

  setTimeout(async () => {
    console.log('🕐 Scholarship cron — initial run starting...');
    try {
      await triggerManualScrape();
    } catch (err: any) {
      console.error('❌ Scholarship cron initial run failed:', err?.message);
    }
  }, initialDelayMs);

  schedulerTimer = setInterval(async () => {
    console.log('🕐 Scholarship cron — scheduled run starting...');
    try {
      await triggerManualScrape();
    } catch (err: any) {
      console.error('❌ Scholarship cron scheduled run failed:', err?.message);
    }
  }, intervalMs);
}

export function stopScholarshipCron(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('🛑 Scholarship cron stopped');
  }
}
