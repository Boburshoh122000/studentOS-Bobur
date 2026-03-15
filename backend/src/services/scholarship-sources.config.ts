/**
 * Scholarship Sources Registry
 *
 * Each source defines:
 * - name: human-readable label (for logs + admin panel)
 * - type: LISTING (aggregator page with many links) or DETAIL (single scholarship page)
 * - url: the page to scrape
 * - linkSelector: CSS selector to find scholarship detail links (LISTING only)
 * - baseUrl: prepend to relative links (LISTING only)
 * - maxLinks: cap how many detail pages to follow per listing (prevent runaway)
 * - enabled: toggle without removing
 *
 * HOW IT WORKS:
 * ─────────────
 * LISTING source → scrape page → extract links via linkSelector → scrape each link as DETAIL
 * DETAIL source  → scrape page directly → extract scholarship data
 *
 * ADD NEW SOURCES:
 * ────────────────
 * 1. Visit the site, find the scholarship listing page URL
 * 2. Inspect the page, find the CSS selector for scholarship detail links
 * 3. Add entry below with type: 'LISTING'
 * 4. Test with: POST /api/admin/scholarships/scrape-test { sourceIndex: N }
 */

export interface ScholarshipSource {
  name: string;
  type: 'LISTING' | 'DETAIL';
  url: string;
  linkSelector?: string;
  baseUrl?: string;
  maxLinks?: number;
  enabled: boolean;
}

export const SCHOLARSHIP_SOURCES: ScholarshipSource[] = [
  {
    name: 'Scholars4Dev — Latest',
    type: 'LISTING',
    url: 'https://www.scholars4dev.com/category/scholarships/',
    linkSelector: 'h2.entry-title a, h3.entry-title a, .post-title a',
    baseUrl: 'https://www.scholars4dev.com',
    maxLinks: 15,
    enabled: true,
  },
  {
    name: 'Opportunity Desk — Scholarships',
    type: 'LISTING',
    url: 'https://opportunitydesk.org/category/opportunities/scholarships/',
    linkSelector: '.td-module-title a, h3.entry-title a',
    baseUrl: 'https://opportunitydesk.org',
    maxLinks: 15,
    enabled: true,
  },
  {
    name: 'Scholarship Positions — Latest',
    type: 'LISTING',
    url: 'https://scholarship-positions.com/',
    linkSelector: '.entry-title a, h2 a[href*="scholarship"]',
    baseUrl: 'https://scholarship-positions.com',
    maxLinks: 15,
    enabled: true,
  },
  {
    name: 'StudyIn — Scholarships',
    type: 'LISTING',
    url: 'https://www.studyin.org/scholarships',
    linkSelector: 'a[href*="/scholarship"]',
    baseUrl: 'https://www.studyin.org',
    maxLinks: 10,
    enabled: true,
  },
  {
    name: 'DAAD — Scholarships for Foreigners',
    type: 'LISTING',
    url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    linkSelector: 'a[href*="scholarship"]',
    baseUrl: 'https://www.daad.de',
    maxLinks: 10,
    enabled: true,
  },
  {
    name: 'Chevening — UK Government Scholarships',
    type: 'DETAIL',
    url: 'https://www.chevening.org/scholarships/',
    enabled: true,
  },
  {
    name: 'StudyInKorea — KGSP',
    type: 'DETAIL',
    url: 'https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do',
    enabled: true,
  },
  {
    name: 'CSC China — Government Scholarship',
    type: 'DETAIL',
    url: 'https://www.campuschina.org/scholarships/index.html',
    enabled: true,
  },
  {
    name: 'After.uz — Scholarships',
    type: 'LISTING',
    url: 'https://after.uz/category/granty/',
    linkSelector: '.entry-title a, h2 a, .post-title a',
    baseUrl: 'https://after.uz',
    maxLinks: 10,
    enabled: true,
  },
  {
    name: 'StudyInEurope — Scholarships',
    type: 'LISTING',
    url: 'https://www.studyineurope.eu/scholarships',
    linkSelector: 'a[href*="scholarship"]',
    baseUrl: 'https://www.studyineurope.eu',
    maxLinks: 10,
    enabled: true,
  },
  {
    name: 'Study-in-Turkey — Turkiye Burslari',
    type: 'DETAIL',
    url: 'https://www.turkiyeburslari.gov.tr/',
    enabled: true,
  },
  {
    name: 'Fulbright — Foreign Students',
    type: 'DETAIL',
    url: 'https://foreign.fulbrightonline.org/',
    enabled: true,
  },
];
