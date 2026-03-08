import OpenAI from 'openai';
import { env } from '../config/env.js';
import prisma from '../config/database.js';
import { CheckModule, PlagiarismCheckStatus } from '@prisma/client';

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
  pass_ats: string;
  pass_ats_reason: string;
  score_rationale: string;
  parsing_risks: { issue: string; severity: string; reason: string }[];
  requirements: { requirement: string; score: number; evidence: string; fix_suggestion: string }[];
  gaps: string[];
  hidden_gaps: string[];
  fluff_claims: string[];
  fix_plan: {
    headlines: string[];
    summaries: string[];
    skills_to_add: string[];
    improved_bullets: { role: string; original: string; rewritten: string }[];
  };
  formatting_fixes: string[];
  // Backward-compatible fields
  missing_keywords: string[];
  weaknesses: string[];
  actionable_fixes: string[];
}> => {
  try {
    const sanitizedCV = cvText
      .replace(/[^\w\s@.,\-():/+#&'"\\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const jobContext = jobDescription
      ? `JOB DESCRIPTION:\n${jobDescription}\n`
      : 'No job description provided. Perform a general ATS readiness analysis and score based on resume quality, formatting, and overall market-readiness.\n';

    const prompt = `You are an ATS + senior recruiter hybrid. Evaluate the resume against the job description (if provided) using a real ATS pipeline: parse → normalize → entity extraction → section detection → semantic match scoring → recruiter sanity-check.

NON-NEGOTIABLE RULES:
- Do NOT do shallow keyword matching. Evaluate semantic match: seniority alignment, scope, evidence, impact, and relevance.
- Do NOT invent experience, employers, degrees, certifications, projects, or numbers.
- If the resume claims something without proof, downgrade it.
- Be strict and practical. If something is missing or weak, say it bluntly.
- Use ONLY the provided inputs. If info is missing, note it.

NORMALIZATION (do silently):
- Treat synonyms as the same skill (e.g., "stakeholder management" ≈ "cross-functional collaboration").
- Normalize titles to common market titles when possible.
- Detect seniority signals: ownership, scope, leadership, budget, systems complexity, stakeholder depth, metrics.
- Separate "tools/tech" from "skills/capabilities".

EVIDENCE RULES:
- Cite evidence from the resume for every scored requirement.
- If you cannot find support, write: "No supporting evidence found."
- If evidence is vague ("helped", "worked on", "responsible for"), treat it as weak.

${jobContext}

---BEGIN RESUME---
${sanitizedCV}
---END RESUME---

Respond with a JSON object matching this EXACT structure:
{
  "score": <number 0-100, overall fit score>,
  "pass_ats": "<Yes | Maybe | No>",
  "pass_ats_reason": "<one sentence why>",
  "score_rationale": "<one sentence overall rationale>",
  "parsing_risks": [
    { "issue": "<what breaks ATS parsing>", "severity": "<Low|Med|High>", "reason": "<why it matters>" }
  ],
  "requirements": [
    {
      "requirement": "<requirement from job description or general best practice>",
      "score": <0-3 where 0=missing, 1=weak, 2=present with evidence, 3=strong with impact>,
      "evidence": "<exact short quote from resume or 'No supporting evidence found.'>",
      "fix_suggestion": "<specific actionable fix>"
    }
  ],
  "gaps": ["<top gaps that likely cause rejection, prioritize must-have failures>"],
  "hidden_gaps": ["<implied by role but not proven: ownership, metrics, stakeholder mgmt, scale, leadership>"],
  "fluff_claims": ["<unverifiable, buzzword-only, responsibility-without-impact claims>"],
  "fix_plan": {
    "headlines": ["<2 ATS-safe headline options for the resume>"],
    "summaries": ["<2 ATS-safe professional summary options>"],
    "skills_to_add": ["<8-12 ATS-safe skills to add ONLY IF truthful>"],
    "improved_bullets": [
      {
        "role": "<which role/company>",
        "original": "<original bullet or 'N/A'>",
        "rewritten": "<Action verb + what + how + tools + measurable result + scope. Use [METRIC NEEDED] if metric is missing.>"
      }
    ]
  },
  "formatting_fixes": ["<prioritized ATS formatting fixes>"],
  "missing_keywords": ["<keywords missing from the resume>"],
  "weaknesses": ["<top weaknesses>"],
  "actionable_fixes": ["<top actionable fixes>"]
}

SCORING GUIDANCE:
- Base score = average(requirement scores) / 3 * 85
- Add up to +10 for strong responsibility alignment + clear metrics + seniority match
- Subtract up to -15 for critical parsing risks or must-have disqualifiers
- Generate 6-12 requirements. If no job description, evaluate against general best practices.
- Be strict. Most resumes should score 40-70.

Return ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.`;

    const responseText = await callAI(prompt, {
      temperature: 0.3,
      maxTokens: 8192,
      jsonMode: true,
    });

    try {
      const parsed = JSON.parse(cleanJSON(responseText));
      return {
        score: parsed.score ?? 50,
        pass_ats: parsed.pass_ats ?? 'Maybe',
        pass_ats_reason: parsed.pass_ats_reason ?? '',
        score_rationale: parsed.score_rationale ?? '',
        parsing_risks: parsed.parsing_risks ?? [],
        requirements: parsed.requirements ?? [],
        gaps: parsed.gaps ?? [],
        hidden_gaps: parsed.hidden_gaps ?? [],
        fluff_claims: parsed.fluff_claims ?? [],
        fix_plan: {
          headlines: parsed.fix_plan?.headlines ?? [],
          summaries: parsed.fix_plan?.summaries ?? [],
          skills_to_add: parsed.fix_plan?.skills_to_add ?? [],
          improved_bullets: parsed.fix_plan?.improved_bullets ?? [],
        },
        formatting_fixes: parsed.formatting_fixes ?? [],
        missing_keywords: parsed.missing_keywords ?? [],
        weaknesses: parsed.weaknesses ?? [],
        actionable_fixes: parsed.actionable_fixes ?? [],
      };
    } catch {
      console.error('Failed to parse CV analysis response:', responseText.slice(0, 200));
      return {
        score: 50,
        pass_ats: 'Maybe',
        pass_ats_reason: 'Unable to parse AI response',
        score_rationale: '',
        parsing_risks: [],
        requirements: [],
        gaps: [],
        hidden_gaps: [],
        fluff_claims: [],
        fix_plan: { headlines: [], summaries: [], skills_to_add: [], improved_bullets: [] },
        formatting_fixes: [],
        missing_keywords: [],
        weaknesses: ['Unable to parse AI response'],
        actionable_fixes: ['Please try again with a clearer CV format'],
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
  duration: string = '4 weeks',
  difficulty: string = 'intermediate'
): Promise<{
  title: string;
  overview: string;
  roadmap: {
    phase: string;
    theme: string;
    tasks: { title: string; type: 'task'; duration: string; url: string }[];
    exercises: { title: string; type: 'exercise'; duration: string; description: string }[];
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

    const difficultyContext = `\nDIFFICULTY LEVEL: ${difficulty.toUpperCase()}
- BEGINNER: Start from absolute zero. Explain concepts simply. Focus on fundamentals and building confidence.
- INTERMEDIATE: Skip basics. Focus on practical application, real projects, and industry best practices.
- ADVANCED: Assume strong foundation. Focus on edge cases, optimization, portfolio-quality projects, and interview prep.`;

    const prompt = `You are a world-class learning coach who has helped hundreds of people achieve this exact type of goal. You know the shortcuts, the pitfalls, the best resources, and the exact sequence. Your plans are so specific and actionable that the user can start tomorrow without asking a single follow-up question.

USER GOAL: "${goal}"
DURATION: ${duration}${difficultyContext}${skillsContext}

══════════════════════════════════════════════════
STEP 1 — ANALYZE THE GOAL (do this internally):
══════════════════════════════════════════════════
Before building anything, answer these silently:
1. What category? (Language exam / Coding & Tech / Academic / Creative / Certification / Business / Other)
2. What does MEASURABLE SUCCESS look like? Not "understand React" but "build a working CRUD app without documentation." Not "improve English" but "score Band 7 on all four IELTS components."
3. What is the optimal learning SEQUENCE? What must come before what? Respect prerequisite order strictly.
4. What are the top 3 reasons people FAIL at this goal? Build the plan to prevent those failures.

══════════════════════════════════════════════════
STEP 2 — TIME FEASIBILITY CHECK:
══════════════════════════════════════════════════
Assume ~2 hours/day of focused study. Calculate total hours = 2 × 7 × number_of_weeks.
Compare against these benchmarks:
- IELTS Band 5→6: 60h | 5→7: 150h | 6→8: 250h
- Python beginner to job-ready: 300h | React basics: 60h | React job-ready: 150h
- AWS Solutions Architect: 100h | GMAT 500→700: 120h
- Spanish A1→B1: 200h | Guitar beginner to 10 songs: 80h
- UI/UX fundamentals: 80h | Data Science basics: 120h | Digital Marketing: 60h

If total hours are LESS than minimum required, include an HONEST feasibility warning in the "overview" field. State the gap and suggest: increase daily hours, extend duration, or reduce scope. Never build a false plan that sets them up for failure.

══════════════════════════════════════════════════
STEP 3 — WEEKLY STRUCTURE ARC:
══════════════════════════════════════════════════
Follow this arc regardless of the goal:
- First ~15% of weeks → DIAGNOSIS & FOUNDATION: Discover exact baseline, fill critical gaps, set up tools, do a diagnostic assessment.
- Middle ~70% of weeks → PROGRESSIVE SKILL BUILDING: Each week has one clear theme. Difficulty increases gradually. Early = 60% easy / 40% medium. Middle = 30% easy / 50% medium / 20% hard. Later = 20% easy / 40% medium / 40% hard.
- Final ~15% of weeks → CONSOLIDATION & SIMULATION: Practice under real conditions. Full mock tests, complete projects, no new material — only integration.

══════════════════════════════════════════════════
STEP 4 — TASK QUALITY RULES (CRITICAL):
══════════════════════════════════════════════════
Generic tasks destroy motivation. Every task MUST answer 5 questions:
1. WHAT exactly to do? Action verb: Write, Build, Watch, Solve, Record, Analyze, Read, Complete, Practice. NEVER "Study", "Review", or "Look into."
2. HOW LONG exactly? Specific minutes: "45 min" not "about an hour."
3. WHERE exactly? A real, specific resource with a working URL.
4. HOW to do it? Step-by-step if needed: "Watch the video, pause after each section, write a 2-sentence summary."
5. SUCCESS CRITERIA? Measurable: "Complete the quiz and score 80%+" or "Write a 250-word essay in 40 minutes with clear thesis and two body paragraphs."

BAD: "Study grammar for writing."
GOOD: "Complete the complex sentences module on ieltsadvantage.com/task-2-grammar (45 min). Then write 5 original sentences using subordinate clauses. Success: all 5 are grammatically correct and you can explain why."

══════════════════════════════════════════════════
STEP 5 — MANDATORY RESOURCE URLs:
══════════════════════════════════════════════════
Every task, video, and article MUST have a real URL. Priority: official sources → best free platforms → specific YouTube playlists → paid only if no free alternative.

TRUSTED SOURCES BY DOMAIN:
- Language exams: ielts.org, britishcouncil.org, ieltsliz.com, ieltsadvantage.com, cambridgeenglish.org
- Coding: developer.mozilla.org, roadmap.sh, freecodecamp.org, javascript.info, theodinproject.com, cs50.harvard.edu, leetcode.com
- Data Science: kaggle.com/learn, fast.ai, scikit-learn.org/stable/tutorial
- Cloud: aws.amazon.com/training, learn.microsoft.com, cloud.google.com/learn
- Academic: khanacademy.org, ocw.mit.edu, coursera.org, edx.org
- Music: musictheory.net, justinguitar.com
- Design: figma.com/resources, lawsofux.com, nngroup.com/articles
- Business: hubspot.com/resources, semrush.com/academy
- Languages: duolingo.com, italki.com, clozemaster.com

ANTI-HALLUCINATION: Do NOT invent fake YouTube video IDs or fabricate URLs.
- If you know the EXACT permanent URL, use it directly.
- Otherwise, construct a GUARANTEED SEARCH URL:
  Videos: https://www.youtube.com/results?search_query=best+<specific+subtopic>+tutorial
  Articles: https://www.google.com/search?q=comprehensive+guide+<specific+subtopic>
  Tasks: https://www.google.com/search?q=step+by+step+<specific+task>+tutorial
- Make queries HYPER-SPECIFIC with known channel/source names.

══════════════════════════════════════════════════
STEP 6 — COMPREHENSION & SYNTHESIS:
══════════════════════════════════════════════════
DO NOT ever copy-paste the user's raw input text into titles, phase names, or themes.
ANALYZE and SYNTHESIZE into clean, professional language.
- User: "I have already IELTS 6.0 give me 7.0+ plan" → Title: "Advanced IELTS 7.0+ Preparation Roadmap"
- User: "prepare for journalism internship at Kun.uz" → Title: "Journalism Internship Preparation — Kun.uz Ready"

══════════════════════════════════════════════════
STEP 7 — EXERCISE DESCRIPTIONS:
══════════════════════════════════════════════════
Each phase MUST have 1-2 EXERCISES (hands-on, NO URL). Each exercise description must include:
- A concrete, measurable deliverable ("Write X", "Build Y", "Analyze Z")
- Step-by-step instructions
- Success criteria the student can self-assess
- Estimated duration in minutes

══════════════════════════════════════════════════
STEP 8 — OVERVIEW CONTENT:
══════════════════════════════════════════════════
The "overview" field must include:
1. An encouraging summary of what the learner will achieve
2. A feasibility note (sufficient time OR honest warning)
3. Two expert tips specific to THIS goal (not generic advice)

══════════════════════════════════════════════════
DURATION MAPPING (STRICT):
══════════════════════════════════════════════════
"1 week" = 1 phase | "2 weeks" = 2 | "3 weeks" = 3
"4 weeks" = 4 | "2 months" = 8 | "3 months" = 12
Each phase = 1 week. Label "Week N".

Each phase MUST contain: 2-3 tasks (with URLs), 1-2 exercises (no URLs), 2+ videos, 2+ articles.

══════════════════════════════════════════════════
NO GENERIC TEMPLATES:
══════════════════════════════════════════════════
NEVER use lazy titles like "[Topic] Core Concepts" / "Getting Started with [Topic]".
Write HIGHLY SPECIFIC, level-appropriate titles that a real coach would use.

══════════════════════════════════════════════════

Return a JSON object with this EXACT structure:
{
  "title": "Clean, professional title synthesized from the user's goal",
  "overview": "Encouraging summary + feasibility note + 2 expert tips. 3-5 sentences.",
  "roadmap": [
    {
      "phase": "Week 1",
      "theme": "Specific, descriptive theme for this week",
      "tasks": [
        {
          "title": "Actionable task with clear success criteria",
          "type": "task",
          "duration": "45 min",
          "url": "https://..."
        }
      ],
      "exercises": [
        {
          "title": "Hands-on exercise title",
          "type": "exercise",
          "duration": "60 min",
          "description": "Step-by-step instructions with deliverable and success criteria"
        }
      ],
      "resources": {
        "videos": [
          { "title": "Video title (Channel/Source)", "url": "https://..." }
        ],
        "articles": [
          { "title": "Article title (Source)", "url": "https://..." }
        ]
      }
    }
  ]
}

Respond ONLY with valid JSON. No markdown, no code fences, no explanation outside the JSON.`;

    const response = await callAI(prompt, { temperature: 0.5, maxTokens: 12288, jsonMode: true });

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

// ══════════════════════════════════════════════════════════════════════════════
// PLAGIARISM PIPELINE — Multi-Module Analysis System
// ══════════════════════════════════════════════════════════════════════════════

const CREDIT_PER_100_WORDS = 1;
const MIN_CREDIT_COST = 5;

/** Calculate credit cost based on word count */
export const calculatePlagiarismCreditCost = (wordCount: number): number => {
  return Math.max(MIN_CREDIT_COST, Math.ceil(wordCount / 100) * CREDIT_PER_100_WORDS);
};

/** Module A: Advanced AI Content Detection */
const runAdvancedAIScan = async (text: string) => {
  const prompt = `You are an expert AI content detection system. Analyze the following text and determine the probability that it was generated by an AI (ChatGPT, Claude, Gemini, etc.) versus written by a human.

TEXT TO ANALYZE:
"""
${text}
"""

Analyze these dimensions:
1. **Perplexity** — AI text tends to have low perplexity (more predictable word choices)
2. **Burstiness** — Human writing has more variation in sentence length and complexity
3. **Token probability** — AI tends to use high-probability tokens consistently
4. **Stylistic patterns** — AI has characteristic patterns (hedging language, list-making, etc.)
5. **Creativity markers** — Unique metaphors, personal anecdotes, domain-specific jargon

Respond ONLY with valid JSON:
{
  "aiProbabilityScore": <number 0-100, where 100 = definitely AI>,
  "humanProbabilityScore": <number 0-100, where 100 = definitely human>,
  "confidence": <"high" | "medium" | "low">,
  "perplexityLevel": <"low" | "medium" | "high">,
  "burstinessLevel": <"low" | "medium" | "high">,
  "detectedPatterns": ["<pattern description 1>", "<pattern description 2>"],
  "verdict": "<1-2 sentence verdict>"
}`;

  try {
    const response = await callAI(prompt, { temperature: 0.2, maxTokens: 2048, jsonMode: true });
    return JSON.parse(cleanJSON(response));
  } catch {
    return {
      aiProbabilityScore: 0,
      humanProbabilityScore: 100,
      confidence: 'low',
      perplexityLevel: 'medium',
      burstinessLevel: 'medium',
      detectedPatterns: [],
      verdict: 'Unable to complete AI detection analysis.',
    };
  }
};

/** Module B: Plagiarism / Originality Check */
const runPlagiarismCheck = async (text: string) => {
  const prompt = `You are an advanced plagiarism detection engine. Analyze the following text for originality.

TEXT TO ANALYZE:
"""
${text}
"""

Evaluate:
1. **Originality** — How likely the text is original vs. copied/paraphrased from known sources
2. **Source matching** — Identify passages that appear to be from common sources (Wikipedia, academic papers, news, textbooks)
3. **Citation detection** — Check if quotes and references are properly cited
4. **Paraphrase detection** — Find passages that appear to be reworded from existing content

Respond ONLY with valid JSON:
{
  "originalityScore": <number 0-100, where 100 = fully original>,
  "isOriginal": <boolean, true if originalityScore >= 70>,
  "citationQuality": <"Excellent" | "Good" | "Average" | "Poor" | "None">,
  "sourcesFound": <number of potential source matches>,
  "matchedSegments": [
    {
      "text": "<the suspected passage>",
      "possibleSource": "<source name or URL>",
      "similarityPercent": <number 0-100>,
      "type": <"exact" | "paraphrased" | "common_knowledge">
    }
  ],
  "readabilityLevel": <"Elementary" | "Middle School" | "High School" | "College" | "Graduate" | "Professional">,
  "summary": "<2-3 sentence summary of findings>"
}`;

  try {
    const response = await callAI(prompt, { temperature: 0.2, maxTokens: 4096, jsonMode: true });
    return JSON.parse(cleanJSON(response));
  } catch {
    return {
      originalityScore: 50,
      isOriginal: false,
      citationQuality: 'None',
      sourcesFound: 0,
      matchedSegments: [],
      readabilityLevel: 'College',
      summary: 'Unable to complete plagiarism analysis.',
    };
  }
};

/** Module C: AI Hallucination Detection */
const runHallucinationCheck = async (text: string) => {
  const prompt = `You are a fact-checking expert. Analyze the following text for potential AI hallucinations — claims, statistics, citations, or facts that may be fabricated or unverifiable.

TEXT TO ANALYZE:
"""
${text}
"""

Check for:
1. **Fabricated statistics** — Numbers, percentages, or data points without verifiable sources
2. **Fake citations** — References to papers, books, or authors that don't exist
3. **Incorrect facts** — Statements that contradict established knowledge
4. **Unverifiable claims** — Claims that cannot be confirmed from reliable sources
5. **Misleading context** — Facts taken out of context or used misleadingly

Respond ONLY with valid JSON:
{
  "totalClaimsChecked": <number>,
  "verifiedClaims": <number>,
  "unverifiedClaims": [
    {
      "claim": "<the specific claim>",
      "issue": "<what's wrong with it>",
      "severity": <"high" | "medium" | "low">,
      "suggestion": "<how to fix or verify>"
    }
  ],
  "hallucinationRisk": <"low" | "medium" | "high">,
  "summary": "<1-2 sentence summary>"
}`;

  try {
    const response = await callAI(prompt, { temperature: 0.2, maxTokens: 4096, jsonMode: true });
    return JSON.parse(cleanJSON(response));
  } catch {
    return {
      totalClaimsChecked: 0,
      verifiedClaims: 0,
      unverifiedClaims: [],
      hallucinationRisk: 'low',
      summary: 'Unable to complete hallucination analysis.',
    };
  }
};

/** Module D: Writing Feedback */
const runWritingFeedback = async (text: string) => {
  const prompt = `You are a professional writing coach and editor. Provide detailed, actionable feedback on the following text.

TEXT TO ANALYZE:
"""
${text}
"""

Evaluate:
1. **Grammar & Spelling** — Errors and corrections
2. **Clarity & Coherence** — How clear and well-structured the writing is
3. **Academic Tone** — Appropriateness for academic or professional context
4. **Vocabulary** — Word choice quality and variety
5. **Structure** — Paragraph organization, transitions, flow

Respond ONLY with valid JSON:
{
  "overallScore": <number 0-100>,
  "grammarScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "toneScore": <number 0-100>,
  "grammarIssues": [
    {
      "text": "<the problematic text>",
      "issue": "<description of the issue>",
      "correction": "<suggested correction>",
      "type": <"grammar" | "spelling" | "punctuation" | "style">
    }
  ],
  "suggestions": [
    "<improvement suggestion 1>",
    "<improvement suggestion 2>"
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "summary": "<1-2 sentence overall feedback>"
}`;

  try {
    const response = await callAI(prompt, { temperature: 0.3, maxTokens: 4096, jsonMode: true });
    return JSON.parse(cleanJSON(response));
  } catch {
    return {
      overallScore: 0,
      grammarScore: 0,
      clarityScore: 0,
      toneScore: 0,
      grammarIssues: [],
      suggestions: [],
      strengths: [],
      summary: 'Unable to complete writing feedback analysis.',
    };
  }
};

/**
 * Main pipeline orchestrator.
 * Creates a document, runs selected modules in parallel, saves the report.
 */
export const runPlagiarismPipeline = async (
  text: string,
  modules: CheckModule[],
  userId: string,
  documentName: string = 'Untitled Document'
) => {
  const startTime = Date.now();
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const creditCost = calculatePlagiarismCreditCost(wordCount);

  // Create the document record
  const doc = await prisma.plagiarismDocument.create({
    data: {
      userId,
      name: documentName,
      textContent: text,
      wordCount,
      status: PlagiarismCheckStatus.PROCESSING,
      modules,
      creditCost,
    },
  });

  try {
    // Run selected modules in parallel
    const modulePromises: Record<string, Promise<any>> = {};

    if (modules.includes(CheckModule.ADVANCED_AI)) {
      modulePromises.advancedAI = runAdvancedAIScan(text);
    }
    if (modules.includes(CheckModule.PLAGIARISM)) {
      modulePromises.plagiarism = runPlagiarismCheck(text);
    }
    if (modules.includes(CheckModule.HALLUCINATIONS)) {
      modulePromises.hallucinations = runHallucinationCheck(text);
    }
    if (modules.includes(CheckModule.FEEDBACK)) {
      modulePromises.feedback = runWritingFeedback(text);
    }

    // If no specific plagiarism module selected, still run a basic originality check
    if (!modules.includes(CheckModule.PLAGIARISM)) {
      modulePromises.plagiarism = runPlagiarismCheck(text);
    }

    const keys = Object.keys(modulePromises);
    const results = await Promise.allSettled(Object.values(modulePromises));
    const resolved: Record<string, any> = {};
    keys.forEach((key, i) => {
      const r = results[i];
      resolved[key] = r.status === 'fulfilled' ? r.value : null;
    });

    // Extract scores
    const plagiarismData = resolved.plagiarism || {};
    const aiData = resolved.advancedAI || {};

    const originalityScore = plagiarismData.originalityScore ?? 50;
    const aiProbabilityScore = aiData.aiProbabilityScore ?? 0;
    const isOriginal = plagiarismData.isOriginal ?? originalityScore >= 70;
    const readabilityLevel = plagiarismData.readabilityLevel ?? 'College';
    const summary = plagiarismData.summary || aiData.verdict || 'Analysis complete.';

    const processingTimeMs = Date.now() - startTime;

    // Save the report
    const report = await prisma.plagiarismReport.create({
      data: {
        documentId: doc.id,
        originalityScore,
        aiProbabilityScore,
        isOriginal,
        plagiarismDetails: resolved.plagiarism || undefined,
        aiDetectionDetails: resolved.advancedAI || undefined,
        feedbackDetails: resolved.feedback || undefined,
        hallucinationDetails: resolved.hallucinations || undefined,
        readabilityLevel,
        summary,
        modulesUsed: modules,
        processingTimeMs,
      },
    });

    // Mark document as completed
    await prisma.plagiarismDocument.update({
      where: { id: doc.id },
      data: {
        status: PlagiarismCheckStatus.COMPLETED,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });

    return {
      documentId: doc.id,
      reportId: report.id,
      wordCount,
      creditCost,
      originalityScore,
      aiProbabilityScore,
      isOriginal,
      readabilityLevel,
      summary,
      plagiarismDetails: resolved.plagiarism || null,
      aiDetectionDetails: resolved.advancedAI || null,
      feedbackDetails: resolved.feedback || null,
      hallucinationDetails: resolved.hallucinations || null,
      modulesUsed: modules,
      processingTimeMs,
    };
  } catch (error) {
    // Mark as failed
    await prisma.plagiarismDocument.update({
      where: { id: doc.id },
      data: { status: PlagiarismCheckStatus.FAILED },
    });
    throw error;
  }
};

/** Legacy checkPlagiarism — kept for backward compatibility */
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
    const plagResult = await runPlagiarismCheck(text);
    const aiResult = await runAdvancedAIScan(text);
    return {
      originalityScore: plagResult.originalityScore ?? 50,
      aiScore: aiResult.aiProbabilityScore ?? 0,
      citationQuality: plagResult.citationQuality ?? 'None',
      readabilityLevel: plagResult.readabilityLevel ?? 'College',
      sourcesFound: plagResult.sourcesFound ?? 0,
      isOriginal: plagResult.isOriginal ?? false,
      summary: plagResult.summary ?? 'Analysis complete.',
      matchedSources: (plagResult.matchedSegments || [])
        .map((s: any) => s.possibleSource)
        .filter(Boolean),
    };
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
