/**
 * Scholarship Auto-Scraper Service
 *
 * Orchestrates the full pipeline:
 * 1. Reads source registry
 * 2. For LISTING sources → scrapes page, extracts detail links
 * 3. For each detail URL → runs scrapeAndSaveScholarship()
 * 4. Rate-limits requests (3s between fetches)
 * 5. Isolates errors per URL (one failure ≠ full batch fail)
 * 6. Logs results for admin monitoring
 *
 * Called by: cron job (daily) or admin manual trigger
 */

import * as cheerio from 'cheerio';
import { SCHOLARSHIP_SOURCES, ScholarshipSource } from './scholarship-sources.config.js';
import { scrapeAndSaveScholarship } from './scholarship-scraper.service.js';

interface ScrapeResult {
  url: string;
  source: string;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  title?: string;
  error?: string;
  durationMs: number;
}

export interface AutoScrapeReport {
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  sourcesProcessed: number;
  totalUrlsAttempted: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: ScrapeResult[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const uniqueUrls = (urls: string[]): string[] => [...new Set(urls)];

async function extractListingLinks(source: ScholarshipSource): Promise<string[]> {
  if (!source.linkSelector) return [];

  const response = await fetch(source.url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching listing: ${source.url}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const links: string[] = [];
  $(source.linkSelector).each((_, el) => {
    let href = $(el).attr('href');
    if (!href) return;

    if (href.startsWith('/') && source.baseUrl) {
      href = source.baseUrl.replace(/\/$/, '') + href;
    }

    if (href.startsWith('http')) {
      links.push(href);
    }
  });

  const max = source.maxLinks || 10;
  return uniqueUrls(links).slice(0, max);
}

export async function runAutoScraper(specificSourceIndex?: number): Promise<AutoScrapeReport> {
  const startedAt = new Date();
  const results: ScrapeResult[] = [];

  const sources =
    specificSourceIndex !== undefined
      ? [SCHOLARSHIP_SOURCES[specificSourceIndex]].filter(Boolean)
      : SCHOLARSHIP_SOURCES.filter((s) => s.enabled);

  console.log(`\n🔍 Auto-scraper starting — ${sources.length} source(s) to process`);

  let sourcesProcessed = 0;

  for (const source of sources) {
    sourcesProcessed++;
    console.log(`\n📌 [${sourcesProcessed}/${sources.length}] ${source.name}`);

    try {
      let detailUrls: string[] = [];

      if (source.type === 'LISTING') {
        console.log(`  → Fetching listing page: ${source.url}`);
        detailUrls = await extractListingLinks(source);
        console.log(`  → Found ${detailUrls.length} detail links`);

        if (detailUrls.length === 0) {
          results.push({
            url: source.url,
            source: source.name,
            status: 'SKIPPED',
            error: 'No links found with selector: ' + source.linkSelector,
            durationMs: 0,
          });
          continue;
        }
      } else {
        detailUrls = [source.url];
      }

      for (const url of detailUrls) {
        const urlStart = Date.now();

        try {
          console.log(`  → Scraping: ${url.slice(0, 80)}...`);
          const result = await scrapeAndSaveScholarship(url);

          results.push({
            url,
            source: source.name,
            status: 'SUCCESS',
            title: result.extracted.title,
            durationMs: Date.now() - urlStart,
          });

          console.log(`    ✅ ${result.extracted.title} (${Date.now() - urlStart}ms)`);
        } catch (err: any) {
          const errorMsg = err?.message || 'Unknown error';
          const isExpected =
            errorMsg.includes('SCRAPE_FAILED') || errorMsg.includes('EXTRACTION_FAILED');

          results.push({
            url,
            source: source.name,
            status: 'FAILED',
            error: errorMsg.slice(0, 200),
            durationMs: Date.now() - urlStart,
          });

          console.log(
            `    ❌ ${isExpected ? errorMsg.slice(0, 80) : 'Unexpected: ' + errorMsg.slice(0, 80)}`
          );
        }

        await sleep(3000);
      }
    } catch (err: any) {
      results.push({
        url: source.url,
        source: source.name,
        status: 'FAILED',
        error: `Source-level failure: ${err?.message?.slice(0, 200)}`,
        durationMs: 0,
      });

      console.log(`  ❌ Source failed: ${err?.message?.slice(0, 80)}`);
    }

    await sleep(2000);
  }

  const finishedAt = new Date();
  const report: AutoScrapeReport = {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationSeconds: Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000),
    sourcesProcessed,
    totalUrlsAttempted: results.length,
    succeeded: results.filter((r) => r.status === 'SUCCESS').length,
    failed: results.filter((r) => r.status === 'FAILED').length,
    skipped: results.filter((r) => r.status === 'SKIPPED').length,
    results,
  };

  console.log(`\n📊 Auto-scraper finished in ${report.durationSeconds}s`);
  console.log(
    `   ✅ ${report.succeeded} succeeded | ❌ ${report.failed} failed | ⏭️ ${report.skipped} skipped\n`
  );

  return report;
}
