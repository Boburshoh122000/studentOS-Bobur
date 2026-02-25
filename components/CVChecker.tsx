import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import CVBuilder from './cv-builder/CVBuilder';
import { useCreditTransaction } from '../src/hooks/useCreditTransaction';
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
  const [activeMode, setActiveMode] = useState<'builder' | 'ats'>('ats');
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Credit system integration
  const { toolInfo, executeTransaction } = useCreditTransaction('cv-maker');
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

    // Check credits before proceeding (skip for free tools)
    if (toolInfo && toolInfo.creditCost > 0) {
      const result = await executeTransaction();
      if (!result.success) {
        if (result.error === 'INSUFFICIENT_CREDITS' && result.data) {
          setCreditErrorData({
            required: result.data.required || toolInfo.creditCost,
            available: result.data.available || 0,
            shortfall: result.data.shortfall || toolInfo.creditCost,
            toolName: result.data.toolName || toolInfo.name,
          });
          setShowInsufficientModal(true);
        } else {
          setError(result.error || 'Failed to process credits');
        }
        return;
      }
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await aiApi.analyzeCV(cvText, jobDescription || undefined);
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
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            StudentOS
          </h1>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
          {analysisResult ? <CheckCircle size={20} /> : <FileText size={20} />}
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
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <CVBuilder />
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
