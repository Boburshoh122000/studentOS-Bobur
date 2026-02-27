import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import { ThemeToggle } from './ThemeToggle';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import { BookOpenIcon, ChatBubbleBottomCenterTextIcon, CpuChipIcon, DocumentArrowUpIcon, ExclamationCircleIcon, FolderOpenIcon, LanguageIcon, LinkIcon, MagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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

export default function PlagiarismChecker({ navigateTo }: NavigationProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  // Credit-gate modal state (402 from backend triggers this)
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

      // Handle 402 Insufficient Credits from backend
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

      if (response.error) {
        throw new Error(response.error);
      }

      const data = response.data as PlagiarismResult;
      setResult(data);
    } catch (err: unknown) {
      console.error('Failed to check plagiarism:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to check content. Please try again.';
      setError(errorMessage);
    } finally {
      setIsChecking(false);
    }
  };

  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

  // Dynamic SVG circle calculation
  const circumference = 2 * Math.PI * 40; // r=40
  const originality = result?.originalityScore ?? 0;
  const strokeDashoffset = circumference - (originality / 100) * circumference;

  // Color helpers
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

  const headerContent = (
    <header className="h-20 border-b border-gray-200 dark:border-gray-800 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm px-8 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-text-main dark:text-white tracking-tight">
          Plagiarism & AI Checker
        </h1>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          Pro Plan
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg">
          <FolderOpenIcon className="w-[18px] h-[18px]" />
          My Reports
        </button>
      </div>
    </header>
  );

  return (
    <>
      <DashboardLayout
        currentScreen={Screen.PLAGIARISM}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-10">
            {/* Input Section */}
            <section className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'text' ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-800/50' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
                >
                  Text Input
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'file' ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-800/50' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
                >
                  File Upload
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'url' ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-800/50' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
                >
                  URL Check
                </button>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full h-40 bg-transparent border-0 focus:ring-0 resize-none text-text-main dark:text-gray-300 placeholder:text-gray-400 text-sm leading-relaxed p-0 focus:outline-none"
                  placeholder="Paste your essay, article, or research paper here to check for plagiarism and AI-generated content..."
                  value={textContent}
                  onChange={(e) => {
                    setTextContent(e.target.value);
                    if (error) setError(null);
                  }}
                ></textarea>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-text-sub">
                    <LanguageIcon className="w-3.5 h-3.5" />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-sm font-medium text-text-sub hover:text-primary transition-colors flex items-center gap-1">
                      <DocumentArrowUpIcon className="w-[18px] h-[18px]" />
                      Upload File
                    </button>
                    <button
                      onClick={handleCheck}
                      disabled={isChecking || !textContent.trim()}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChecking ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="w-5 h-5" />
                          Check Content
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="w-[18px] h-[18px]" />
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {isChecking && !result && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center gap-6 animate-pulse">
                  <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="size-48 rounded-full border-8 border-gray-200 dark:border-gray-700" />
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm animate-pulse"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Grid — shown only when result exists */}
            {result && !isChecking && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Originality Score */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-main dark:text-white z-10">
                    Originality Score
                  </h3>
                  <div className="relative size-48 z-10">
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-100 dark:text-gray-800 stroke-current"
                        cx="50"
                        cy="50"
                        fill="none"
                        r="40"
                        strokeWidth="8"
                      ></circle>
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
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-text-main dark:text-white">
                        {result.originalityScore}%
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded mt-1 ${result.isOriginal ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}
                      >
                        {result.isOriginal ? 'Passed' : 'Review Needed'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-center text-text-sub max-w-[220px] z-10">
                    {result.summary}
                  </p>
                </div>

                {/* Detail Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* AI Content */}
                  <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                        <CpuChipIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-text-main dark:text-white">
                        {result.aiScore}%
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                        Likely AI Content
                      </h4>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${getAIBarColor(result.aiScore)} h-full rounded-full transition-all duration-700`}
                          style={{ width: `${result.aiScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-text-sub mt-2">{getAIProbLabel(result.aiScore)}</p>
                    </div>
                  </div>

                  {/* Citation Quality */}
                  <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-text-main dark:text-white">
                        {result.citationQuality}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                        Citation Quality
                      </h4>
                      <p className="text-xs text-text-sub mt-1">
                        {result.sourcesFound > 0
                          ? `${result.sourcesFound} citation${result.sourcesFound !== 1 ? 's' : ''} found.`
                          : 'No citations detected.'}
                      </p>
                    </div>
                  </div>

                  {/* Readability Level */}
                  <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                        <BookOpenIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-text-main dark:text-white">
                        {result.readabilityLevel}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                        Readability Level
                      </h4>
                      <p className="text-xs text-text-sub">
                        {result.readabilityLevel === 'College' ||
                          result.readabilityLevel === 'Graduate'
                          ? 'Appropriate for academic submission.'
                          : result.readabilityLevel === 'Professional'
                            ? 'Professional-level writing.'
                            : `${result.readabilityLevel} reading level.`}
                      </p>
                    </div>
                  </div>

                  {/* Matches Found */}
                  <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold text-text-main dark:text-white">
                        {result.matchedSources.length}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                        Matches Found
                      </h4>
                      <p className="text-xs text-text-sub">
                        {result.matchedSources.length > 0
                          ? result.matchedSources.join(', ')
                          : 'No potential source matches found.'}
                      </p>
                    </div>
                  </div>
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
