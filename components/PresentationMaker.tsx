import { useState } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import { useCredits } from '../src/contexts/CreditContext';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import {
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PhotoIcon,
  PlusIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Slide {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  notes?: string;
}

interface PresentationData {
  title: string;
  author: string;
  slides: Slide[];
  theme: { primaryColor: string; accentColor: string };
}

export default function PresentationMaker({ navigateTo }: NavigationProps) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Credit system integration
  const { refreshBalance } = useCredits();
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [creditErrorData, setCreditErrorData] = useState<{
    required: number;
    available: number;
    shortfall: number;
    toolName: string;
  } | null>(null);

  const handleGeneratePresentation = async () => {
    if (!topic.trim()) {
      setError('Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await aiApi.generatePresentation({ topic, slideCount });

      // Handle 402 Insufficient Credits from backend middleware
      if (response.error && (response.data as any)?.code === 'INSUFFICIENT_CREDITS') {
        const errData = (response.data as any)?.data;
        setCreditErrorData({
          required: errData?.required || 0,
          available: errData?.available || 0,
          shortfall: errData?.shortfall || 0,
          toolName: errData?.toolName || 'Presentation Maker',
        });
        setShowInsufficientModal(true);
        return;
      }

      if (response.error) {
        setError(response.error);
      } else {
        setPresentation(response.data as PresentationData);
        setActiveSlideIndex(0);
        setShowGenerateModal(false);
        refreshBalance(); // sync credit balance in sidebar
      }
    } catch (err: unknown) {
      console.error('Failed to generate presentation:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate presentation. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSlide = presentation?.slides[activeSlideIndex];

  // Custom header for this page
  const headerContent = (
    <header className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark z-20">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Presentation Maker</span>
            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
            <input
              className="bg-transparent border-none p-0 text-sm font-bold text-text-main dark:text-white focus:ring-0 w-64 hover:bg-gray-50 rounded px-1 transition-colors"
              type="text"
              defaultValue="Modern Marketing Strategy"
            />
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
          Saved
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
          <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-card-dark shadow-sm text-text-main dark:text-white transition-all">
            Editor
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm font-medium text-text-sub hover:text-text-main transition-all">
            Design
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm font-medium text-text-sub hover:text-text-main transition-all">
            Prototype
          </button>
        </div>
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-200 dark:shadow-none"
        >
          <SparklesIcon className="w-[18px] h-[18px]" />
          AI Generate
        </button>
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium text-text-main dark:text-white transition-all">
            <ArrowDownTrayIcon className="w-[18px] h-[18px]" />
            Download PPTX/PDF
            <ChevronDownIcon className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );

  return (
    <>
      <DashboardLayout
        currentScreen={Screen.PRESENTATION}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex flex-1 overflow-hidden h-full">
          {/* Left Sidebar: Slides */}
          <div className="w-64 bg-gray-50 dark:bg-[#111421] border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <span className="text-xs font-bold text-text-sub uppercase tracking-wider">
                Slides (5)
              </span>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-text-sub">
                <PlusIcon className="w-[18px] h-[18px]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`group relative rounded-lg border ${i === 1 ? 'border-primary ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'} bg-white dark:bg-card-dark cursor-pointer transition-all aspect-video shadow-sm`}
                >
                  <div className="absolute left-2 top-2 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 rounded">
                    {i}
                  </div>
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <PhotoIcon className="w-9 h-9" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 bg-gray-100 dark:bg-[#0B0D15] flex flex-col relative overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
              <div className="bg-white aspect-video w-full max-w-4xl shadow-xl rounded-sm relative flex flex-col p-12">
                <div className="flex-1 flex flex-col justify-center items-start gap-6">
                  <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight">
                    Modern Marketing
                    <br />
                    <span className="text-primary">Strategies 2024</span>
                  </h1>
                  <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
                    A comprehensive guide to reaching your audience in the digital age through
                    data-driven insights and creative storytelling.
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex gap-4">
                    <div className="size-3 rounded-full bg-slate-900"></div>
                    <div className="size-3 rounded-full bg-primary"></div>
                    <div className="size-3 rounded-full bg-purple-500"></div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">Alex Morgan</p>
                    <p className="text-sm text-slate-500">Senior Strategist</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="h-12 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Undo"
                  className="p-2 text-text-sub hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <ArrowUturnLeftIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Redo"
                  className="p-2 text-text-sub hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <ArrowUturnRightIcon className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button
                  type="button"
                  aria-label="Zoom out"
                  className="p-2 text-text-sub hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <MagnifyingGlassMinusIcon className="w-5 h-5" />
                </button>
                <span className="text-xs font-medium text-text-sub">Fit</span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  className="p-2 text-text-sub hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <MagnifyingGlassPlusIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
              >
                <SparklesIcon className="w-4 h-4" />
                AI Generate
              </button>
            </div>
          </div>

          {/* Right Sidebar: Properties */}
          <div className="w-72 bg-white dark:bg-card-dark border-l border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <span className="text-xs font-bold text-text-sub uppercase tracking-wider">
                Properties
              </span>
            </div>
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-text-main dark:text-white">
                  Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="h-16 border border-primary bg-primary/5 rounded flex flex-col gap-1 p-1 items-center justify-center">
                    <div className="w-8 h-4 bg-primary/20 rounded-sm"></div>
                    <div className="w-8 h-1 bg-primary/20 rounded-full"></div>
                  </button>
                  <button className="h-16 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded flex gap-1 p-1 items-center justify-center">
                    <div className="w-3 h-8 bg-gray-200 dark:bg-gray-600 rounded-sm"></div>
                    <div className="flex flex-col gap-1">
                      <div className="w-4 h-1 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                      <div className="w-4 h-1 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-text-main dark:text-white">
                  Typography
                </label>
                <select className="w-full text-sm border-gray-200 dark:border-gray-700 rounded-md bg-transparent">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Playfair Display</option>
                </select>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-center hover:bg-gray-50 dark:hover:bg-gray-800 font-bold">
                    B
                  </button>
                  <button className="flex-1 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-center hover:bg-gray-50 dark:hover:bg-gray-800 italic">
                    I
                  </button>
                  <button className="flex-1 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-center hover:bg-gray-50 dark:hover:bg-gray-800 underline">
                    U
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold text-text-main dark:text-white">
                  Theme Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className="size-6 rounded-full bg-slate-900 border border-slate-200 dark:border-slate-700"></button>
                  <button className="size-6 rounded-full bg-primary border border-slate-200 dark:border-slate-700 ring-2 ring-offset-1 ring-primary"></button>
                  <button className="size-6 rounded-full bg-purple-500 border border-slate-200 dark:border-slate-700"></button>
                  <button className="size-6 rounded-full bg-emerald-500 border border-slate-200 dark:border-slate-700"></button>
                  <button className="size-6 rounded-full bg-orange-500 border border-slate-200 dark:border-slate-700"></button>
                  <button className="size-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary">
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Generate Presentation
                </h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Presentation Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Modern Marketing Strategies"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                    aria-label="Presentation topic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Number of Slides
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                    aria-label="Number of slides"
                  >
                    <option value={3}>3 slides</option>
                    <option value={5}>5 slides</option>
                    <option value={7}>7 slides</option>
                    <option value={10}>10 slides</option>
                  </select>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  onClick={handleGeneratePresentation}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-[18px] h-[18px]" />
                      Generate Slides
                    </>
                  )}
                </button>
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
