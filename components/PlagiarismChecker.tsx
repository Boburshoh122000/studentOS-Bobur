import React, { useState, useRef, useMemo } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import { useCredits } from '../src/contexts/CreditContext';
import DashboardLayout from './DashboardLayout';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import {
  ArrowRightIcon,
  BookOpenIcon,
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
  unverifiedClaims: { claim: string; issue: string; severity: string; suggestion: string }[];
  hallucinationRisk: string;
  summary: string;
}
interface FeedbackDetails {
  overallScore: number;
  grammarScore: number;
  clarityScore: number;
  toneScore: number;
  grammarIssues: { text: string; issue: string; correction: string; type: string }[];
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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['advanced-ai']);
  const [copied, setCopied] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<string>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { balance } = useCredits();
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [creditErrorData, setCreditErrorData] = useState<{
    required: number;
    available: number;
    shortfall: number;
    toolName: string;
  } | null>(null);

  const wordCount = useMemo(
    () => (textContent.trim() ? textContent.trim().split(/\s+/).filter(Boolean).length : 0),
    [textContent]
  );
  const estimatedCost = useMemo(() => Math.max(5, Math.ceil(wordCount / 100)), [wordCount]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTextContent(ev.target?.result as string);
        setDocumentName(file.name.replace(/\.[^.]+$/, ''));
        setError(null);
      };
      reader.readAsText(file);
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const response = await aiApi.extractText(file);
      if (response.error) throw new Error(response.error);
      const data = response.data as { extractedText: string; fileName: string; truncated: boolean };
      setTextContent(data.extractedText);
      setDocumentName(file.name.replace(/\.[^.]+$/, ''));
      if (data.truncated) setError('Document was truncated to 20,000 characters.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to extract text from file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      setError(err instanceof Error ? err.message : 'Failed to check content. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const toggleOption = (id: string) =>
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };
  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };
  const getRiskBadge = (risk: string) => {
    if (risk === 'low') return 'text-emerald-800 bg-emerald-100';
    if (risk === 'medium') return 'text-amber-800 bg-amber-100';
    return 'text-red-800 bg-red-100';
  };
  const getTypeBadge = (type: string) => {
    if (type === 'exact') return 'bg-red-100 text-red-800';
    if (type === 'paraphrased') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-600';
  };

  const resultTabs = useMemo(() => {
    if (!result) return [];
    return [
      { id: 'overview', label: 'Overview' },
      ...(result.plagiarismDetails ? [{ id: 'plagiarism', label: 'Plagiarism' }] : []),
      ...(result.aiDetectionDetails ? [{ id: 'ai', label: 'AI Detection' }] : []),
      ...(result.hallucinationDetails ? [{ id: 'hallucinations', label: 'Hallucinations' }] : []),
      ...(result.feedbackDetails ? [{ id: 'feedback', label: 'Writing Feedback' }] : []),
    ];
  }, [result]);

  return (
    <>
      <DashboardLayout currentScreen={Screen.PLAGIARISM} navigateTo={navigateTo}>
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50 dark:bg-background-dark overflow-hidden">
          {/* ═══════ LEFT: Document Editor ═══════ */}
          <div className="flex-1 flex flex-col bg-white dark:bg-card-dark m-3 md:m-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                <input
                  className="font-semibold text-gray-800 dark:text-white text-sm bg-transparent border-none outline-none w-48 focus:ring-0 p-0"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Document name..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                  {isUploading ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <DocumentArrowUpIcon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isUploading ? 'Extracting...' : 'Upload'}
                  </span>
                </button>
              </div>
            </div>
            <textarea
              className="flex-1 w-full p-8 md:p-12 resize-none outline-none border-none focus:ring-0 text-gray-800 dark:text-gray-200 text-lg leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 bg-transparent"
              placeholder="Paste your text here or upload a document to check for plagiarism and AI-generated content..."
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                if (error) setError(null);
              }}
            />
            {error && (
              <div className="mx-5 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {copied ? (
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
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
            <div className="flex-1 space-y-3">
              {SCAN_OPTIONS.map((opt) => {
                const isSelected = selectedOptions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`w-full flex items-start gap-3 p-4 bg-white dark:bg-card-dark border rounded-2xl cursor-pointer transition-all duration-200 text-left shadow-sm ${isSelected ? 'border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
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
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      {isSelected && <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cost:{' '}
                  <span className="text-gray-900 dark:text-white font-bold">
                    {wordCount > 0 ? estimatedCost : '\u2014'} Credits
                  </span>
                </p>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <span>\uD83D\uDC8E</span> You have{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{balance}</span>{' '}
                  credits remaining
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ ANALYSIS REPORT MODAL ═══════ */}
        {result && !isChecking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="bg-gray-50 dark:bg-background-dark flex flex-col w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden">
              {/* Fixed Header */}
              <div className="flex-shrink-0 bg-white dark:bg-card-dark px-8 py-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                    <MagnifyingGlassIcon className="w-6 h-6 text-indigo-500" />
                    Analysis Report
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
                    <span>{result.wordCount} words</span>
                    <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {(result.processingTimeMs / 1000).toFixed(1)}s
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                    <span>{result.creditCost} credits used</span>
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
                  aria-label="Close report"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Sticky Tabs */}
              <div className="flex-shrink-0 bg-white/80 dark:bg-card-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-8 flex gap-6 overflow-x-auto">
                {resultTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResultTab(tab.id)}
                    className={`py-4 whitespace-nowrap text-sm border-b-2 transition-colors cursor-pointer ${activeResultTab === tab.id ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 dark:border-indigo-400 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 font-medium'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* ── OVERVIEW ── */}
                {activeResultTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Originality */}
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Originality Score
                        </p>
                        <div className="flex items-baseline gap-3">
                          <span
                            className={`text-4xl font-black ${getScoreColor(result.originalityScore)}`}
                          >
                            {result.originalityScore}%
                          </span>
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg ${result.isOriginal ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}
                          >
                            {result.isOriginal ? '\u2713 Passed' : '\u2717 Review'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getScoreBg(result.originalityScore)}`}
                            style={{ width: `${result.originalityScore}%` }}
                          />
                        </div>
                      </div>
                      {/* AI Probability */}
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          AI Probability
                        </p>
                        <div className="flex items-baseline gap-3">
                          <span
                            className={`text-4xl font-black ${getScoreColor(100 - result.aiProbabilityScore)}`}
                          >
                            {result.aiProbabilityScore}%
                          </span>
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg ${result.aiProbabilityScore <= 30 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : result.aiProbabilityScore <= 60 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}
                          >
                            {result.aiProbabilityScore <= 30
                              ? 'Human'
                              : result.aiProbabilityScore <= 60
                                ? 'Mixed'
                                : 'Likely AI'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getScoreBg(100 - result.aiProbabilityScore)}`}
                            style={{ width: `${result.aiProbabilityScore}%` }}
                          />
                        </div>
                      </div>
                      {/* Readability */}
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Readability
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <BookOpenIcon className="w-8 h-8 text-indigo-500" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {result.readabilityLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Summary
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {result.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── PLAGIARISM ── */}
                {activeResultTab === 'plagiarism' && result.plagiarismDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Originality Score
                        </p>
                        <div className="flex items-baseline gap-3">
                          <span
                            className={`text-4xl font-black ${getScoreColor(result.plagiarismDetails.originalityScore)}`}
                          >
                            {result.plagiarismDetails.originalityScore}%
                          </span>
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg ${result.plagiarismDetails.isOriginal ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                          >
                            {result.plagiarismDetails.isOriginal
                              ? '\u2713 Original'
                              : '\u2717 Flagged'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getScoreBg(result.plagiarismDetails.originalityScore)}`}
                            style={{ width: `${result.plagiarismDetails.originalityScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Citation Quality
                        </p>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {result.plagiarismDetails.citationQuality}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Sources Found
                        </p>
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {result.plagiarismDetails.sourcesFound}
                        </span>
                      </div>
                    </div>
                    {result.plagiarismDetails.matchedSegments.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <LinkIcon className="w-5 h-5 text-gray-400" /> Matched Segments (
                          {result.plagiarismDetails.matchedSegments.length})
                        </h3>
                        <div className="flex flex-col gap-4">
                          {result.plagiarismDetails.matchedSegments.map((seg, i) => (
                            <div
                              key={i}
                              className="bg-white dark:bg-card-dark rounded-2xl border border-red-100 dark:border-red-900/30 p-5 shadow-sm"
                            >
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic bg-red-50 dark:bg-red-900/10 p-4 rounded-xl mb-4">
                                &ldquo;{seg.text}&rdquo;
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span
                                  className={`px-2.5 py-1 font-bold rounded-lg capitalize ${getTypeBadge(seg.type)}`}
                                >
                                  {seg.type} ({seg.similarityPercent}%)
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 line-clamp-1">
                                  Source: {seg.possibleSource}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {result.plagiarismDetails.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── AI DETECTION ── */}
                {activeResultTab === 'ai' && result.aiDetectionDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          AI Probability
                        </p>
                        <div className="flex items-baseline gap-3">
                          <span
                            className={`text-4xl font-black ${getScoreColor(100 - result.aiDetectionDetails.aiProbabilityScore)}`}
                          >
                            {result.aiDetectionDetails.aiProbabilityScore}%
                          </span>
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg ${result.aiDetectionDetails.aiProbabilityScore <= 30 ? 'bg-emerald-50 text-emerald-700' : result.aiDetectionDetails.aiProbabilityScore <= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}
                          >
                            {result.aiDetectionDetails.aiProbabilityScore <= 30
                              ? 'Human'
                              : result.aiDetectionDetails.aiProbabilityScore <= 60
                                ? 'Mixed'
                                : 'Likely AI'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getScoreBg(100 - result.aiDetectionDetails.aiProbabilityScore)}`}
                            style={{ width: `${result.aiDetectionDetails.aiProbabilityScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Confidence
                        </p>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                          {result.aiDetectionDetails.confidence}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Perplexity
                        </p>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                          {result.aiDetectionDetails.perplexityLevel}
                        </span>
                      </div>
                    </div>
                    {result.aiDetectionDetails.detectedPatterns.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Detected Patterns
                        </h3>
                        <div className="flex flex-col gap-3">
                          {result.aiDetectionDetails.detectedPatterns.map((pattern, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4"
                            >
                              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">{pattern}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Verdict
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {result.aiDetectionDetails.verdict}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── HALLUCINATIONS ── */}
                {activeResultTab === 'hallucinations' && result.hallucinationDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Claims Checked
                        </p>
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                          {result.hallucinationDetails.totalClaimsChecked}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Verified
                        </p>
                        <span className="text-4xl font-black text-emerald-500">
                          {result.hallucinationDetails.verifiedClaims}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Risk Level
                        </p>
                        <span
                          className={`text-sm font-bold px-4 py-1.5 rounded-full uppercase ${getRiskBadge(result.hallucinationDetails.hallucinationRisk)}`}
                        >
                          {result.hallucinationDetails.hallucinationRisk}
                        </span>
                      </div>
                    </div>
                    {result.hallucinationDetails.unverifiedClaims.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" /> Unverified
                          Claims ({result.hallucinationDetails.unverifiedClaims.length})
                        </h3>
                        <div className="flex flex-col gap-4">
                          {result.hallucinationDetails.unverifiedClaims.map((claim, i) => (
                            <div
                              key={i}
                              className="bg-white dark:bg-card-dark rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5 shadow-sm"
                            >
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl mb-3 italic">
                                &ldquo;{claim.claim}&rdquo;
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                {claim.issue}
                              </p>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase ${claim.severity === 'high' ? 'bg-red-100 text-red-800' : claim.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                                >
                                  {claim.severity}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {claim.suggestion}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {result.hallucinationDetails.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── WRITING FEEDBACK ── */}
                {activeResultTab === 'feedback' && result.feedbackDetails && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Overall', score: result.feedbackDetails.overallScore },
                        { label: 'Grammar', score: result.feedbackDetails.grammarScore },
                        { label: 'Clarity', score: result.feedbackDetails.clarityScore },
                        { label: 'Tone', score: result.feedbackDetails.toneScore },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm text-center hover:shadow-md transition-shadow"
                        >
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {item.label}
                          </p>
                          <p className={`text-3xl font-black mt-1 ${getScoreColor(item.score)}`}>
                            {item.score}
                          </p>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${getScoreBg(item.score)}`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {result.feedbackDetails.strengths.length > 0 && (
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                          {'\u2705'} Strengths
                        </h3>
                        <div className="space-y-2">
                          {result.feedbackDetails.strengths.map((s, i) => (
                            <p
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-emerald-300"
                            >
                              {s}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.feedbackDetails.grammarIssues.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Grammar Issues ({result.feedbackDetails.grammarIssues.length})
                        </h3>
                        <div className="flex flex-col gap-3">
                          {result.feedbackDetails.grammarIssues.map((issue, i) => (
                            <div
                              key={i}
                              className="bg-white dark:bg-card-dark rounded-2xl border border-sky-100 dark:border-sky-900/30 p-5 shadow-sm"
                            >
                              <span className="text-xs px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-bold capitalize">
                                {issue.type}
                              </span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
                                <span className="line-through text-red-400">{issue.text}</span>
                                <span className="mx-2">{'\u2192'}</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {issue.correction}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {issue.issue}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.feedbackDetails.suggestions.length > 0 && (
                      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                          {'\uD83D\uDCA1'} Suggestions
                        </h3>
                        <div className="space-y-2">
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
                    <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {result.feedbackDetails.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>

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
