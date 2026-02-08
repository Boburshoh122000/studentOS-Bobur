import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

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

// Helper to handle Gemini API errors with user-friendly messages
const handleGeminiError = (error: any): never => {
  if (
    error?.status === 429 ||
    error?.message?.includes('429') ||
    error?.message?.includes('quota')
  ) {
    throw new Error(
      'AI_RATE_LIMIT: You have exceeded the AI request limit. Please wait a moment and try again.'
    );
  }
  if (error?.message?.includes('API key')) {
    throw new Error(
      'AI_CONFIG_ERROR: AI service is not properly configured. Please contact support.'
    );
  }
  if (error?.message?.includes('SAFETY') || error?.message?.includes('blocked')) {
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
  // Keep legacy fields for backward compatibility
  feedback?: string[];
  suggestions?: string[];
  keywords?: { found: string[]; missing: string[] };
}> => {
  if (!genAI) {
    throw new Error('AI_CONFIG_ERROR: Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: cvSafetySettings,
    });

    const prompt = `Act as an expert Recruiter and ATS (Applicant Tracking System) algorithm. Analyze the following resume thoroughly.
${jobDescription ? `Compare against this job description: ${jobDescription}` : 'Analyze for general job market compatibility.'}

Resume/CV Content:
${cvText}

Provide a strict JSON response with the following structure:
{
  "score": <number 0-100 representing ATS compatibility>,
  "missing_keywords": ["keyword1", "keyword2", ...],
  "weaknesses": ["point 1", "point 2", ...],
  "actionable_fixes": ["tip 1", "tip 2", ...]
}

Be thorough and specific. Return ONLY valid JSON, no markdown, no code blocks.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      // Clean response of any markdown formatting
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const parsed = JSON.parse(cleanedResponse);

      // Ensure all required fields exist
      return {
        score: parsed.score ?? 50,
        missing_keywords: parsed.missing_keywords ?? [],
        weaknesses: parsed.weaknesses ?? [],
        actionable_fixes: parsed.actionable_fixes ?? [],
        // Legacy compatibility
        feedback: parsed.weaknesses ?? [],
        suggestions: parsed.actionable_fixes ?? [],
        keywords: { found: [], missing: parsed.missing_keywords ?? [] },
      };
    } catch {
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
    return handleGeminiError(error);
  }
};

export const generateCoverLetter = async (
  jobTitle: string,
  company: string,
  jobDescription: string,
  userProfile: { name: string; skills: string[]; experience?: string }
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

  const result = await model.generateContent(prompt);
  return result.response.text();
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
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Create a personalized learning plan:

Goal: ${goal}
Current Skills: ${currentSkills.join(', ')}
Timeframe: ${timeframe}

Provide a JSON response with:
1. "title": A title for the learning plan
2. "weeks": Array of weekly plans with "week" number, "topics" array, and "resources" array (links or book names)
3. "milestones": Key milestones to achieve

Respond ONLY with valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    return JSON.parse(response);
  } catch {
    return {
      title: 'Learning Plan',
      weeks: [],
      milestones: [],
    };
  }
};

export const checkPlagiarism = async (
  text: string
): Promise<{
  score: number;
  analysis: string;
  suggestions: string[];
}> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this text for potential plagiarism indicators and writing quality:

"${text}"

Note: This is not a full plagiarism check against a database, but an analysis of writing patterns.

Provide a JSON response with:
1. "score": Originality score from 0-100 (100 being fully original)
2. "analysis": Brief analysis of the writing style and potential concerns
3. "suggestions": Array of suggestions to improve originality

Respond ONLY with valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    return JSON.parse(response);
  } catch {
    return {
      score: 50,
      analysis: 'Unable to analyze',
      suggestions: [],
    };
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
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    return JSON.parse(response);
  } catch {
    return {
      title: topic,
      author: '',
      slides: [{ slideNumber: 1, title: topic, bulletPoints: ['Unable to generate content'] }],
      theme: { primaryColor: '#4F46E5', accentColor: '#7C3AED' },
    };
  }
};

export const extractTextFromPDF = async (base64Content: string): Promise<string> => {
  if (!genAI) {
    throw new Error('AI_CONFIG_ERROR: Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: cvSafetySettings,
    });

    // Gemini can process PDFs directly via file data
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Content,
        },
      },
      'Extract all text content from this PDF document. Return only the extracted text, preserving the structure as much as possible. This is a resume/CV document.',
    ]);

    return result.response.text();
  } catch (error) {
    return handleGeminiError(error);
  }
};
