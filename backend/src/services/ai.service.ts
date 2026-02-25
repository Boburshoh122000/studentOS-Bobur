import OpenAI from 'openai';
import { env } from '../config/env.js';

// ── OpenAI Initialization ────────────────────────────────────────────────────
const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

if (!openai) {
  console.warn('⚠️  No AI provider configured. Set OPENAI_API_KEY in environment.');
}

// ── Unified AI caller (OpenAI only) ──────────────────────────────────────────
interface CallAIOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean; // Force JSON output via response_format
}

const callAI = async (prompt: string, opts: CallAIOptions = {}): Promise<string> => {
  const { temperature = 0.3, maxTokens = 4096, jsonMode = false } = opts;

  if (!openai) {
    throw new Error('AI_CONFIG_ERROR: No AI provider configured. Set OPENAI_API_KEY.');
  }

  const messages: { role: 'system' | 'user'; content: string }[] = [];

  if (jsonMode) {
    messages.push({
      role: 'system',
      content:
        'You are a helpful assistant. Always respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.',
    });
  }

  messages.push({ role: 'user', content: prompt });

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages,
    temperature,
    max_completion_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  });

  return completion.choices[0]?.message?.content || '';
};

const cleanJSON = (raw: string): string => {
  // Strip markdown code fences
  let cleaned = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // Extract the JSON object/array between first { or [ and last } or ]
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');
  const objEnd = cleaned.lastIndexOf('}');
  const arrEnd = cleaned.lastIndexOf(']');

  if (objStart !== -1 && objEnd > objStart) {
    // Prefer object if it starts before array
    if (arrStart === -1 || objStart <= arrStart) {
      return cleaned.substring(objStart, objEnd + 1);
    }
  }
  if (arrStart !== -1 && arrEnd > arrStart) {
    return cleaned.substring(arrStart, arrEnd + 1);
  }

  return cleaned;
};

// ── Error handler ────────────────────────────────────────────────────────────
const handleAIError = (error: any): never => {
  const msg = error?.message || '';
  const status = error?.status || error?.statusCode || 0;

  // Rate limits
  if (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate_limit') ||
    msg.includes('insufficient_quota')
  ) {
    throw new Error(
      'AI_RATE_LIMIT: You have exceeded the AI request limit. Please wait a moment and try again.'
    );
  }
  // Auth / permission errors
  if (
    status === 401 ||
    status === 403 ||
    msg.includes('API key') ||
    msg.includes('Incorrect API key') ||
    msg.includes('does not have access')
  ) {
    throw new Error(
      'AI_CONFIG_ERROR: AI service is not properly configured. Please contact support.'
    );
  }
  // Content policy
  if (msg.includes('content_policy') || msg.includes('blocked')) {
    throw new Error(
      'AI_SAFETY_BLOCK: The content was blocked by safety filters. Please try again with different content.'
    );
  }
  throw error;
};

// ── Exported AI Functions ────────────────────────────────────────────────────

