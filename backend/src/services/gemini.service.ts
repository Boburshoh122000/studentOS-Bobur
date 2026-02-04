import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

export const analyzeCV = async (cvText: string, jobDescription?: string): Promise<{
  score: number;
  feedback: string[];
  suggestions: string[];
  keywords: { found: string[]; missing: string[] };
}> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this CV/resume for ATS (Applicant Tracking System) compatibility.
${jobDescription ? `Compare against this job description: ${jobDescription}` : ''}

CV Content:
${cvText}

Provide a JSON response with:
1. "score": ATS compatibility score from 0-100
2. "feedback": Array of specific feedback points about the CV
3. "suggestions": Array of improvement suggestions
4. "keywords": Object with "found" (good keywords present) and "missing" (important keywords to add)

Respond ONLY with valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      score: 50,
      feedback: ['Unable to parse AI response'],
      suggestions: ['Please try again'],
      keywords: { found: [], missing: [] },
    };
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

export const checkPlagiarism = async (text: string): Promise<{
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
      slides: [
        { slideNumber: 1, title: topic, bulletPoints: ['Unable to generate content'] }
      ],
      theme: { primaryColor: '#4F46E5', accentColor: '#7C3AED' },
    };
  }
};

export const extractTextFromPDF = async (base64Content: string): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Gemini can process PDFs directly via file data
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Content,
      },
    },
    'Extract all text content from this PDF document. Return only the extracted text, preserving the structure as much as possible.',
  ]);

  return result.response.text();
};
