import React, { useState, useEffect, useMemo } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import { useCredits } from '../src/contexts/CreditContext';
import DashboardLayout from './DashboardLayout';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentIcon,
  CpuChipIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LanguageIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

// ── Types ────────────────────────────────────────────────────────────────────

interface MatchedSegment {
  text: string;
  possibleSource: string;
  similarityPercent: number;
  type: 'exact' | 'paraphrased' | 'common_knowledge';
}

interface PlagiarismDetails {
  originalityScore: number;
  isOriginal: boolean;
  citationQuality: string;
  sourcesFound: number;
  matchedSegments: MatchedSegment[];
  readabilityLevel: string;
  summary: string;
}

interface AIDetectionDetails {
  aiProbabilityScore: number;
  humanProbabilityScore: number;
  confidence: string;
  perplexityLevel: string;
  burstinessLevel: string;
  detectedPatterns: string[];
  verdict: string;
}

interface HallucinationDetails {
  totalClaimsChecked: number;
  verifiedClaims: number;
  unverifiedClaims: {
    claim: string;
    issue: string;
    severity: string;
    suggestion: string;
  }[];
  hallucinationRisk: string;
  summary: string;
}

interface FeedbackDetails {
  overallScore: number;
  grammarScore: number;
  clarityScore: number;
  toneScore: number;
  grammarIssues: {
    text: string;
    issue: string;
    correction: string;
    type: string;
  }[];
  suggestions: string[];
  strengths: string[];
  summary: string;
}

interface PipelineResult {
  documentId: string;
  reportId: string;
  wordCount: number;
  creditCost: number;
  originalityScore: number;
  aiProbabilityScore: number;
  isOriginal: boolean;
  readabilityLevel: string;
  summary: string;
  plagiarismDetails: PlagiarismDetails | null;
  aiDetectionDetails: AIDetectionDetails | null;
  feedbackDetails: FeedbackDetails | null;
  hallucinationDetails: HallucinationDetails | null;
  modulesUsed: string[];
  processingTimeMs: number;
}

type ScanOption = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
};