export const analyzeCV = async (
  cvText: string,
  jobDescription?: string
): Promise<{
  score: number;
  missing_keywords: string[];
  weaknesses: string[];
  actionable_fixes: string[];
  feedback?: string[];
  suggestions?: string[];
  keywords?: { found: string[]; missing: string[] };
}> => {
  try {
    const sanitizedCV = cvText
      .replace(/[^\w\s@.,\-():/+#&'"\\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const prompt = `You are a professional career advisor and ATS (Applicant Tracking System) expert.

TASK: Analyze the following professional resume/CV document for ATS compatibility and provide improvement suggestions.

${jobDescription ? `TARGET JOB: ${jobDescription}` : 'Provide general job market analysis.'}

---BEGIN RESUME---
${sanitizedCV}
---END RESUME---

Respond with a JSON object containing:
{
  "score": <number 0-100>,
  "missing_keywords": ["keyword1", "keyword2"],
  "weaknesses": ["weakness1", "weakness2"],
  "actionable_fixes": ["fix1", "fix2"]
}

Return ONLY valid JSON. No markdown formatting.`;

    const responseText = await callAI(prompt, {
      temperature: 0.3,
      maxTokens: 2048,
      jsonMode: true,
    });

    try {
      const parsed = JSON.parse(cleanJSON(responseText));
      return {
        score: parsed.score ?? 50,
        missing_keywords: parsed.missing_keywords ?? [],
        weaknesses: parsed.weaknesses ?? [],
        actionable_fixes: parsed.actionable_fixes ?? [],
        feedback: parsed.weaknesses ?? [],
        suggestions: parsed.actionable_fixes ?? [],
        keywords: { found: [], missing: parsed.missing_keywords ?? [] },
      };
    } catch {
      console.error('Failed to parse CV analysis response:', responseText.slice(0, 200));
      return {
        score: 50,
        missing_keywords: [],
        weaknesses: ['Unable to parse AI response'],
        actionable_fixes: ['Please try again with a clearer CV format'],
        feedback: ['Unable to parse AI response'],
        suggestions: ['Please try again'],
        keywords: { found: [], missing: [] },
      };
    }
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateCoverLetter = async (
  jobTitle: string,
  company: string,
  jobDescription: string,
  userProfile: { name: string; skills: string[]; experience?: string }
): Promise<string> => {
  try {
    const prompt = `Write a professional cover letter for this job application:

Position: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription}

Applicant:
Name: ${userProfile.name}
Skills: ${userProfile.skills.join(', ')}
${userProfile.experience ? `Experience: ${userProfile.experience}` : ''}

Write a compelling, personalized cover letter that:
1. Shows enthusiasm for the role
2. Highlights relevant skills
3. Is professional but not generic
4. Is between 250-400 words

Return ONLY the cover letter text. No extra formatting.`;

    return await callAI(prompt, { temperature: 0.7, maxTokens: 2048 });
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateLearningPlan = async (
  goal: string,
  currentSkills: string[],
  duration: string = '4 weeks'
): Promise<{
  title: string;
  overview: string;
  roadmap: {
    phase: string;
    theme: string;
    tasks: { title: string; type: 'task'; duration: string; url: string }[];
    resources: {
      videos: { title: string; url: string }[];
      articles: { title: string; url: string }[];
    };
  }[];
}> => {
  try {
    const skillsContext = currentSkills.length
      ? `\nThe learner already has experience with: ${currentSkills.join(', ')}. Tailor the plan so it skips basics they already know and focuses on growth areas.`
      : '';

    const prompt = `You are an elite Educational Curriculum Architect with 15+ years of experience designing world-class learning programs.

The user will provide a learning topic or a specific personal goal. Your task is to analyze their intent and create a highly structured, actionable learning roadmap with REAL, CLICKABLE resource links.

USER INPUT: "${goal}"
DURATION: ${duration}${skillsContext}

═══════════════════════════════════════════════
RULE 1 — COMPREHENSION & SYNTHESIS (CRITICAL):
═══════════════════════════════════════════════
DO NOT ever copy-paste the user's raw input text into titles, phase names, or themes.
You must ANALYZE and SYNTHESIZE the user's intent into clean, professional language.

EXAMPLES:
- User says "I have already IELTS 6.0 and i neednt basic info it so give me 7.0+ plan"
  → Title: "Advanced IELTS 7.0+ Preparation Roadmap"
  → Phase theme: "Mastering Task 2 Essay Structures for Band 7+"
  → WRONG: "Mastering I have already IELTS 6.0 and i neednt basic info..."

- User says "i wanna learn react but already know html css js"
  → Title: "React Development Mastery Plan"
  → Phase theme: "Component Architecture & JSX Fundamentals"
  → WRONG: "Mastering i wanna learn react..."

═══════════════════════════════════════════════
RULE 2 — NO GENERIC TEMPLATES:
═══════════════════════════════════════════════
NEVER use lazy, generic phase titles like:
- "[Topic] Core Concepts" / "[Topic] in Action" / "Getting Started with [Topic]" / "Advanced [Topic]"
Instead, write HIGHLY SPECIFIC, level-appropriate titles relevant to the user's actual goal.

═══════════════════════════════════════════════
RULE 3 — DURATION MAPPING (STRICT):
═══════════════════════════════════════════════
Map "${duration}" to phases EXACTLY:
- "1 week" = 1 phase | "2 weeks" = 2 phases | "3 weeks" = 3 phases
- "4 weeks" = 4 phases | "2 months" = 8 phases | "3 months" = 12 phases
Each phase = 1 week. Label each phase "Week N".

═══════════════════════════════════════════════
RULE 4 — MANDATORY CLICKABLE URLS (ZERO EXCEPTIONS):
═══════════════════════════════════════════════
EVERY task, video, and article MUST have a "url" field. No exceptions. NEVER leave url empty or null.
ANTI-HALLUCINATION: Do NOT invent fake YouTube video IDs or fabricate URLs.

Strategy:
a) If you know the EXACT permanent URL (freeCodeCamp, CS50, MDN, official docs), use it directly.
b) Otherwise, construct a GUARANTEED SEARCH URL:
   - Videos: https://www.youtube.com/results?search_query=best+<specific+subtopic>+tutorial+<channel+if+known>
   - Articles: https://www.google.com/search?q=comprehensive+guide+<specific+subtopic>+<source+if+known>
   - Tasks: https://www.google.com/search?q=step+by+step+<specific+task>+tutorial
c) Make queries HYPER-SPECIFIC with known channel/source names (Traversy Media, freeCodeCamp, Fireship, TED-Ed, MDN, W3Schools).

