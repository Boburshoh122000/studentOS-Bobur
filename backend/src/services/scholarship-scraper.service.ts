/**
 * Scholarship Scraper Service
 *
 * Fetches a scholarship webpage, extracts raw text via Cheerio,
 * then uses OpenAI (JSON mode) to extract structured scholarship data.
 * Saves the result into the database with PENDING status for admin review.
 */

import * as cheerio from 'cheerio';
import prisma from '../config/database.js';

// We reuse the same callAI + cleanJSON helpers from ai.service
import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

/* ── Step 1: Fetch & Extract Text ─────────────────────────────────────────── */

export async function scrapePageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15_000), // 15s timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, noscript, nav, footer, iframe, svg, img, link, meta').remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
  $('header').remove();

  // Extract clean text from the body
  const rawText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Cap at ~8000 chars to stay within token limits
  return rawText.slice(0, 8000);
}

/* ── Step 2: AI Data Extraction ───────────────────────────────────────────── */

interface ScrapedScholarshipData {
  title: string;
  institution: string;
  country: string;
  studyLevel: string;
  awardType: string;
  awardAmount: string | null;
  deadline: string | null;
  description: string | null;
  applicationUrl: string | null;
}

export async function extractScholarshipData(
  rawText: string,
  sourceUrl: string
): Promise<ScrapedScholarshipData> {
  if (!openai) {
    throw new Error('AI_CONFIG_ERROR: No AI provider configured. Set OPENAI_API_KEY.');
  }

  const prompt = `You are a scholarship data extraction specialist.

Given the raw text scraped from a scholarship webpage, extract the following fields into a JSON object.
Be precise and use the exact data from the text. If a field is not found, use null.

REQUIRED JSON SCHEMA:
{
  "title": "Full scholarship name (e.g., 'Japanese Government MEXT Scholarship 2025')",
  "institution": "University or organization offering it (e.g., 'MEXT Japan', 'University of Cambridge')",
  "country": "Country where the scholarship is offered (e.g., 'Japan', 'USA', 'UK')",
  "studyLevel": "One of: UNDERGRADUATE, POSTGRADUATE, PHD, ANY",
  "awardType": "One of: Full Scholarship, Full Tuition, Partial, Stipend, Grant, Fellowship",
  "awardAmount": "Dollar amount or description (e.g., '$50,000', 'Full tuition + living allowance', '¥117,000/month + tuition'). Use null if not specified.",
  "deadline": "ISO date string YYYY-MM-DD if found, otherwise null",
  "description": "A 1-2 sentence summary of the scholarship (max 200 chars)",
  "applicationUrl": "Direct application link if found in the text, otherwise null"
}

RULES:
- Return ONLY the JSON object, no explanation.
- For studyLevel, map terms like "Master's", "Graduate" → POSTGRADUATE; "Bachelor's" → UNDERGRADUATE; "Doctoral" → PHD.
- For awardType, if the scholarship covers tuition + living expenses, use "Full Scholarship".
- If the page mentions multiple scholarships, extract only the PRIMARY/MAIN one.
- The source URL is: ${sourceUrl}

RAW PAGE TEXT:
${rawText}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Always respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_completion_tokens: 1024,
    response_format: { type: 'json_object' as const },
  });

  const raw = completion.choices[0]?.message?.content || '{}';

  // Clean any markdown fences that might slip through
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    title: parsed.title || 'Untitled Scholarship',
    institution: parsed.institution || 'Unknown',
    country: parsed.country || 'Unknown',
    studyLevel: parsed.studyLevel || 'ANY',
    awardType: parsed.awardType || 'Full Scholarship',
    awardAmount: parsed.awardAmount || null,
    deadline: parsed.deadline || null,
    description: parsed.description || null,
    applicationUrl: parsed.applicationUrl || sourceUrl,
  };
}

/* ── Step 3: Save to Database ─────────────────────────────────────────────── */

export async function saveScrapedScholarship(data: ScrapedScholarshipData): Promise<any> {
  // Check for duplicates by title (case-insensitive)
  const existing = await prisma.scholarship.findFirst({
    where: {
      title: { equals: data.title, mode: 'insensitive' },
    },
  });

  if (existing) {
    // Update the existing record
    return prisma.scholarship.update({
      where: { id: existing.id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: 'PENDING', // Re-mark for admin review after update
      },
    });
  }

  // Create new scholarship with PENDING status
  return prisma.scholarship.create({
    data: {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : null,
      isActive: true,
      status: 'PENDING',
    },
  });
}

/* ── Full Pipeline ────────────────────────────────────────────────────────── */

export async function scrapeAndSaveScholarship(url: string) {
  // Step 1: Scrape the page
  const rawText = await scrapePageText(url);

  if (rawText.length < 50) {
    throw new Error(
      'Page content is too short — the URL may be invalid, require authentication, or use heavy JavaScript rendering.'
    );
  }

  // Step 2: Extract structured data via AI
  const scholarshipData = await extractScholarshipData(rawText, url);

  // Step 3: Save to database
  const saved = await saveScrapedScholarship(scholarshipData);

  return {
    extracted: scholarshipData,
    saved,
    sourceUrl: url,
    textLength: rawText.length,
  };
}
