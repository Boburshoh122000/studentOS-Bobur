import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import { AlertCircle, AlertTriangle, CheckCircle, CloudUpload, FileText, KeyRound, Minus, NotebookPen, Plus, RefreshCw, Search, Sparkles } from 'lucide-react';

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
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        <FileText size={36} className="text-slate-400" />
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
                <KeyRound size={20} />
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
                <AlertTriangle size={20} />
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
                    <Minus size={14} className="text-amber-500 mt-0.5" />
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
              <Sparkles size={20} className="text-white" />
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
                    <Plus size={12} className="text-green-400" />
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
        <div className="flex-1 overflow-hidden bg-background-light dark:bg-background-dark p-6">
          <div className="h-full grid grid-cols-12 gap-6 max-w-7xl mx-auto">
            {/* Left Panel - Input */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto hide-scrollbar pb-10">
              {/* Mode Switcher */}
              <div className="flex mb-4 gap-2">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${inputMode === 'upload' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  <CloudUpload size={16} className="mr-1 align-middle inline" />
                  Upload
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${inputMode === 'text' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  <NotebookPen size={16} className="mr-1 align-middle inline" />
                  Paste Text
                </button>
              </div>

              {inputMode === 'upload' ? (
                <div
                  onClick={() => !isExtracting && !isAnalyzing && fileInputRef.current?.click()}
                  className={`bg-white dark:bg-card-dark rounded-2xl border-2 border-dashed ${isExtracting ? 'border-primary/60' : isAnalyzing ? 'border-slate-300' : 'border-primary/40 hover:bg-primary/10 cursor-pointer'} bg-primary/5 p-8 flex flex-col items-center justify-center text-center gap-4 transition-all group relative overflow-hidden shadow-sm`}
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
                        <RefreshCw size={30} className="text-primary animate-spin" />
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
                        <RefreshCw size={30} className="text-primary animate-spin" />
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
                        {analysisResult ? <CheckCircle size={30} className="text-green-600" /> : <FileText size={30} className="text-primary" />}
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
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CloudUpload size={30} className="text-primary" />
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
                      className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                      className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeCV}
                    disabled={isAnalyzing || !cvText.trim()}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
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
                    <AlertCircle size={20} className="text-red-500" />
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
                      className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeCV}
                    disabled={isExtracting || isAnalyzing || !cvText.trim()}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Extracting text...
                      </>
                    ) : isAnalyzing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        Analyze CV
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Panel - Results */}
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full overflow-y-auto hide-scrollbar">
              <ResultsPanel />
            </div>
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
