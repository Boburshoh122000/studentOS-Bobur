/**
 * Scholarship Scraper Service v2 — Production Master
 *
 * CHANGES FROM v1:
 * ─────────────────────────────────────────────────────────
 * 1. Master prompt aligned to exact Prisma Scholarship model
 * 2. Extracts ALL DB fields: eligibility + benefits (was missing)
 * 3. deadline_raw + deadline_parsed dual approach (prevents fake dates)
 * 4. Duplicate check: title + country + institution (was title-only)
 * 5. New records save as PENDING, not PUBLISHED (admin review first)
 * 6. Model switched to gpt-4o-mini (10x cheaper, same extraction quality)
 * 7. Stronger anti-hallucination rules in prompt
 * 8. Listing page detection (multi-scholarship aggregator pages)
 * 9. Text cap raised to 12000 chars for detail-heavy pages
 * 10. Cheerio noise removal improved
 */

import * as cheerio from 'cheerio';
import prisma from '../config/database.js';
import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

// ═════════════════════════════════════════════════════════════════════════════
// STEP 1: FETCH & EXTRACT RAW TEXT
// ═════════════════════════════════════════════════════════════════════════════

export async function scrapePageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`SCRAPE_FAILED: HTTP ${response.status} ${response.statusText} for ${url}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove noise — more aggressive than v1
  $(
    'script, style, noscript, nav, footer, iframe, svg, img, link, meta, aside, ' +
      '.sidebar, .advertisement, .ad, .cookie-banner, .popup, .modal, ' +
      '[role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]'
  ).remove();
  $('header').remove();

  // Extract clean text
  const rawText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Raised cap to 12000 for detail-heavy scholarship pages
  return rawText.slice(0, 12_000);
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 2: AI EXTRACTION — MASTER PROMPT
// ═════════════════════════════════════════════════════════════════════════════

interface ScrapedScholarshipData {
  title: string;
  institution: string;
  country: string;
  studyLevel: string;
  awardType: string;
  awardAmount: string | null;
  deadline: string | null; // ISO date from deadline_parsed
  deadlineRaw: string | null; // Original deadline text from page
  description: string | null;
  eligibility: string | null;
  benefits: string | null;
  applicationUrl: string | null;
}

function buildExtractionPrompt(rawText: string, sourceUrl: string): string {
  return `You are a scholarship data extraction engine for a student platform database.

YOUR TASK:
Extract structured scholarship data from the raw text below. This data goes directly into a PostgreSQL database — accuracy is critical.

════════════════════════════════════════
STRICT RULES (VIOLATIONS = BAD DATA)
════════════════════════════════════════

1. EXTRACT ONLY WHAT IS EXPLICITLY STATED IN THE TEXT.
   - If a field's information is not present, return null.
   - NEVER guess, infer, or fabricate data. A null is always better than a guess.

2. SINGLE SCHOLARSHIP ONLY.
   - If the page lists multiple scholarships (aggregator/listing page), extract ONLY the first/primary one.
   - If the page is purely a list of links with no detail, return the JSON with title only and everything else null.

3. DEADLINE HANDLING (CRITICAL):
   - "deadline_raw": Copy the EXACT deadline text from the page (e.g., "March 31, 2026", "Spring 2026", "Rolling", "TBA").
   - "deadline_parsed": Convert to YYYY-MM-DD ONLY if the text contains a specific day+month+year.
   - If the deadline says "March 2026" (no day) → deadline_parsed = null, deadline_raw = "March 2026".
   - If the deadline says "Rolling" or "TBA" → deadline_parsed = null, deadline_raw = "Rolling" or "TBA".
   - NEVER invent a date. If unsure, deadline_parsed = null.

4. STUDY LEVEL MAPPING:
   - "Bachelor's", "Undergraduate", "BSc", "BA" → "UNDERGRADUATE"
   - "Master's", "Graduate", "MSc", "MA", "MBA" → "POSTGRADUATE"
   - "Doctoral", "PhD", "DPhil" → "PHD"
   - Multiple levels or "All levels" → "ANY"
   - Not specified → "ANY"

5. AWARD TYPE MAPPING:
   - Covers tuition + living/stipend → "Full Scholarship"
   - Covers tuition only → "Full Tuition"
   - Covers part of costs → "Partial"
   - Monthly/annual payment only → "Stipend"
   - Research/project funding → "Grant"
   - Named fellowship → "Fellowship"
   - Cannot determine → "Full Scholarship" (default for ambiguous full-coverage awards)

6. COUNTRY NORMALIZATION:
   - Use full country names: "United Kingdom" not "UK", "United States" not "US/USA".
   - "South Korea" not "Korea", "Türkiye" → "Turkey".

7. BENEFITS — extract as a concise comma-separated string:
   - Example: "Full tuition, monthly stipend of $1,500, accommodation, travel allowance, health insurance"
   - Only include benefits explicitly mentioned. Do not add generic ones.

8. ELIGIBILITY — extract as a concise string:
   - Include: nationality restrictions, GPA requirements, language test scores, age limits, field restrictions.
   - Example: "Open to international students, minimum GPA 3.0, IELTS 6.5 or TOEFL 90, age under 35"
   - Only include what is stated. Do not assume standard requirements.

