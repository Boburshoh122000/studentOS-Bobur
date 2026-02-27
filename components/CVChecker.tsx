import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import { useCredits } from '../src/contexts/CreditContext';
import { CheckCircleIcon, ClockIcon, CloudArrowUpIcon, DocumentTextIcon, ExclamationCircleIcon, ExclamationTriangleIcon, KeyIcon, MagnifyingGlassIcon, MinusIcon, PencilSquareIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface CVAnalysisResult {
  score: number;
  missing_keywords: string[];
  weaknesses: string[];
  actionable_fixes: string[];
  // Legacy fields
  feedback?: string[];
  suggestions?: string[];
  keywords?: { found: string[]; missing: string[] };
}

export default function CVChecker({ navigateTo }: NavigationProps) {
  const { refreshBalance } = useCredits();
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scan history state
  interface ScanHistoryItem {
    id: string;
    score: number;
    jobRole: string | null;
    fileName: string | null;
    createdAt: string;
  }
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch scan history
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

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Relative time helper
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
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Credit-gate modal state (402 from backend triggers this)
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [creditErrorData, setCreditErrorData] = useState<{
    required: number;
    available: number;
    shortfall: number;
    toolName: string;
  } | null>(null);

  const handleAnalyzeCV = async () => {
    if (!cvText.trim()) {
      setError('Please enter your CV text');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await aiApi.analyzeCV(cvText, jobDescription || undefined);

      // Handle 402 Insufficient Credits from backend
      if (response.error && (response.data as any)?.code === 'INSUFFICIENT_CREDITS') {
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

      if (response.error) {
        throw new Error(response.error);
      }
      const data = response.data as CVAnalysisResult;
      setAnalysisResult(data);
      fetchHistory(); // refresh scan history sidebar
      refreshBalance(); // sync credit balance in sidebar
    } catch (err: unknown) {
      console.error('Failed to analyze CV:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to analyze CV. Please try again.';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB size limit
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);
    setIsExtracting(true);

    try {
      // For plain text files, read directly on the client
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        setCvText(text.substring(0, 20000));
        setIsExtracting(false);
        return;
      }

      // For PDF/DOCX, call the backend extract-text endpoint
      const response = await aiApi.extractText(file);
      if (response.error) {
        throw new Error(response.error);
      }
      const data = response.data!;
      setCvText(data.extractedText);
    } catch (err: unknown) {
      console.error('Failed to extract text from file:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to extract text from file. Please try pasting the text directly.';
      setError(errorMessage);
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
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! Your CV is well-optimized.';
    if (score >= 60) return 'Good progress! A few improvements needed.';
    return 'Needs work. Follow the suggestions below.';
  };

  const headerContent = (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] backdrop-blur-sm px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          StudentOS
        </h1>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
        <span className="text-sm font-medium text-slate-500">
          ATS Checker
        </span>
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

  // Empty state - show when no analysis
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

  // Results display
  const ResultsPanel = () => {
    if (!analysisResult) return <EmptyState />;

    const score = analysisResult.score;
    const missingKeywords =
      analysisResult.missing_keywords || analysisResult.keywords?.missing || [];
    const weaknesses = analysisResult.weaknesses || analysisResult.feedback || [];
    const fixes = analysisResult.actionable_fixes || analysisResult.suggestions || [];

    return (
      <div className="flex flex-col gap-6 overflow-y-auto hide-scrollbar pb-10">
        {/* Score Card */}
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
                  className={
                    score >= 80
                      ? 'text-green-500'
                      : score >= 60
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  strokeDasharray={`${score}, 100`}
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold ${getScoreColor(score)}`}>
                  {score}
                  <span className="text-xl text-slate-400">%</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  ATS Score
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {getScoreMessage(score)}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                  Your resume has been analyzed for ATS compatibility.
                  {missingKeywords.length > 0 &&
                    ` Adding ${missingKeywords.length} missing keywords could improve your score.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Missing Keywords */}
          <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                <KeyIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Missing Keywords</h3>
            </div>
            {missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-medium rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No missing keywords detected!</p>
            )}
          </div>

          {/* Weaknesses */}
          <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Weaknesses</h3>
            </div>
            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknesses.slice(0, 5).map((weakness, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <MinusIcon className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                    {weakness}
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
              <p className="text-xs text-slate-400">Personalized improvements for your resume</p>
            </div>
          </div>
          <div className="space-y-3">
            {fixes.length > 0 ? (
              fixes.map((fix, index) => (
                <div
                  key={index}
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
    );
  };

  return (
    <>
      <DashboardLayout
        currentScreen={Screen.ATS_CHECKER}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
          <div className={`mx-auto transition-all duration-500 ease-in-out ${analysisResult ? 'max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6' : 'max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
            {/* Left Panel - Input */}
            <div className={`flex flex-col gap-5 ${analysisResult ? 'lg:col-span-4 h-full overflow-y-auto hide-scrollbar pb-10' : 'lg:col-span-2'}`}>

              {/* Card wrapper for input section */}
              <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">

                {/* Mode Switcher — Pill style */}
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
                          <ArrowPathIcon className="w-5 h-5" className="text-primary animate-spin" />
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
                          <ArrowPathIcon className="w-5 h-5" className="text-primary animate-spin" />
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
                          {analysisResult ? <CheckCircleIcon className="w-5 h-5" className="text-green-600" /> : <DocumentTextIcon className="w-5 h-5" className="text-primary" />}
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
                          <CloudArrowUpIcon className="w-5 h-5" className="text-indigo-400" />
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
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
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

                {/* Job Description Input + Analyze Button for Upload Mode */}
                {inputMode === 'upload' && (
                  <div className="flex flex-col gap-3">
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
                {/* Recent Scans Card */}
                <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="w-[18px] h-[18px] text-indigo-500" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Scans</h3>
                  </div>

                  {historyLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <ArrowPathIcon className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : scanHistory.length === 0 ? (
                    <div className="text-center py-6">
                      <DocumentTextIcon className="w-6 h-6 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">No scans yet</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Upload a CV to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {scanHistory.map((scan) => (
                        <div
                          key={scan.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <DocumentTextIcon className="w-5 h-5" className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                {scan.fileName || scan.jobRole || 'CV Analysis'}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <ClockIcon className="w-5 h-5" />
                                {timeAgo(scan.createdAt)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${scan.score >= 80
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

                {/* Pro Tip Card */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">💡 Pro Tip</h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                    Tailoring your resume to the specific job description keywords can increase your ATS match rate by up to 50%.
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