═══════════════════════════════════════════════
RULE 5 — CONTENT QUALITY:
═══════════════════════════════════════════════
- Each phase MUST have 3-5 tasks and at least 2 videos + 2 articles.
- Progressive plan: foundations → core skills → practice → advanced techniques & portfolio.
- Tasks must be concrete (e.g., "Write a Band 7 Task 2 essay on technology" NOT "Practice writing").
- Skip basics if the user indicates prior knowledge. Tailor to their stated level.

═══════════════════════════════════════════════

Return a JSON object with this EXACT structure:
{
  "title": "A clean, synthesized, professional title (NOT the user's raw text)",
  "overview": "A short, encouraging 1-2 sentence summary of what the learner will achieve.",
  "roadmap": [
    {
      "phase": "Week 1",
      "theme": "A specific, descriptive theme (NOT generic)",
      "tasks": [
        {
          "title": "Specific actionable task",
          "type": "task",
          "duration": "15 min",
          "url": "https://www.google.com/search?q=specific+task+tutorial"
        }
      ],
      "resources": {
        "videos": [
          {
            "title": "Specific video title (Channel Name)",
            "url": "https://www.youtube.com/results?search_query=specific+topic+tutorial"
          }
        ],
        "articles": [
          {
            "title": "Article title (Source Name)",
            "url": "https://www.google.com/search?q=specific+topic+guide"
          }
        ]
      }
    }
  ]
}

Respond ONLY with valid JSON. No markdown, no code fences, no explanation outside the JSON.`;

    const response = await callAI(prompt, { temperature: 0.5, maxTokens: 8192, jsonMode: true });

    try {
      return JSON.parse(cleanJSON(response));
    } catch {
      console.error('Failed to parse learning plan response:', response.slice(0, 200));
      return { title: goal, overview: '', roadmap: [] };
    }
  } catch (error) {
    return handleAIError(error);
  }
};

export const checkPlagiarism = async (
  text: string
): Promise<{
  originalityScore: number;
  aiScore: number;
  citationQuality: string;
  readabilityLevel: string;
  sourcesFound: number;
  isOriginal: boolean;
  summary: string;
  matchedSources: string[];
}> => {
  try {
    const prompt = `You are an advanced plagiarism and AI-content detection tool. Analyze the following text thoroughly.

TEXT TO ANALYZE:
"""
${text}
"""

Evaluate the text for:
1. Originality — how likely the text is original vs copied from known sources
2. AI-generated content probability — how likely this was written by an AI
3. Citation quality — whether the text includes proper citations/references
4. Readability level — the academic/reading level of the text
5. Potential source matches — common sources this text may originate from

You MUST respond with strictly valid JSON matching this exact structure:
{
  "originalityScore": <number 0-100, where 100 is fully original>,
  "aiScore": <number 0-100, probability the text is AI-generated>,
  "citationQuality": <"Good" | "Average" | "Poor" | "None">,
  "readabilityLevel": <"Elementary" | "Middle School" | "High School" | "College" | "Graduate" | "Professional">,
  "sourcesFound": <number of potential source matches found>,
  "isOriginal": <true if originalityScore >= 70, false otherwise>,
  "summary": "<brief 1-2 sentence explanation of findings>",
  "matchedSources": ["<source name 1>", "<source name 2>"]
}

