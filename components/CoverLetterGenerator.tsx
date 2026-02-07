import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import { ThemeToggle } from './ThemeToggle';

export default function CoverLetterGenerator({ navigateTo }: NavigationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleGenerate = async () => {
    if (!company.trim() || !jobTitle.trim() || !jobDescription.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await aiApi.generateCoverLetter({
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        jobDescription: jobDescription.trim(),
      });
      setGeneratedLetter((response.data as { coverLetter: string }).coverLetter || '');
    } catch (err: any) {
      console.error('Failed to generate cover letter:', err);
      setError(err.response?.data?.error || 'Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const headerContent = (
    <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-text-main dark:text-white">
            AI Cover Letter Generator
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            BETA
          </span>
        </div>
        <p className="text-sm text-text-sub">
          Create personalized, professional cover letters in seconds.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-[18px]">history</span> History
        </button>
      </div>
    </header>
  );

  return (
    <DashboardLayout
      currentScreen={Screen.COVER_LETTER}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-full">
        {/* Input Section */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark">
          <div className="max-w-2xl mx-auto space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">
                  1
                </span>
                Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sub uppercase">
                    Company Name
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20"
                    type="text"
                    placeholder="e.g. TechFlow Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sub uppercase">Job Title</label>
                  <input
                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20"
                    type="text"
                    placeholder="e.g. Product Designer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-sub uppercase">
                  Job Description
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20 resize-none h-32"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">
                    2
                  </span>
                  Your Profile
                </h3>
                <button className="text-primary text-sm font-medium hover:underline">
                  Load from CV
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-sub uppercase">
                  Key Skills & Experience
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20 resize-none h-24"
                  placeholder="Highlight your relevant skills, past roles, or achievements..."
                ></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">
                  3
                </span>
                Tone & Style
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {['Professional', 'Enthusiastic', 'Creative'].map((tone) => (
                  <label key={tone} className="cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      className="peer sr-only"
                      defaultChecked={tone === 'Professional'}
                    />
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                      <span className="text-sm font-medium">{tone}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex-1 bg-gray-50 dark:bg-background-dark p-6 md:p-8 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-text-sub uppercase tracking-wider text-xs">Preview</h3>
            <div className="flex gap-2">
              <button
                className="p-2 text-text-sub hover:text-primary hover:bg-white dark:hover:bg-card-dark rounded-lg transition-colors"
                title="Copy"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
              <button
                className="p-2 text-text-sub hover:text-primary hover:bg-white dark:hover:bg-card-dark rounded-lg transition-colors"
                title="Download PDF"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 overflow-y-auto">
            {generatedLetter ? (
              <div className="whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                {generatedLetter}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">
                  description
                </span>
                <p className="text-sm">Your generated cover letter will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
