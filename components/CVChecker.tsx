import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';

interface CVAnalysisResult {
  atsScore: number;
  feedback: string;
  hardSkillsFound: number;
  softSkillsFound: number;
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: string[];
}

export default function CVChecker({ navigateTo }: NavigationProps) {
  const [activeMode, setActiveMode] = useState<'builder' | 'ats'>('ats');
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeCV = async () => {
    if (!cvText.trim()) {
      setError('Please enter your CV text');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await aiApi.analyzeCV(cvText, jobDescription || undefined);
      const data = response.data as CVAnalysisResult;
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Failed to analyze CV:', err);
      setError(err.response?.data?.error || 'Failed to analyze CV. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await aiApi.uploadCV(file, jobDescription || undefined);
      if (response.error) {
        setError(response.error);
      } else {
        const data = response.data as { extractedText: string; analysis: any };
        setCvText(data.extractedText);
        setAnalysisResult({
          atsScore: data.analysis.score,
          feedback: data.analysis.feedback?.join('\n') || '',
          hardSkillsFound: data.analysis.keywords?.found?.length || 0,
          softSkillsFound: 0,
          missingKeywords: data.analysis.keywords?.missing || [],
          presentKeywords: data.analysis.keywords?.found || [],
          suggestions: data.analysis.suggestions || [],
        });
      }
    } catch (err: any) {
      console.error('Failed to upload CV:', err);
      setError(err.message || 'Failed to upload and analyze CV.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const headerContent = (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] backdrop-blur-sm px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            StudentOS
          </h1>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
          <span className="text-sm font-medium text-slate-500">
            {activeMode === 'ats' ? 'ATS Checker' : 'CV Builder'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveMode('builder')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeMode === 'builder' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            CV Builder
          </button>
          <button
            onClick={() => setActiveMode('ats')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeMode === 'ats' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            ATS Checker
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-400 font-medium mr-2">Last saved: 1 min ago</div>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>
    </header>
  );

  return (
    <DashboardLayout
      currentScreen={Screen.CV_ATS}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      {activeMode === 'ats' ? (
        <div className="flex-1 overflow-hidden bg-background-light dark:bg-background-dark p-6">
          <div className="h-full grid grid-cols-12 gap-6 max-w-7xl mx-auto">
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto hide-scrollbar pb-10">
              {/* Mode Switcher */}
              <div className="flex mb-4 gap-2">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${inputMode === 'upload' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-[16px] mr-1 align-middle">
                    cloud_upload
                  </span>
                  Upload
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${inputMode === 'text' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-[16px] mr-1 align-middle">
                    edit_note
                  </span>
                  Paste Text
                </button>
              </div>

              {inputMode === 'upload' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white dark:bg-card-dark rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-8 flex flex-col items-center justify-center text-center gap-4 transition-all hover:bg-primary/10 group cursor-pointer relative overflow-hidden shadow-sm"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload CV file"
                  />
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-primary text-3xl animate-spin">
                          sync
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        Analyzing CV...
                      </h3>
                      <p className="text-sm text-slate-500">{selectedFile?.name}</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 text-3xl">
                          check_circle
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {selectedFile.name}
                      </h3>
                      <p className="text-sm text-primary cursor-pointer hover:underline">
                        Click to upload a different file
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-primary text-3xl">
                          cloud_upload
                        </span>
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
                      <p className="text-xs text-slate-400">PDF, DOCX up to 10MB</p>
                    </>
                  )}
                  {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>
              ) : (
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-sm">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                      Your CV / Resume Text
                    </label>
                    <textarea
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      placeholder="Paste your CV or resume text here..."
                      className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                      Job Description (Optional)
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description for targeted analysis..."
                      className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button
                    onClick={handleAnalyzeCV}
                    disabled={isAnalyzing || !cvText.trim()}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">
                          sync
                        </span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">search_check</span>
                        Analyze CV
                      </>
                    )}
                  </button>
                </div>
              )}
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 min-h-[300px]">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    Recently Scanned
                  </h3>
                  <button className="text-xs text-primary font-medium hover:underline">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="p-4 bg-primary/5 flex items-center gap-3 cursor-pointer border-l-4 border-primary">
                    <div className="size-10 rounded-lg bg-white dark:bg-slate-700 text-red-500 shadow-sm flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                        Alex_Smith_Resume_Final.pdf
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Scanned for Frontend Dev roles
                      </p>
                    </div>
                    <span className="text-xl font-bold text-primary">85%</span>
                  </div>
                  <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-500 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">
                        Resume_V2.docx
                      </p>
                      <p className="text-xs text-slate-400 truncate">General analysis</p>
                    </div>
                    <span className="text-xl font-bold text-slate-400">72%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-y-auto hide-scrollbar pb-10">
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative size-36 md:size-40 shrink-0">
                    <div
                      className="size-full rounded-full shadow-inner"
                      style={{
                        background: `conic-gradient(#2e2ee0 ${analysisResult?.atsScore || 85}%, #e2e8f0 0)`,
                      }}
                    ></div>
                    <div className="absolute inset-3 bg-white dark:bg-card-dark rounded-full flex flex-col items-center justify-center shadow-md">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        {analysisResult?.atsScore || 85}
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
                        {(analysisResult?.atsScore || 85) >= 80
                          ? 'Excellent! Your CV is optimized.'
                          : 'Your CV needs some improvements.'}
                      </h2>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                        Your resume parses correctly and matches{' '}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {analysisResult?.atsScore || 85}%
                        </strong>{' '}
                        of the keywords for{' '}
                        <span className="text-primary font-bold bg-primary/5 px-1 rounded">
                          Junior Frontend Developer
                        </span>
                        . A few tweaks to your skills section could push this to 95%.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                      <div className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Hard Skills
                          </span>
                          <span className="block text-lg font-bold text-slate-900 dark:text-white">
                            {analysisResult?.hardSkillsFound || 12}
                            <span className="text-slate-400 text-sm">/15</span>
                          </span>
                        </div>
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="size-2 rounded-full bg-yellow-500"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Soft Skills
                          </span>
                          <span className="block text-lg font-bold text-slate-900 dark:text-white">
                            {analysisResult?.softSkillsFound || 6}
                            <span className="text-slate-400 text-sm">/8</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <span className="material-symbols-outlined">key</span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Keyword Match</h3>
                  </div>
                  <div className="space-y-5 flex-1">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-700 dark:text-slate-300">
                          Required Keywords
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400">85%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-700 dark:text-slate-300">
                          Recommended Keywords
                        </span>
                        <span className="text-indigo-400 dark:text-indigo-300">60%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-300 dark:bg-indigo-600 w-[60%] rounded-full"></div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap gap-2">
                        {(analysisResult?.presentKeywords || ['React', 'Javascript'])
                          .slice(0, 2)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded uppercase"
                            >
                              {keyword}
                            </span>
                          ))}
                        {(analysisResult?.missingKeywords || ['TypeScript'])
                          .slice(0, 1)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded uppercase line-through decoration-red-600"
                            >
                              {keyword}
                            </span>
                          ))}
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold rounded uppercase">
                          +5 more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                      <span className="material-symbols-outlined">format_list_bulleted</span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Format Check</h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Contact info is parseable
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        PDF format is ATS-friendly
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Standard section headings
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-amber-500">warning</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Consider adding LinkedIn URL
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-red-500">cancel</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Summary section is too long
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <span className="material-symbols-outlined text-white">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-bold">AI-Powered Suggestions</h3>
                    <p className="text-xs text-slate-400">
                      Personalized improvements for your resume
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                      <span className="material-symbols-outlined text-green-400 text-xs">add</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Add 'TypeScript' to skills section
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        It appears in your work experience description but is missing from your core
                        skills list which bots scan first.
                      </p>
                    </div>
                  </div>
                  <div aria-hidden="true" className="space-y-3 relative select-none">
                    <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 blur-[4px] opacity-40">
                      <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-green-400 text-xs">
                          add
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Quantify your achievements</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Add metrics to 3 more bullet points to show impact.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 blur-[4px] opacity-40">
                      <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-green-400 text-xs">
                          add
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Reduce document length</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Your CV exceeds 2 pages. Condense older roles.
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent rounded-b-2xl">
                      <button className="bg-white text-slate-900 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-black/50 transition-all hover:scale-105 flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors">
                          lock_open
                        </span>
                        Unlock Full Analysis
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[450px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark overflow-y-auto no-scrollbar flex flex-col">
            <div className="p-6 pb-20 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Editor</h2>
                <span className="text-xs text-slate-400">All changes saved automatically</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Personal Details
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">
                    expand_less
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-1 space-y-1">
                    <label
                      htmlFor="cv-first-name"
                      className="text-[11px] font-medium text-slate-500 uppercase"
                    >
                      First Name
                    </label>
                    <input
                      id="cv-first-name"
                      type="text"
                      defaultValue="Alex"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label
                      htmlFor="cv-last-name"
                      className="text-[11px] font-medium text-slate-500 uppercase"
                    >
                      Last Name
                    </label>
                    <input
                      id="cv-last-name"
                      type="text"
                      defaultValue="Smith"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label
                      htmlFor="cv-job-title"
                      className="text-[11px] font-medium text-slate-500 uppercase"
                    >
                      Job Title
                    </label>
                    <input
                      id="cv-job-title"
                      type="text"
                      defaultValue="Junior Frontend Developer"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label
                      htmlFor="cv-email"
                      className="text-[11px] font-medium text-slate-500 uppercase"
                    >
                      Email
                    </label>
                    <input
                      id="cv-email"
                      type="email"
                      defaultValue="alex.smith@student.edu"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label
                      htmlFor="cv-phone"
                      className="text-[11px] font-medium text-slate-500 uppercase"
                    >
                      Phone
                    </label>
                    <input
                      id="cv-phone"
                      type="tel"
                      defaultValue="+1 (555) 000-1234"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label
                      htmlFor="cv-location"
                      className="text-[11px] font-medium text-slate-500 uppercase"
                    >
                      Location
                    </label>
                    <input
                      id="cv-location"
                      type="text"
                      defaultValue="San Francisco, CA"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">
                      summarize
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Professional Summary
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">
                      work
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Experience
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">
                      school
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Education
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">
                      psychology
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Skills & Tools
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">
                      translate
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Languages
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">
                    expand_more
                  </span>
                </div>
              </div>
              <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add Custom Section
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-100 dark:bg-[#0B0D15] relative overflow-hidden flex flex-col">
            <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-1 flex flex-col items-center">
                <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
                <div className="h-px w-4 bg-slate-200 dark:bg-slate-700"></div>
                <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center items-start">
              <div className="resume-paper bg-white text-black shadow-xl shrink-0 origin-top transform scale-90 lg:scale-100 transition-transform duration-300">
                <div className="p-8 flex flex-col gap-6">
                  <div className="border-b-2 border-slate-900 pb-5">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase mb-1">
                      Alex Smith
                    </h1>
                    <p className="text-xl text-primary font-bold">Junior Frontend Developer</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">email</span>
                        alex.smith@student.edu
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        +1 (555) 000-1234
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        San Francisco, CA
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">link</span>
                        linkedin.com/in/alexsmith
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">
                      Summary
                    </h2>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      Passionate and detail-oriented Frontend Developer with 2+ years of experience
                      building responsive, user-friendly web applications. Proficient in React.js,
                      JavaScript, and modern CSS frameworks. Seeking to leverage my skills in a
                      collaborative team environment to build impactful digital products.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">
                      Experience
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900 text-xs">
                            Frontend Developer Intern
                          </h3>
                          <span className="text-[10px] text-slate-500">Jun 2023 - Present</span>
                        </div>
                        <p className="text-[11px] text-primary font-semibold mb-1">
                          TechStartup Inc., San Francisco
                        </p>
                        <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-1">
                          <li>
                            Developed and maintained React components, improving page load times by
                            25%
                          </li>
                          <li>
                            Collaborated with UX team to implement pixel-perfect designs from Figma
                          </li>
                          <li>
                            Built a reusable component library, reducing development time by 2 weeks
                          </li>
                        </ul>
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900 text-xs">Junior Web Developer</h3>
                          <span className="text-[10px] text-slate-500">Sep 2022 - May 2023</span>
                        </div>
                        <p className="text-[11px] text-primary font-semibold mb-1">
                          University Web Team
                        </p>
                        <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-1">
                          <li>Redesigned the university's main landing page</li>
                          <li>Improved accessibility score to 98/100</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">
                      Education
                    </h2>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">
                          B.S. in Computer Science
                        </h3>
                        <p className="text-[11px] text-primary font-semibold">
                          San Francisco State University
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500">Expected May 2024</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">
                        Technical Skills
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          JavaScript (ES6+)
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          React.js
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          TypeScript
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          HTML5 & CSS3
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          Tailwind CSS
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          Git & GitHub
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          Figma
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          Node.js
                        </span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">
                        Languages
                      </h2>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-700 font-medium">English</span>
                          <span className="text-slate-500">Native</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[11px] mt-2">
                          <span className="text-slate-700 font-medium">Spanish</span>
                          <span className="text-slate-500">Intermediate</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
