import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env.js';

// ── Provider Initialization ──────────────────────────────────────────────────
const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

const AI_PROVIDER = genAI ? 'gemini' : openai ? 'openai' : null;

if (!AI_PROVIDER) {
  console.warn(
    '⚠️  No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY in environment.'
  );
}

// Safety settings to allow CV/Resume content (which contains PII)
// This prevents false positives on names, addresses, phone numbers
const cvSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// ── Unified AI caller ────────────────────────────────────────────────────────
interface CallAIOptions {
  temperature?: number;
  maxTokens?: number;
  useCVSafety?: boolean;
  jsonMode?: boolean; // Force JSON output (uses response_format for OpenAI)
}

const callAI = async (prompt: string, opts: CallAIOptions = {}): Promise<string> => {
  const { temperature = 0.3, maxTokens = 4096, useCVSafety = false, jsonMode = false } = opts;

  if (genAI) {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      ...(useCVSafety ? { safetySettings: cvSafetySettings } : {}),
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    });
    const result = await model.generateContent(prompt);
    const response = result.response;
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('AI_SAFETY_BLOCK: Content was blocked by safety filters.');
    }
    return response.text();
  }

  if (openai) {
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
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    });
    return completion.choices[0]?.message?.content || '';
  }

  throw new Error(
    'AI_CONFIG_ERROR: No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.'
  );
};

// ── Utility: clean JSON from AI response ─────────────────────────────────────
const cleanJSON = (raw: string): string =>
  raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

// Helper to handle AI errors with user-friendly messages
const handleAIError = (error: any): never => {
  const msg = error?.message || '';
  const status = error?.status || error?.statusCode || 0;

  // Rate limits (both Gemini and OpenAI)
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
  // Safety blocks
  if (msg.includes('SAFETY') || msg.includes('blocked') || msg.includes('content_policy')) {
    throw new Error(
      'AI_SAFETY_BLOCK: The content was blocked by safety filters. Please try again with different content.'
    );
  }
  throw error;
};

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
      .replace(/[^\w\s@.,\-():/+#&'"\n]/g, ' ')
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
      useCVSafety: true,
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
4. Is approximately 300-400 words`;

    return await callAI(prompt, { temperature: 0.7, maxTokens: 2048 });
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateLearningPlan = async (
  goal: string,
  currentSkills: string[],
  timeframe: string
): Promise<{
  title: string;
  weeks: { week: number; topics: string[]; resources: string[] }[];
  milestones: string[];
}> => {
  try {
    const prompt = `Create a personalized learning plan:

Goal: ${goal}
Current Skills: ${currentSkills.join(', ')}
Timeframe: ${timeframe}

Provide a JSON response with:
1. "title": A title for the learning plan
2. "weeks": Array of weekly plans with "week" number, "topics" array, and "resources" array (links or book names)
3. "milestones": Key milestones to achieve

Respond ONLY with valid JSON, no markdown.`;

    const response = await callAI(prompt, { temperature: 0.5, maxTokens: 4096, jsonMode: true });

    try {
      return JSON.parse(cleanJSON(response));
    } catch {
      console.error('Failed to parse learning plan response:', response.slice(0, 200));
      return { title: 'Learning Plan', weeks: [], milestones: [] };
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

export const extractTextFromPDF = async (base64Content: string): Promise<string> => {
  // PDF extraction requires Gemini's inline data capability
  if (!genAI) {
    throw new Error('AI_CONFIG_ERROR: PDF extraction requires Gemini API key. Set GEMINI_API_KEY.');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings: cvSafetySettings,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Content,
        },
      },
      'TASK: Extract all text content from this professional resume/CV PDF document. Return only the plain text content, preserving the structure and sections. This is a standard job application document.',
    ]);

    const response = result.response;

    if (!response.candidates || response.candidates.length === 0) {
      console.error('PDF extraction blocked by content filter');
      throw new Error(
        'AI_SAFETY_BLOCK: Could not process this PDF. Please try pasting the text directly.'
      );
    }

    return response.text();
  } catch (error: any) {
    if (error?.message?.includes('AI_')) {
      throw error;
    }
    return handleAIError(error);
  }
};
