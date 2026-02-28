import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import { useCredits } from '../src/contexts/CreditContext';
import {
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PencilSquareIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface CVAnalysisResult {
  score: number;
  pass_ats: string;
  pass_ats_reason: string;
  score_rationale: string;
  parsing_risks: { issue: string; severity: string; reason: string }[];
  requirements: {
    requirement: string;
    score: number;
    evidence: string;
    fix_suggestion: string;
  }[];
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
  missing_keywords: string[];
  weaknesses: string[];
  actionable_fixes: string[];
}

interface ScanHistoryItem {
  id: string;
  score: number;
  jobRole: string | null;
  fileName: string | null;
  createdAt: string;
}

type ResultTab = 'overview' | 'requirements' | 'gaps' | 'fix_plan' | 'formatting';

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function CVChecker({ navigateTo }: NavigationProps) {
  const { refreshBalance } = useCredits();
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Credit-gate modal state
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [creditErrorData, setCreditErrorData] = useState<{
    required: number;
    available: number;
    shortfall: number;
    toolName: string;
  } | null>(null);

  /* ── Helpers ───────────────────────────────────────────────────────────── */

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const { data } = await aiApi.getAtsHistory();
      if (data?.data) setScanHistory(data.data);
    } catch {
      /* silent */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! Your CV is well-optimized.';
    if (score >= 60) return 'Good progress! A few improvements needed.';
    return 'Needs work. Follow the suggestions below.';
  };

  const getVerdictStyles = (verdict: string) => {
    if (verdict === 'Yes')
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    if (verdict === 'No')
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  };

  const getReqScoreColor = (s: number) => {
    if (s === 3) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (s === 2) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (s === 1) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  const getSeverityColor = (s: string) => {
    if (s === 'High') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (s === 'Med') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  /* ── Actions ───────────────────────────────────────────────────────────── */

  const handleAnalyzeCV = async () => {
    if (!cvText.trim()) {
      setError('Please enter your CV text');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await aiApi.analyzeCV(cvText, jobDescription || undefined);

      // Handle 402 Insufficient Credits
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (response.error && (response.data as any)?.code === 'INSUFFICIENT_CREDITS') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errData = (response.data as any)?.data;
        setCreditErrorData({
          required: errData?.required || 0,
          available: errData?.available || 0,
          shortfall: errData?.shortfall || 0,
          toolName: errData?.toolName || 'ATS Checker',
        });
        setShowInsufficientModal(true);
        return;
      }
      if (response.error) throw new Error(response.error);

      const data = response.data as CVAnalysisResult;
      setAnalysisResult(data);
      setActiveTab('overview');
      fetchHistory();
      refreshBalance();
    } catch (err: unknown) {
      console.error('Failed to analyze CV:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze CV. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }
    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);
    setIsExtracting(true);
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        setCvText(text.substring(0, 20000));
        setIsExtracting(false);
        return;
      }
      const response = await aiApi.extractText(file);
      if (response.error) throw new Error(response.error);
      setCvText(response.data!.extractedText);
    } catch (err: unknown) {
      console.error('Failed to extract text from file:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to extract text from file. Please try pasting the text directly.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setSelectedFile(null);
    setCvText('');
    setJobDescription('');
    setError(null);
    setActiveTab('overview');
  };

  /* ─── Tab definitions ─────────────────────────────────────────────────── */

  const tabs: { key: ResultTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'assessment' },
    { key: 'requirements', label: 'Requirements', icon: 'checklist' },
    { key: 'gaps', label: 'Gaps', icon: 'error_outline' },
    { key: 'fix_plan', label: 'Fix Plan', icon: 'build' },
    { key: 'formatting', label: 'Formatting', icon: 'format_list_bulleted' },
  ];

  /* ─── Header ──────────────────────────────────────────────────────────── */

  const headerContent = (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] backdrop-blur-sm px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          StudentOS
        </h1>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
        <span className="text-sm font-medium text-slate-500">ATS Checker</span>
      </div>
      <div className="flex items-center gap-3">
        {analysisResult && (
          <button
            onClick={resetAnalysis}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 text-sm font-medium transition-colors"
          >
            New Analysis
          </button>
        )}
      </div>
    </header>
  );

  /* ─── Empty State ─────────────────────────────────────────────────────── */

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        <DocumentTextIcon className="w-9 h-9 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No CV Analyzed Yet</h3>
      <p className="text-sm text-slate-500 max-w-md">
        Upload your CV or paste your resume text to get an instant ATS compatibility score with
        actionable improvement suggestions.
      </p>
    </div>
  );

  /* ─── Results Panel ───────────────────────────────────────────────────── */

  const ResultsPanel = () => {
    if (!analysisResult) return <EmptyState />;
    const r = analysisResult;

    return (
      <div className="flex flex-col gap-4 overflow-y-auto hide-scrollbar pb-10">
        {/* Tab Bar */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ───────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* Score + Verdict */}
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative size-36 md:size-40 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getScoreRingColor(r.score)}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      strokeDasharray={`${r.score}, 100`}
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-extrabold ${getScoreColor(r.score)}`}>
                      {r.score}
                      <span className="text-xl text-slate-400">%</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      ATS Score
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {getScoreMessage(r.score)}
                  </h2>
                  {r.score_rationale && (
                    <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                      {r.score_rationale}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getVerdictStyles(r.pass_ats)}`}
                    >
                      Pass ATS: {r.pass_ats}
                    </span>
                    {r.pass_ats_reason && (
                      <span className="text-xs text-slate-500 italic">{r.pass_ats_reason}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Requirements Met',
                  value: `${r.requirements.filter((x) => x.score >= 2).length}/${r.requirements.length}`,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  label: 'Critical Gaps',
                  value: r.gaps.length,
                  color: 'text-red-600',
                  bg: 'bg-red-50 dark:bg-red-900/20',
                },
                {
                  label: 'Parsing Risks',
                  value: r.parsing_risks.filter((x) => x.severity === 'High').length,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                },
                {
                  label: 'Missing Keywords',
                  value: r.missing_keywords.length,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50 dark:bg-purple-900/20',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} rounded-xl p-4 border border-slate-100 dark:border-slate-800`}
                >
                  <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Missing Keywords + Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                    <KeyIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Missing Keywords</h3>
                </div>
                {r.missing_keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {r.missing_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-medium rounded-full"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No missing keywords detected!</p>
                )}
              </div>
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Weaknesses</h3>
                </div>
                {r.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {r.weaknesses.slice(0, 5).map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <MinusIcon className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No major weaknesses found!</p>
                )}
              </div>
            </div>

            {/* Actionable Fixes */}
            <div className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">AI-Powered Suggestions</h3>
                  <p className="text-xs text-slate-400">
                    Personalized improvements for your resume
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {r.actionable_fixes.length > 0 ? (
                  r.actionable_fixes.map((fix, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                        <PlusIcon className="w-3 h-3 text-green-400" />
                      </div>
                      <p className="text-sm text-white/90">{fix}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    Your CV looks great! No specific fixes needed.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REQUIREMENTS TAB ───────────────────────────────────────────── */}
        {activeTab === 'requirements' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    checklist
                  </span>
                  Semantic Match Scoring
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Each requirement scored 0–3: 0=missing, 1=weak, 2=present with evidence, 3=strong
                  with impact
                </p>
              </div>
              {r.requirements.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {r.requirements.map((req, i) => (
                    <div
                      key={i}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-white flex-1">
                          {req.requirement}
                        </h4>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${getReqScoreColor(req.score)}`}
                        >
                          {req.score}/3
                        </span>
                      </div>
                      {req.evidence && (
                        <p className="text-xs text-slate-500 italic mb-1.5 pl-1 border-l-2 border-slate-200 dark:border-slate-700">
                          &quot;{req.evidence}&quot;
                        </p>
                      )}
                      {req.fix_suggestion && (
                        <p className="text-xs text-primary font-medium mt-1">
                          💡 {req.fix_suggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No requirements to display.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GAPS TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'gaps' && (
          <div className="flex flex-col gap-6">
            {/* Top Gaps */}
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  <ExclamationCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">
                    Top Gaps (Likely Rejection Causes)
                  </h3>
                  <p className="text-xs text-slate-500">Must-have failures prioritized</p>
                </div>
              </div>
              {r.gaps.length > 0 ? (
                <ul className="space-y-2">
                  {r.gaps.map((gap, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30"
                    >
                      <span className="text-red-500 font-bold shrink-0">{i + 1}.</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No critical gaps found!</p>
              )}
            </div>

            {/* Hidden Gaps */}
            {r.hidden_gaps.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Hidden Gaps</h3>
                    <p className="text-xs text-slate-500">
                      Implied by the role but not proven in the resume
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {r.hidden_gaps.map((hg, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <MinusIcon className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      {hg}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fluff Claims */}
            {r.fluff_claims.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Fluff Claims</h3>
                    <p className="text-xs text-slate-500">
                      Unverifiable, buzzword-only, or responsibility-without-impact
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {r.fluff_claims.map((fc, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 p-2 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg"
                    >
                      <span className="text-purple-500 shrink-0">⚠</span>
                      {fc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── FIX PLAN TAB ────────────────────────────────────────────────── */}
        {activeTab === 'fix_plan' && (
          <div className="flex flex-col gap-6">
            {/* Headlines */}
            {r.fix_plan.headlines.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">title</span>
                  Suggested Headlines
                </h3>
                <div className="space-y-3">
                  {r.fix_plan.headlines.map((h, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm font-medium text-slate-800 dark:text-white"
                    >
                      <span className="text-xs text-primary font-bold mr-2">Option {i + 1}:</span>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summaries */}
            {r.fix_plan.summaries.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    description
                  </span>
                  Suggested Summaries
                </h3>
                <div className="space-y-3">
                  {r.fix_plan.summaries.map((s, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      <span className="text-xs text-primary font-bold mr-2">Option {i + 1}:</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Add */}
            {r.fix_plan.skills_to_add.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    psychology
                  </span>
                  Skills to Add
                </h3>
                <p className="text-xs text-slate-500 mb-4">Add only if truthful</p>
                <div className="flex flex-wrap gap-2">
                  {r.fix_plan.skills_to_add.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-medium rounded-full"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Improved Bullets */}
            {r.fix_plan.improved_bullets.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">edit</span>
                  Improved Bullet Points
                </h3>
                <div className="space-y-4">
                  {r.fix_plan.improved_bullets.map((b, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <div className="text-xs font-bold text-primary mb-2">{b.role}</div>
                      {b.original && b.original !== 'N/A' && (
                        <div className="text-xs text-slate-400 mb-2 p-2 bg-red-50/50 dark:bg-red-900/10 rounded-lg line-through">
                          {b.original}
                        </div>
                      )}
                      <div className="text-sm text-slate-800 dark:text-white p-2 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200/50 dark:border-green-800/50">
                        {b.rewritten}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FORMATTING TAB ──────────────────────────────────────────────── */}
        {activeTab === 'formatting' && (
          <div className="flex flex-col gap-6">
            {/* Parsing Risks */}
            {r.parsing_risks.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">
                    warning
                  </span>
                  ATS Parsing Risks
                </h3>
                <div className="space-y-3">
                  {r.parsing_risks.map((pr, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${getSeverityColor(pr.severity)}`}
                      >
                        {pr.severity}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">
                          {pr.issue}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{pr.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formatting Fixes Checklist */}
            {r.formatting_fixes.length > 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Formatting Fixes Checklist
                </h3>
                <ul className="space-y-2">
                  {r.formatting_fixes.map((fix, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="size-5 rounded border border-slate-300 dark:border-slate-600 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-slate-400">
                        {i + 1}
                      </span>
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {r.parsing_risks.length === 0 && r.formatting_fixes.length === 0 && (
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">
                  Formatting Looks Good!
                </h3>
                <p className="text-sm text-slate-500">
                  No major parsing risks or formatting issues detected.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ─── Main Render ─────────────────────────────────────────────────────── */

  return (
    <>
      <DashboardLayout
        currentScreen={Screen.CV_ATS}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
          <div
            className={`mx-auto transition-all duration-500 ease-in-out ${analysisResult ? 'max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6' : 'max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6'}`}
          >
            {/* Left Panel - Input */}
            <div
              className={`flex flex-col gap-5 ${analysisResult ? 'lg:col-span-4 h-full overflow-y-auto hide-scrollbar pb-10' : 'lg:col-span-2'}`}
            >
              <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
                {/* Mode Switcher */}
                <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl mb-6 w-full max-w-sm mx-auto">
                  <button
                    onClick={() => setInputMode('upload')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium text-center transition-all flex items-center justify-center gap-1.5 ${inputMode === 'upload' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Upload
                  </button>
                  <button
                    onClick={() => setInputMode('text')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium text-center transition-all flex items-center justify-center gap-1.5 ${inputMode === 'text' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Paste Text
                  </button>
                </div>

                {inputMode === 'upload' ? (
                  <div
                    onClick={() => !isExtracting && !isAnalyzing && fileInputRef.current?.click()}
                    className={`rounded-2xl border-2 border-dashed ${isExtracting ? 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/10' : isAnalyzing ? 'border-gray-200 bg-gray-50 dark:bg-slate-800' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer'} p-8 flex flex-col items-center justify-center text-center gap-4 transition-all group relative overflow-hidden`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileSelect}
                      className="hidden"
                      aria-label="Upload CV file"
                      disabled={isExtracting || isAnalyzing}
                    />
                    {isExtracting ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <ArrowPathIcon className="w-5 h-5 text-primary animate-spin" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                          Extracting text from file...
                        </h3>
                        <p className="text-sm text-slate-500">
                          {selectedFile?.name || 'Processing...'}
                        </p>
                      </div>
                    ) : isAnalyzing ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <ArrowPathIcon className="w-5 h-5 text-primary animate-spin" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                          Analyzing CV...
                        </h3>
                        <p className="text-sm text-slate-500">
                          {selectedFile?.name || 'Processing...'}
                        </p>
                      </div>
                    ) : selectedFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={`size-16 rounded-full flex items-center justify-center ${analysisResult ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}
                        >
                          {analysisResult ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <DocumentTextIcon className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                          {selectedFile.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                        <p className="text-sm text-primary cursor-pointer hover:underline">
                          Click to upload a different file
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="size-14 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CloudArrowUpIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            Upload your CV
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Drag & drop or{' '}
                            <span className="text-primary font-medium hover:underline">browse</span>
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">PDF, DOCX, TXT up to 5MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-sm">
                    <div>
                      <label
                        htmlFor="cv-text-input"
                        className="text-xs font-semibold text-slate-500 uppercase mb-2 block"
                      >
                        Your CV / Resume Text
                      </label>
                      <textarea
                        id="cv-text-input"
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        placeholder="Paste your CV or resume text here..."
                        className="w-full h-32 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm resize-none focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="job-desc-input"
                        className="text-xs font-semibold text-slate-500 uppercase mb-2 block"
                      >
                        Job Description (Optional)
                      </label>
                      <textarea
                        id="job-desc-input"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description for targeted analysis..."
                        className="w-full h-24 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm resize-none focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition"
                      />
                    </div>
                    <button
                      onClick={handleAnalyzeCV}
                      disabled={isAnalyzing || !cvText.trim()}
                      className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="w-[18px] h-[18px]" />
                          Analyze CV
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400">
                          Analysis Failed
                        </h4>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Description + Analyze for Upload Mode */}
                {inputMode === 'upload' && (
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                      <label
                        htmlFor="job-desc-upload"
                        className="text-xs font-semibold text-slate-500 uppercase mb-2 block"
                      >
                        Target Job Description (Optional)
                      </label>
                      <textarea
                        id="job-desc-upload"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste a job description for targeted keyword analysis..."
                        className="w-full h-24 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm resize-none focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition"
                      />
                    </div>
                    <button
                      onClick={handleAnalyzeCV}
                      disabled={isExtracting || isAnalyzing || !cvText.trim()}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isExtracting ? (
                        <>
                          <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                          Extracting text...
                        </>
                      ) : isAnalyzing ? (
                        <>
                          <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="w-[18px] h-[18px]" />
                          Analyze CV
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Results (only when results exist) */}
            {analysisResult && (
              <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto hide-scrollbar">
                <ResultsPanel />
              </div>
            )}

            {/* Right Sidebar - Recent Scans (only when no results) */}
            {!analysisResult && (
              <div className="lg:col-span-1 space-y-5">
                <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="w-[18px] h-[18px] text-indigo-500" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Recent Scans
                    </h3>
                  </div>

                  {historyLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <ArrowPathIcon className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : scanHistory.length === 0 ? (
                    <div className="text-center py-6">
                      <DocumentTextIcon className="w-6 h-6 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">No scans yet</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                        Upload a CV to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {scanHistory.map((scan) => (
                        <div
                          key={scan.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <DocumentTextIcon className="w-5 h-5 text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                {scan.fileName || scan.jobRole || 'CV Analysis'}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {timeAgo(scan.createdAt)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                              scan.score >= 80
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800'
                            }`}
                          >
                            {scan.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                    💡 Pro Tip
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                    Paste the target job description for a semantic match analysis — not just
                    keyword matching.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>

      {/* Insufficient Credits Modal */}
      {creditErrorData && (
        <InsufficientCreditsModal
          isOpen={showInsufficientModal}
          onClose={() => setShowInsufficientModal(false)}
          toolName={creditErrorData.toolName}
          required={creditErrorData.required}
          available={creditErrorData.available}
          shortfall={creditErrorData.shortfall}
        />
      )}
    </>
  );
}