Respond ONLY with valid JSON, no markdown.`;

    const response = await callAI(prompt, { temperature: 0.3, maxTokens: 2048, jsonMode: true });

    try {
      const parsed = JSON.parse(cleanJSON(response));
      return {
        originalityScore: parsed.originalityScore ?? 50,
        aiScore: parsed.aiScore ?? 0,
        citationQuality: parsed.citationQuality ?? 'None',
        readabilityLevel: parsed.readabilityLevel ?? 'College',
        sourcesFound: parsed.sourcesFound ?? 0,
        isOriginal: parsed.isOriginal ?? (parsed.originalityScore ?? 50) >= 70,
        summary: parsed.summary ?? 'Analysis complete.',
        matchedSources: parsed.matchedSources ?? [],
      };
    } catch {
      console.error('Failed to parse plagiarism response:', response.slice(0, 200));
      return {
        originalityScore: 50,
        aiScore: 0,
        citationQuality: 'None',
        readabilityLevel: 'College',
        sourcesFound: 0,
        isOriginal: false,
        summary: 'Unable to fully analyze the text. Please try again.',
        matchedSources: [],
      };
    }
  } catch (error) {
    return handleAIError(error);
  }
};

export const generatePresentationContent = async (
  topic: string,
  slideCount: number = 5,
  style: string = 'professional'
): Promise<{
  title: string;
  author: string;
  slides: { slideNumber: number; title: string; bulletPoints: string[]; notes?: string }[];
  theme: { primaryColor: string; accentColor: string };
}> => {
  try {
    const prompt = `Create a presentation outline for this topic:

Topic: ${topic}
Number of slides: ${slideCount}
Style: ${style}

Provide a JSON response with:
1. "title": Presentation title
2. "author": Leave as ""
3. "slides": Array of slides, each with:
   - "slideNumber": number
   - "title": slide title
   - "bulletPoints": array of 3-5 key points
   - "notes": speaker notes (optional)
4. "theme": Object with "primaryColor" (hex) and "accentColor" (hex) appropriate for the style

Make the content engaging, informative, and well-structured for ${style} presentation.

Respond ONLY with valid JSON, no markdown.`;

    const response = await callAI(prompt, { temperature: 0.5, maxTokens: 4096, jsonMode: true });

    try {
      return JSON.parse(cleanJSON(response));
    } catch {
      console.error('Failed to parse presentation response:', response.slice(0, 200));
      return {
        title: topic,
        author: '',
        slides: [{ slideNumber: 1, title: topic, bulletPoints: ['Unable to generate content'] }],
        theme: { primaryColor: '#4F46E5', accentColor: '#7C3AED' },
      };
    }
  } catch (error) {
    return handleAIError(error);
  }
};

/**
 * Extract text from a file buffer (PDF or DOCX).
 * Returns the raw text string.
 */
export const extractTextFromFile = async (buffer: Buffer, mimeType: string): Promise<string> => {
  // ── DOCX extraction via mammoth ──
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/docx'
  ) {
    try {
      const mammothModule = await import('mammoth');
      const mammoth = (mammothModule as any).default || mammothModule;
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim();

      if (!text || text.length < 10) {
        throw new Error(
          'AI_SAFETY_BLOCK: Could not extract text from this DOCX file. Please try pasting the text directly.'
        );
      }
      return text;
    } catch (error: any) {
      if (error?.message?.includes('AI_')) throw error;
      console.error('mammoth extraction failed:', error.message);
      throw new Error(
        'AI_CONFIG_ERROR: Failed to extract text from DOCX. Please try pasting the text directly.'
      );
    }
  }

  // ── PDF extraction via pdf-parse ──
  // Import from lib/pdf-parse.js directly to avoid the test-file loading bug in index.js
  try {
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const pdfData = await pdfParse(buffer);

    if (!pdfData.text || pdfData.text.trim().length < 10) {
      throw new Error(
        'AI_SAFETY_BLOCK: Could not extract text from this PDF. The file may be image-based. Please try pasting the text directly.'
      );
    }

    return pdfData.text;
  } catch (error: any) {
    if (error?.message?.includes('AI_')) throw error;
    console.error('pdf-parse extraction failed:', error.message);
    throw new Error(
      'AI_CONFIG_ERROR: Failed to extract text from PDF. Please try pasting the text directly.'
    );
  }
};

// Backward-compatible alias
export const extractTextFromPDF = async (base64Content: string): Promise<string> =>
  extractTextFromFile(Buffer.from(base64Content, 'base64'), 'application/pdf');