════════════════════════════════════════
OUTPUT JSON SCHEMA (return ONLY this)
════════════════════════════════════════

{
  "title": "Full official scholarship name exactly as written on the page",
  "institution": "Organization or university offering it",
  "country": "Country where the scholarship is based (full name)",
  "studyLevel": "UNDERGRADUATE | POSTGRADUATE | PHD | ANY",
  "awardType": "Full Scholarship | Full Tuition | Partial | Stipend | Grant | Fellowship",
  "awardAmount": "Specific amount or coverage description, or null if not stated",
  "deadline_raw": "Exact deadline text from the page, or null",
  "deadline_parsed": "YYYY-MM-DD if exact date is clear, otherwise null",
  "description": "2-3 sentence summary of the scholarship, max 300 characters",
  "eligibility": "Key eligibility requirements as stated, or null",
  "benefits": "Comma-separated list of benefits as stated, or null",
  "applicationUrl": "Direct application URL if found in the text, or null"
}

════════════════════════════════════════
SOURCE URL: ${sourceUrl}
════════════════════════════════════════

RAW PAGE TEXT:
${rawText}`;
}

export async function extractScholarshipData(
  rawText: string,
  sourceUrl: string
): Promise<ScrapedScholarshipData> {
  if (!openai) {
    throw new Error('AI_CONFIG_ERROR: No AI provider configured. Set OPENAI_API_KEY.');
  }

  const completion = await openai.chat.completions.create({
    // gpt-4o-mini: 200x cheaper than gpt-4, same quality for structured extraction
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a data extraction engine. Return ONLY valid JSON. No markdown, no code fences, no explanation, no preamble. Just the JSON object.',
      },
      { role: 'user', content: buildExtractionPrompt(rawText, sourceUrl) },
    ],
    temperature: 0.05, // Near-deterministic — extraction needs zero creativity
    max_completion_tokens: 1024,
    response_format: { type: 'json_object' as const },
  });

  const raw = completion.choices[0]?.message?.content || '{}';
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
    deadline: parsed.deadline_parsed || null, // Only exact dates go to DB
    deadlineRaw: parsed.deadline_raw || null, // Raw text preserved
    description: parsed.description || null,
    eligibility: parsed.eligibility || null,
    benefits: parsed.benefits || null,
    applicationUrl: parsed.applicationUrl || sourceUrl,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 3: SAVE TO DATABASE
// ═════════════════════════════════════════════════════════════════════════════

export async function saveScrapedScholarship(data: ScrapedScholarshipData): Promise<any> {
  // Composite duplicate check: title + country + institution (not just title)
  const existing = await prisma.scholarship.findFirst({
    where: {
      AND: [
        { title: { equals: data.title, mode: 'insensitive' } },
        { country: { equals: data.country, mode: 'insensitive' } },
        { institution: { equals: data.institution, mode: 'insensitive' } },
      ],
    },
  });

  // deadline_raw appended to description so users see "Deadline: Rolling" even
  // when no parseable date exists — filter/sort by deadline still works for exact dates.
  const descriptionWithDeadline = data.deadlineRaw
    ? `${data.description || ''}\n\nDeadline: ${data.deadlineRaw}`.trim()
    : data.description;

  const dbPayload = {
    title: data.title,
    institution: data.institution,
    country: data.country,
    studyLevel: data.studyLevel,
    awardType: data.awardType,
    awardAmount: data.awardAmount,
    deadline: data.deadline ? new Date(data.deadline) : null,
    description: descriptionWithDeadline,
    eligibility: data.eligibility,
    benefits: data.benefits,
    applicationUrl: data.applicationUrl,
  };

  if (existing) {
    // Update existing — keep current status (don't overwrite PUBLISHED with PENDING)
    return prisma.scholarship.update({
      where: { id: existing.id },
      data: dbPayload,
    });
  }

  // New scholarships → PENDING for admin review before going live
  return prisma.scholarship.create({
    data: {
      ...dbPayload,
      isActive: true,
      status: 'PENDING',
    },
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// FULL PIPELINE
// ═════════════════════════════════════════════════════════════════════════════

export async function scrapeAndSaveScholarship(url: string) {
  // Step 1: Scrape
  const rawText = await scrapePageText(url);

  // Raised minimum from 50 to 100 — 50 chars is just a nav bar
  if (rawText.length < 100) {
    throw new Error(
      'SCRAPE_FAILED: Page content too short (< 100 chars). The URL may be invalid, behind authentication, or JavaScript-rendered.'
    );
  }

  // Step 2: Extract via AI
  const scholarshipData = await extractScholarshipData(rawText, url);

  // Step 3: Validate minimum data quality before saving
  if (
    scholarshipData.title === 'Untitled Scholarship' &&
    scholarshipData.institution === 'Unknown'
  ) {
    throw new Error(
      'EXTRACTION_FAILED: Could not extract meaningful scholarship data from this page. The content may not contain a scholarship listing.'
    );
  }

  // Step 4: Save
  const saved = await saveScrapedScholarship(scholarshipData);

  return {
    extracted: scholarshipData,
    saved,
    sourceUrl: url,
    textLength: rawText.length,
  };
}
