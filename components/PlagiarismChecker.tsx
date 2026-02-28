import React, { useState } from 'react';
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
  LanguageIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';

interface PlagiarismResult {
  originalityScore: number;
  aiScore: number;
  citationQuality: string;
  readabilityLevel: string;
  sourcesFound: number;
  isOriginal: boolean;
  summary: string;
  matchedSources: string[];
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
    icon: ExclamationCircleIcon,
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
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['advanced-ai']);
  const [copied, setCopied] = useState(false);
  const { balance } = useCredits();

  // Credit-gate modal state
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [creditErrorData, setCreditErrorData] = useState<{
    required: number;
    available: number;
    shortfall: number;
    toolName: string;
  } | null>(null);

  const handleCheck = async () => {
    if (!textContent.trim()) {
      setError('Please enter some text to check');
      return;
    }
    const words = textContent.trim().split(/\s+/).filter(Boolean);
    if (words.length < 20) {
      setError('Please enter at least 20 words for an accurate analysis.');
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      const response = await aiApi.checkPlagiarism(textContent);
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
      setResult(response.data as PlagiarismResult);
    } catch (err: unknown) {
      console.error('Failed to check plagiarism:', err);
      setError(err instanceof Error ? err.message : 'Failed to check content. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

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

  // Color helpers
  const circumference = 2 * Math.PI * 40;
  const originality = result?.originalityScore ?? 0;
  const strokeDashoffset = circumference - (originality / 100) * circumference;

  const getOriginalityColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  const getAIBarColor = (score: number) => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const getAIProbLabel = (score: number) => {
    if (score <= 20) return 'Low probability of AI generation.';
    if (score <= 50) return 'Moderate probability of AI generation.';
    return 'High probability of AI generation.';
  };

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
                <span className="font-semibold text-gray-800 dark:text-white text-sm">
                  Untitled Document
                </span>
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

            {/* Error Banner (inline in editor) */}
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
                  Cost: <span className="text-gray-900 dark:text-white">10 Credits</span>
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

        {/* ═══════ Results Overlay (slides in when result exists) ═══════ */}
        {result && !isChecking && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card-dark rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 border border-gray-200 dark:border-gray-700">
              {/* Close button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-6 h-6 text-indigo-500" />
                  Analysis Results
                </h2>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Originality Score */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white z-10">
                    Originality Score
                  </h3>
                  <div className="relative w-40 h-40 z-10">
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
                        className={`${getOriginalityColor(result.originalityScore)} stroke-current transition-all duration-1000 ease-out`}
                        cx="50"
                        cy="50"
                        fill="none"
                        r="40"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        strokeWidth="8"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {result.originalityScore}%
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded mt-1 ${result.isOriginal ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}
                      >
                        {result.isOriginal ? 'Passed' : 'Review Needed'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-[200px] z-10">
                    {result.summary}
                  </p>
                </div>

                {/* Detail Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* AI Content */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                        <CpuChipIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {result.aiScore}%
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                      Likely AI Content
                    </h4>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${getAIBarColor(result.aiScore)} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${result.aiScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {getAIProbLabel(result.aiScore)}
                    </p>
                  </div>

                  {/* Citation Quality */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {result.citationQuality}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                      Citation Quality
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {result.sourcesFound > 0
                        ? `${result.sourcesFound} citation${result.sourcesFound !== 1 ? 's' : ''} found.`
                        : 'No citations detected.'}
                    </p>
                  </div>

                  {/* Readability */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                        <BookOpenIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {result.readabilityLevel}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                      Readability Level
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {result.readabilityLevel === 'College' ||
                      result.readabilityLevel === 'Graduate'
                        ? 'Appropriate for academic submission.'
                        : result.readabilityLevel === 'Professional'
                          ? 'Professional-level writing.'
                          : `${result.readabilityLevel} reading level.`}
                    </p>
                  </div>

                  {/* Matches Found */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {result.matchedSources.length}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                      Matches Found
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {result.matchedSources.length > 0
                        ? result.matchedSources.join(', ')
                        : 'No potential source matches found.'}
                    </p>
                  </div>
                </div>
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