const SCAN_OPTIONS: ScanOption[] = [
  {
    id: 'advanced-ai',
    label: 'Advanced AI Scan',
    description: 'In-depth AI analysis',
    icon: CpuChipIcon,
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'plagiarism',
    label: 'Plagiarism Check',
    description: 'Check for copied content',
    icon: ShieldCheckIcon,
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'hallucinations',
    label: 'AI Hallucinations',
    description: 'Check claims and cite sources',
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'feedback',
    label: 'Writing Feedback',
    description: 'Content, clarity, and grammar',
    icon: PencilSquareIcon,
    iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
];

export default function PlagiarismChecker({ navigateTo }: NavigationProps) {
  const [textContent, setTextContent] = useState('');
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['advanced-ai']);
  const [copied, setCopied] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<string>('overview');
  const { balance } = useCredits();

  // Credit-gate modal state
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [creditErrorData, setCreditErrorData] = useState<{
    required: number;
    available: number;
    shortfall: number;
    toolName: string;
  } | null>(null);

  const wordCount = useMemo(
    () => textContent.trim().split(/\s+/).filter(Boolean).length,
    [textContent]
  );

  // Dynamic credit cost: 1 credit per 100 words, min 5
  const estimatedCost = useMemo(() => Math.max(5, Math.ceil(wordCount / 100)), [wordCount]);

  const handleCheck = async () => {
    if (!textContent.trim()) {
      setError('Please enter some text to check');
      return;
    }
    if (wordCount < 20) {
      setError('Please enter at least 20 words for an accurate analysis.');
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      const response = await aiApi.checkPlagiarism(textContent, selectedOptions, documentName);
      if (response.error && (response.data as any)?.code === 'INSUFFICIENT_CREDITS') {
        const errData = (response.data as any)?.data;
        setCreditErrorData({
          required: errData?.required || 0,
          available: errData?.available || 0,
          shortfall: errData?.shortfall || 0,
          toolName: errData?.toolName || 'Plagiarism Checker',
        });
        setShowInsufficientModal(true);
        return;
      }
      if (response.error) throw new Error(response.error);
      setResult(response.data as PipelineResult);
      setActiveResultTab('overview');
    } catch (err: unknown) {
      console.error('Failed to check plagiarism:', err);
      setError(err instanceof Error ? err.message : 'Failed to check content. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleCopy = async () => {
    if (!textContent) return;
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTextContent('');
    setResult(null);
    setError(null);
  };

  // ── Color helpers ──
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const getRiskColor = (risk: string) => {
    if (risk === 'low')
      return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
    if (risk === 'medium')
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
  };

  // SVG circle calc
  const circumference = 2 * Math.PI * 40;

  return (
    <>
      <DashboardLayout currentScreen={Screen.PLAGIARISM} navigateTo={navigateTo}>
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50 dark:bg-background-dark overflow-hidden">
          {/* ═══════ LEFT: Document Editor ═══════ */}
          <div className="flex-1 flex flex-col bg-white dark:bg-card-dark m-3 md:m-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Editor Top Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center gap-2.5">
                <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                <input
                  className="font-semibold text-gray-800 dark:text-white text-sm bg-transparent border-none outline-none w-48 focus:ring-0"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Document name..."
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  <DocumentArrowUpIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </div>
            </div>

            {/* Text Editor Area */}
            <textarea
              className="flex-1 w-full p-6 md:p-10 resize-none outline-none text-gray-700 dark:text-gray-200 text-base md:text-lg leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 bg-transparent"
              placeholder="Paste your text here or upload a document to check for plagiarism and AI-generated content..."
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                if (error) setError(null);
              }}
            />

            {/* Error Banner */}
            {error && (
              <div className="mx-5 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {copied ? (
                    <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <LanguageIcon className="w-3.5 h-3.5" />
                <span>{wordCount} words</span>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT: Analysis Sidebar ═══════ */}
          <div className="w-full md:w-80 lg:w-96 bg-gray-50 dark:bg-background-dark md:border-l border-gray-200 dark:border-gray-700 flex flex-col p-4 overflow-y-auto">
            {/* Analysis Options */}
            <div className="flex-1 space-y-3">
              {SCAN_OPTIONS.map((opt) => {
                const isSelected = selectedOptions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`w-full flex items-start gap-3 p-4 bg-white dark:bg-card-dark border rounded-2xl cursor-pointer transition-all duration-200 text-left shadow-sm ${
                      isSelected
                        ? 'border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-200 dark:ring-indigo-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <opt.icon className={`w-5 h-5 ${opt.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}

              {/* Create Custom Reviewer */}
              <button className="w-full flex items-start gap-3 p-4 bg-indigo-50/60 dark:bg-indigo-900/15 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                    Create Custom Reviewer
                  </p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-0.5">
                    Add review instructions
                  </p>
                </div>
                <SparklesIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              </button>
            </div>

            {/* ── Bottom: Scan Button & Credits ── */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCheck}
                disabled={isChecking || !textContent.trim() || selectedOptions.length === 0}
                className="w-full flex items-center justify-between bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 py-4 rounded-2xl font-bold text-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isChecking ? 'Scanning...' : 'Scan Document'}</span>
                {isChecking ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRightIcon className="w-5 h-5" />
                )}
              </button>
              <div className="mt-3 text-center flex flex-col gap-1">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cost:{' '}
                  <span className="text-gray-900 dark:text-white">
                    {wordCount > 0 ? estimatedCost : '—'} Credits
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center gap-1">
                  <span className="text-indigo-500">💎</span>
                  You have{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {balance}
                  </span>{' '}
                  credits remaining
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Results Modal ═══════ */}
        {result && !isChecking && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card-dark rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-indigo-500" />
                    Analysis Report
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{result.wordCount} words</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {(result.processingTimeMs / 1000).toFixed(1)}s
                    </span>
                    <span>•</span>
                    <span>{result.creditCost} credits used</span>
                  </div>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto px-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  ...(result.plagiarismDetails ? [{ id: 'plagiarism', label: 'Plagiarism' }] : []),
                  ...(result.aiDetectionDetails ? [{ id: 'ai', label: 'AI Detection' }] : []),
                  ...(result.hallucinationDetails
                    ? [{ id: 'hallucinations', label: 'Hallucinations' }]
                    : []),
                  ...(result.feedbackDetails
                    ? [{ id: 'feedback', label: 'Writing Feedback' }]
                    : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResultTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeResultTab === tab.id
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* ── OVERVIEW TAB ── */}
                {activeResultTab === 'overview' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Originality Score */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Originality
                      </span>
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 dark:text-gray-700 stroke-current"
                            cx="50"
                            cy="50"
                            fill="none"
                            r="40"
                            strokeWidth="8"
                          />
                          <circle
                            className={`${getScoreColor(result.originalityScore)} stroke-current transition-all duration-1000 ease-out`}
                            cx="50"
                            cy="50"
                            fill="none"
                            r="40"
                            strokeDasharray={circumference}
                            strokeDashoffset={
                              circumference - (result.originalityScore / 100) * circumference
                            }
                            strokeLinecap="round"
                            strokeWidth="8"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {result.originalityScore}%
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${result.isOriginal ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}
                      >
                        {result.isOriginal ? 'Passed' : 'Review Needed'}
                      </span>
                    </div>

                    {/* AI Score */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        AI Probability
                      </span>
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 dark:text-gray-700 stroke-current"
                            cx="50"
                            cy="50"
                            fill="none"
                            r="40"
                            strokeWidth="8"
                          />
                          <circle
                            className={`${getScoreColor(100 - result.aiProbabilityScore)} stroke-current transition-all duration-1000 ease-out`}
                            cx="50"
                            cy="50"
                            fill="none"
                            r="40"
                            strokeDasharray={circumference}
                            strokeDashoffset={
                              circumference - (result.aiProbabilityScore / 100) * circumference
                            }
                            strokeLinecap="round"
                            strokeWidth="8"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {result.aiProbabilityScore}%
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${result.aiProbabilityScore <= 30 ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : result.aiProbabilityScore <= 60 ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30' : 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}
                      >
                        {result.aiProbabilityScore <= 30
                          ? 'Likely Human'
                          : result.aiProbabilityScore <= 60
                            ? 'Mixed'
                            : 'Likely AI'}
                      </span>
                    </div>

                    {/* Readability */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Readability
                      </span>
                      <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <BookOpenIcon className="w-10 h-10 text-purple-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {result.readabilityLevel}
                      </span>
                    </div>

                    {/* Processing Info */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Modules Used
                      </span>
                      <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <span className="text-3xl font-bold text-indigo-600">
                          {result.modulesUsed.length}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 text-center">
                        {result.modulesUsed.join(', ')}
                      </span>
                    </div>

                    {/* Summary */}
                    <div className="sm:col-span-2 lg:col-span-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
                    </div>
                  </div>
                )}

                {/* ── PLAGIARISM TAB ── */}
                {activeResultTab === 'plagiarism' && result.plagiarismDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Originality Score</p>
                        <p
                          className={`text-3xl font-bold ${getScoreColor(result.plagiarismDetails.originalityScore)}`}
                        >
                          {result.plagiarismDetails.originalityScore}%
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Citation Quality</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {result.plagiarismDetails.citationQuality}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Sources Found</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {result.plagiarismDetails.sourcesFound}
                        </p>
                      </div>
                    </div>

                    {/* Matched Segments */}
                    {result.plagiarismDetails.matchedSegments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-red-500" />
                          Matched Segments ({result.plagiarismDetails.matchedSegments.length})
                        </h3>
                        <div className="space-y-3">
                          {result.plagiarismDetails.matchedSegments.map((seg, i) => (
                            <div
                              key={i}
                              className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-xl p-4"
                            >
                              <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                                "{seg.text}"
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span
                                  className={`px-2 py-0.5 rounded font-medium ${seg.type === 'exact' ? 'bg-red-100 text-red-700' : seg.type === 'paraphrased' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
                                >
                                  {seg.type}
                                </span>
                                <span>{seg.similarityPercent}% similar</span>
                                <span>Source: {seg.possibleSource}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      {result.plagiarismDetails.summary}
                    </p>
                  </div>
                )}

                {/* ── AI DETECTION TAB ── */}
                {activeResultTab === 'ai' && result.aiDetectionDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">AI Probability</p>
                        <p
                          className={`text-3xl font-bold ${getScoreColor(100 - result.aiDetectionDetails.aiProbabilityScore)}`}
                        >
                          {result.aiDetectionDetails.aiProbabilityScore}%
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Confidence</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                          {result.aiDetectionDetails.confidence}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Perplexity</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                          {result.aiDetectionDetails.perplexityLevel}
                        </p>
                      </div>
                    </div>

                    {/* Detected Patterns */}
                    {result.aiDetectionDetails.detectedPatterns.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                          Detected Patterns
                        </h3>
                        <div className="space-y-2">
                          {result.aiDetectionDetails.detectedPatterns.map((pattern, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <CpuChipIcon className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                              {pattern}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      {result.aiDetectionDetails.verdict}
                    </p>
                  </div>
                )}

                {/* ── HALLUCINATIONS TAB ── */}
                {activeResultTab === 'hallucinations' && result.hallucinationDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Claims Checked</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {result.hallucinationDetails.totalClaimsChecked}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Verified</p>
                        <p className="text-3xl font-bold text-green-500">
                          {result.hallucinationDetails.verifiedClaims}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                        <span
                          className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${getRiskColor(result.hallucinationDetails.hallucinationRisk)}`}
                        >
                          {result.hallucinationDetails.hallucinationRisk.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Unverified Claims */}
                    {result.hallucinationDetails.unverifiedClaims.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                          Unverified Claims ({result.hallucinationDetails.unverifiedClaims.length})
                        </h3>
                        <div className="space-y-3">
                          {result.hallucinationDetails.unverifiedClaims.map((claim, i) => (
                            <div
                              key={i}
                              className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4"
                            >
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                "{claim.claim}"
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {claim.issue}
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded font-medium ${claim.severity === 'high' ? 'bg-red-100 text-red-700' : claim.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                                >
                                  {claim.severity}
                                </span>
                                <span className="text-xs text-gray-500">💡 {claim.suggestion}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      {result.hallucinationDetails.summary}
                    </p>
                  </div>
                )}

                {/* ── WRITING FEEDBACK TAB ── */}
                {activeResultTab === 'feedback' && result.feedbackDetails && (
                  <div className="space-y-6">
                    {/* Score Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Overall', score: result.feedbackDetails.overallScore },
                        { label: 'Grammar', score: result.feedbackDetails.grammarScore },
                        { label: 'Clarity', score: result.feedbackDetails.clarityScore },
                        { label: 'Tone', score: result.feedbackDetails.toneScore },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center"
                        >
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                            {item.score}
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${getScoreBg(item.score)}`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Strengths */}
                    {result.feedbackDetails.strengths.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                          ✅ Strengths
                        </h3>
                        <div className="space-y-1.5">
                          {result.feedbackDetails.strengths.map((s, i) => (
                            <p
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-green-300"
                            >
                              {s}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar Issues */}
                    {result.feedbackDetails.grammarIssues.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                          Grammar Issues ({result.feedbackDetails.grammarIssues.length})
                        </h3>
                        <div className="space-y-3">
                          {result.feedbackDetails.grammarIssues.map((issue, i) => (
                            <div
                              key={i}
                              className="bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/30 rounded-xl p-3"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-medium">
                                  {issue.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="line-through text-red-400">{issue.text}</span>
                                {' → '}
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {issue.correction}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{issue.issue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {result.feedbackDetails.suggestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                          💡 Suggestions
                        </h3>
                        <div className="space-y-1.5">
                          {result.feedbackDetails.suggestions.map((s, i) => (
                            <p
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-indigo-300"
                            >
                              {s}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      {result.feedbackDetails.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
