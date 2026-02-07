import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import { ThemeToggle } from './ThemeToggle';

interface PlagiarismResult {
  originalityScore: number;
  aiScore: number;
  citationQuality: string;
  readabilityLevel: string;
  sourcesFound: number;
  isOriginal: boolean;
}

export default function PlagiarismChecker({ navigateTo }: NavigationProps) {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  const handleCheck = async () => {
    if (!textContent.trim()) {
      setError('Please enter some text to check');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await aiApi.checkPlagiarism(textContent);
      const data = response.data as PlagiarismResult;
      setResult(data);
    } catch (err: any) {
      console.error('Failed to check plagiarism:', err);
      setError(err.response?.data?.error || 'Failed to check content. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

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
          <span className="material-symbols-outlined text-[18px]">folder_open</span>
          My Reports
        </button>
      </div>
    </header>
  );

  return (
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
                onChange={(e) => setTextContent(e.target.value)}
              ></textarea>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-xs text-text-sub">
                  <span className="material-symbols-outlined text-sm">text_fields</span>
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-sm font-medium text-text-sub hover:text-primary transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">upload_file</span>
                    Upload File
                  </button>
                  <button
                    onClick={handleCheck}
                    disabled={isChecking || !textContent.trim()}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChecking ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">sync</span>
                        Checking...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">search_check</span>
                        Check Content
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Originality Score */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">verified_user</span>
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
                    className="text-green-500 stroke-current transition-all duration-1000 ease-out"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    strokeDasharray="251.2"
                    strokeDashoffset="30"
                    strokeLinecap="round"
                    strokeWidth="8"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-text-main dark:text-white">
                    {result?.originalityScore ?? 88}%
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded mt-1 ${(result?.isOriginal ?? true) ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}
                  >
                    {(result?.isOriginal ?? true) ? 'Passed' : 'Review Needed'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-center text-text-sub max-w-[200px] z-10">
                High originality detected. Minor similarities found in 2 sources.
              </p>
            </div>

            {/* Detail Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <span className="text-2xl font-bold text-text-main dark:text-white">
                    {result?.aiScore ?? 12}%
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                    Likely AI Content
                  </h4>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{ width: `${result?.aiScore ?? 12}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-sub mt-2">Low probability of AI generation.</p>
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">format_quote</span>
                  </div>
                  <span className="text-2xl font-bold text-text-main dark:text-white">Good</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                    Citation Quality
                  </h4>
                  <p className="text-xs text-text-sub mt-1">14 Citations found.</p>
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                    <span className="material-symbols-outlined">menu_book</span>
                  </div>
                  <span className="text-2xl font-bold text-text-main dark:text-white">College</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                    Readability Level
                  </h4>
                  <p className="text-xs text-text-sub">Appropriate for academic submission.</p>
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined">link</span>
                  </div>
                  <span className="text-2xl font-bold text-text-main dark:text-white">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">
                    Matches Found
                  </h4>
                  <p className="text-xs text-text-sub">Wikipedia, Scribd</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
