import { useState, useEffect, useCallback } from 'react';
import { Screen, NavigationProps } from '../types';
import { learningPlanApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import { ThemeToggle } from './ThemeToggle';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  LockClosedIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface Resource {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'EXERCISE';
  url: string | null;
  durationText: string | null;
  isCompleted: boolean;
}

interface Phase {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isCompleted: boolean;
  resources: Resource[];
}

interface Plan {
  id: string;
  topic: string;
  durationWeeks: number;
  createdAt: string;
  phases: Phase[];
}

/* ─── Pegtop Loader ───────────────────────────────────────────────────────── */

const PegtopSVG = () => (
  <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        d="M18 0C18 0 0 16 0 26C0 33.732 8.059 40 18 40C27.941 40 36 33.732 36 26C36 16 18 0 18 0Z"
        fill="#4f46e5"
      />
      <path
        d="M18 0C18 0 0 16 0 26C0 33.732 8.059 40 18 40C27.941 40 36 33.732 36 26C36 16 18 0 18 0Z"
        fill="url(#shine)"
        fillOpacity="0.5"
      />
      <ellipse
        cx="12"
        cy="18"
        rx="4"
        ry="6"
        fill="white"
        fillOpacity="0.3"
        transform="rotate(-15 12 18)"
      />
    </g>
    <defs>
      <linearGradient id="shine" x1="18" y1="0" x2="18" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.6" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

function PegtopLoader() {
  return (
    <div className="loader" style={{ width: 100, height: 100 }}>
      <div id="pegtopone">
        <PegtopSVG />
      </div>
      <div id="pegtoptwo">
        <PegtopSVG />
      </div>
      <div id="pegtopthree">
        <PegtopSVG />
      </div>
    </div>
  );
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function LearningPlan({ navigateTo }: NavigationProps) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('4 weeks');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [recentPlans, setRecentPlans] = useState<string[]>([]);

  // Credit-gate modal state (402 from backend triggers this)
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [creditErrorData, setCreditErrorData] = useState<{
    required: number;
    available: number;
    shortfall: number;
    toolName: string;
  } | null>(null);

  const fetchActivePlan = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await learningPlanApi.getActive();
      const data = res.data as any;
      if (data?.plan) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch active plan on mount
  useEffect(() => {
    fetchActivePlan();
  }, [fetchActivePlan]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a learning topic');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const res = await learningPlanApi.generate({
        topic: topic.trim(),
        goal: topic.trim(),
        duration,
        difficulty,
      });

      // Handle 402 Insufficient Credits from backend
      if (res.error && (res.data as any)?.code === 'INSUFFICIENT_CREDITS') {
        const errData = (res.data as any)?.data;
        setCreditErrorData({
          required: errData?.required || 0,
          available: errData?.available || 0,
          shortfall: errData?.shortfall || 0,
          toolName: errData?.toolName || 'Learning Plan',
        });
        setShowInsufficientModal(true);
        return;
      }

      if (res.error) {
        throw new Error(res.error);
      }

      const data = res.data as any;
      if (data?.plan) {
        setPlan(data.plan);
        // Add to recent plans history (max 5)
        setRecentPlans((prev) => {
          const updated = [topic.trim(), ...prev.filter((p) => p !== topic.trim())].slice(0, 5);
          return updated;
        });
        setTopic('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleResource = useCallback(
    async (resourceId: string) => {
      if (!plan) return;

      // Optimistic update
      setPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phases: prev.phases.map((phase) => {
            const hasResource = phase.resources.some((r) => r.id === resourceId);
            if (!hasResource) return phase;

            const updatedResources = phase.resources.map((r) =>
              r.id === resourceId ? { ...r, isCompleted: !r.isCompleted } : r
            );
            const allDone = updatedResources.every((r) => r.isCompleted);
            return { ...phase, resources: updatedResources, isCompleted: allDone };
          }),
        };
      });

      try {
        await learningPlanApi.toggleResource(resourceId);
      } catch {
        // Revert on error
        fetchActivePlan();
      }
    },
    [plan, fetchActivePlan]
  );

  // ══ BULLETPROOF HARD RESET ══
  // Deletes plan from backend DB + wipes ALL local state back to initial
  const handleHardReset = useCallback(async () => {
    if (plan) {
      try {
        await learningPlanApi.deletePlan(plan.id);
      } catch (err) {
        console.error('Failed to delete plan:', err);
      }
    }
    // Force wipe every piece of local state
    setPlan(null);
    setTopic('');
    setDuration('4 weeks');
    setDifficulty('intermediate');
    setIsGenerating(false);
    setError(null);
    setShowInsufficientModal(false);
    setCreditErrorData(null);
  }, [plan]);

  // ══ AGGRESSIVE UNMOUNT CLEANUP ══
  // When the user navigates away from this page, wipe local state
  // so stale data never persists across route changes
  useEffect(() => {
    return () => {
      setPlan(null);
      setTopic('');
      setDuration('4 weeks');
      setDifficulty('intermediate');
      setIsGenerating(false);
      setError(null);
    };
  }, []);

  // ── Computed values ──
  const totalResources = plan?.phases.reduce((sum, p) => sum + p.resources.length, 0) || 0;
  const completedResources =
    plan?.phases.reduce((sum, p) => sum + p.resources.filter((r) => r.isCompleted).length, 0) || 0;
  const progressPercent =
    totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

  const videoResources =
    plan?.phases.flatMap((p) => p.resources.filter((r) => r.type === 'VIDEO')) || [];
  const completedVideos = videoResources.filter((r) => r.isCompleted).length;

  const articleResources =
    plan?.phases.flatMap((p) => p.resources.filter((r) => r.type === 'ARTICLE')) || [];
  const completedArticles = articleResources.filter((r) => r.isCompleted).length;

  // Find the current phase index (first incomplete)
  const currentPhaseIndex = plan?.phases.findIndex((p) => !p.isCompleted) ?? -1;

  /* ─── Header ─────────────────────────────────────────────────────────────── */

  const headerContent = (
    <header className="h-24 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col">
        <div
          className="flex items-center gap-2 text-text-sub mb-1 cursor-pointer"
          onClick={() => navigateTo(Screen.ACADEMIC_TOOLS)}
        >
          <ArrowLeftIcon className="w-[18px] h-[18px]" />
          <span className="text-sm font-medium">Academic Tools</span>
        </div>
        <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
          Learning Plan Generator
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold">
            AI Powered
          </span>
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {plan ? (
          <button
            onClick={handleHardReset}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition shadow-sm text-sm"
          >
            <PlusIcon className="w-[18px] h-[18px]" />
            Create New Plan
          </button>
        ) : (
          /* Recent Plans pills */
          <div className="flex items-center gap-2 flex-wrap justify-end max-w-lg">
            {recentPlans.length > 0 && (
              <>
                <span className="text-xs text-text-sub font-medium mr-1">Recent:</span>
                {recentPlans.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTopic(p)}
                    className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all cursor-pointer bg-white dark:bg-card-dark shadow-sm"
                  >
                    {p.length > 20 ? `${p.slice(0, 20)}…` : p}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );

  /* ─── Loading ────────────────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.LEARNING_PLAN} navigateTo={navigateTo}>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <PegtopLoader />
            <p className="text-sm text-text-sub">Loading your learning plan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ─── Empty State ────────────────────────────────────────────────────────── */

  if (!plan && !isGenerating) {
    return (
      <DashboardLayout
        currentScreen={Screen.LEARNING_PLAN}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0f111a]">
          <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm w-full">
                {error}
              </div>
            )}
            <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <AcademicCapIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-text-main dark:text-white mb-2">
              What are you preparing for?
            </h3>
            <p className="text-text-sub text-center max-w-md mb-6">
              Describe your career goal and our AI will generate a personalized, phased learning
              plan with mixed exercises, videos, and articles.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                { emoji: '🎯', label: 'Career-focused' },
                { emoji: '🎬', label: 'Videos + Articles' },
                { emoji: '✍️', label: 'Hands-on Exercises' },
                { emoji: '📈', label: 'Progress tracking' },
              ].map((f) => (
                <span
                  key={f.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 rounded-full text-xs font-medium text-text-main dark:text-white shadow-sm"
                >
                  {f.emoji} {f.label}
                </span>
              ))}
            </div>

            {/* ── Prompt Bar ── */}
            <div className="w-full max-w-2xl mx-auto">
              {/* Goal input */}
              <div className="bg-white dark:bg-card-dark shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-4 h-4 text-primary flex-shrink-0" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="e.g. Prepare for journalism internship at Kun.uz, Learn React from scratch, Get IELTS 7.0+"
                    className="flex-1 bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-transparent text-sm text-text-main dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {/* Difficulty pills */}
                  <div className="flex items-center gap-1.5">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                          difficulty === d
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Duration select */}
                    <div className="relative flex items-center">
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        aria-label="Duration"
                        className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium text-xs cursor-pointer appearance-none border-none outline-none ring-0 rounded-full pl-3 pr-7 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <option value="1 week">1 week</option>
                        <option value="2 weeks">2 weeks</option>
                        <option value="3 weeks">3 weeks</option>
                        <option value="4 weeks">4 weeks</option>
                        <option value="2 months">2 months</option>
                        <option value="3 months">3 months</option>
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Generate button */}
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !topic.trim()}
                      className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-primary/20"
                    >
                      {isGenerating ? (
                        <>
                          <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-3.5 h-3.5" />
                          Generate Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-sub text-center">
                AI generates a phased roadmap with exercises, videos &amp; articles tailored to your
                goal
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ─── Generating Skeleton ────────────────────────────────────────────────── */

  if (isGenerating) {
    return (
      <DashboardLayout
        currentScreen={Screen.LEARNING_PLAN}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0f111a]">
          <div className="max-w-6xl mx-auto p-8">
            {/* Thinking message */}
            <div className="flex flex-col items-center mb-10">
              <PegtopLoader />
              <p className="text-sm font-medium text-text-main dark:text-white mt-4">
                AI is structuring your learning journey...
              </p>
            </div>

            <div className="flex gap-8">
              {/* Phase skeletons */}
              <div className="flex-1 space-y-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="relative pl-16"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {/* Phase number circle */}
                    <div
                      className="absolute left-0 top-0 size-14 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                    {/* Phase card */}
                    <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                      <div
                        className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                      <div
                        className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-72 mb-6 animate-pulse"
                        style={{ animationDelay: `${i * 200 + 100}ms` }}
                      />
                      <div className="space-y-3">
                        {[0, 1, 2].map((j) => (
                          <div
                            key={j}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse"
                            style={{ animationDelay: `${i * 200 + j * 150}ms` }}
                          >
                            <div className="size-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1.5" />
                              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                            </div>
                            <div className="size-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar skeleton */}
              <div className="w-80 flex-shrink-0 space-y-6">
                <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-6" />
                  <div className="space-y-4">
                    <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  </div>
                </div>
                <div
                  className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ─── Plan View ──────────────────────────────────────────────────────────── */

  // Narrowing guard — TypeScript can't infer plan is non-null from earlier early-returns
  if (!plan) return null;

  return (
    <>
      <DashboardLayout
        currentScreen={Screen.LEARNING_PLAN}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0f111a]">
          <div className="max-w-6xl mx-auto p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ── Create New Plan action ── */}
            <div className="flex justify-end mb-6 w-full sticky top-0 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleHardReset();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <PlusIcon className="w-5 h-5" />
                Create New Plan
              </button>
            </div>

            <div className="flex gap-8">
              {/* ── Timeline Column ── */}
              <div className="flex-1 space-y-8 relative pb-20">
                {/* Vertical line */}
                <div className="absolute left-[27px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -z-10" />

                {plan.phases.map((phase, index) => {
                  const isCurrent = index === currentPhaseIndex;
                  const isCompleted = phase.isCompleted;
                  const isLocked = index > currentPhaseIndex && currentPhaseIndex !== -1;
                  const phaseResources = phase.resources;
                  const phaseCompleted = phaseResources.filter((r) => r.isCompleted).length;

                  return (
                    <div
                      key={phase.id}
                      className={`relative pl-16 group ${isLocked ? 'opacity-50' : ''}`}
                    >
                      {/* Phase circle */}
                      {isCompleted ? (
                        <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-[#0f111a] bg-green-500 flex items-center justify-center shadow-sm z-10">
                          <CheckIcon className="w-7 h-7 text-white" />
                        </div>
                      ) : isCurrent ? (
                        <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-[#0f111a] bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-10">
                          <span className="text-white font-bold text-xl">{index + 1}</span>
                        </div>
                      ) : (
                        <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-[#0f111a] bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm z-10">
                          <LockClosedIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}

                      {/* Phase card */}
                      {isCompleted ? (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/60 opacity-60">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 line-through">
                                {phase.title}
                              </h3>
                              <p className="text-sm text-gray-400">Completed</p>
                            </div>
                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold dark:bg-green-900/20 dark:text-green-400">
                              Done
                            </span>
                          </div>
                        </div>
                      ) : isLocked ? (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 border-dashed">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-text-main dark:text-white">
                              {phase.title}
                            </h3>
                            <span className="text-xs text-text-sub font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              Locked
                            </span>
                          </div>
                          <p className="text-sm text-text-sub mt-2">
                            Unlock by completing Phase {index}.
                          </p>
                        </div>
                      ) : (
                        /* Current / active phase */
                        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-lg border border-primary/20 ring-1 ring-primary/5">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-text-main dark:text-white">
                                {phase.title}
                              </h3>
                              {phase.description && (
                                <p className="text-sm text-text-sub mt-1">{phase.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-text-sub">
                                {phaseCompleted}/{phaseResources.length}
                              </span>
                              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                Current Step
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {phaseResources.map((resource) => {
                              const isVideo = resource.type === 'VIDEO';
                              const isExercise = resource.type === 'EXERCISE';
                              const hasUrl = !!resource.url;

                              const resourceContent = (
                                <>
                                  {/* Icon */}
                                  {isVideo ? (
                                    <div className="size-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover/item:scale-110 transition-transform">
                                      <ComputerDesktopIcon className="w-5 h-5" />
                                    </div>
                                  ) : isExercise ? (
                                    <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover/item:scale-110 transition-transform">
                                      <SparklesIcon className="w-5 h-5" />
                                    </div>
                                  ) : (
                                    <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover/item:scale-110 transition-transform">
                                      <DocumentTextIcon className="w-5 h-5" />
                                    </div>
                                  )}

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className={`text-base font-semibold transition-colors ${
                                        resource.isCompleted
                                          ? 'text-gray-400 dark:text-gray-500 line-through'
                                          : 'text-text-main dark:text-white group-hover/item:text-primary'
                                      }`}
                                    >
                                      {resource.title}
                                    </h4>
                                    <p className="text-xs text-text-sub mt-1">
                                      {isVideo ? 'Video' : isExercise ? '✍️ Exercise' : 'Article'}
                                      {resource.durationText && ` • ${resource.durationText}`}
                                    </p>
                                  </div>

                                  {/* External link indicator */}
                                  {hasUrl && (
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400" />
                                  )}
                                </>
                              );

                              return (
                                <div key={resource.id} className="flex items-start gap-3">
                                  {/* Clickable resource area */}
                                  {hasUrl ? (
                                    <a
                                      href={resource.url!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`group/item flex-1 flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                        resource.isCompleted
                                          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                                          : 'border-gray-100 dark:border-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-700/50'
                                      }`}
                                    >
                                      {resourceContent}
                                    </a>
                                  ) : (
                                    <div
                                      className={`group/item flex-1 flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                        resource.isCompleted
                                          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                                          : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                      }`}
                                    >
                                      {resourceContent}
                                    </div>
                                  )}

                                  {/* Checkbox — outside the link */}
                                  <div
                                    className="flex-shrink-0 mt-5 cursor-pointer"
                                    onClick={() => handleToggleResource(resource.id)}
                                  >
                                    {resource.isCompleted ? (
                                      <div className="size-6 rounded-full bg-green-500 flex items-center justify-center">
                                        <CheckIcon className="w-4 h-4 text-white" />
                                      </div>
                                    ) : (
                                      <div className="size-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-primary transition-colors" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Sidebar ── */}
              <div className="w-80 flex-shrink-0 space-y-6">
                {/* Weekly Goals */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-text-sub uppercase mb-4 tracking-wide">
                    Weekly Goals
                  </h3>
                  <div className="space-y-4">
                    {/* Videos */}
                    {videoResources.length > 0 && (
                      <div className="flex items-center gap-3">
                        <ProgressRing
                          value={
                            videoResources.length > 0
                              ? Math.round((completedVideos / videoResources.length) * 100)
                              : 0
                          }
                        />
                        <div>
                          <p className="text-sm font-semibold text-text-main dark:text-white">
                            Watch {videoResources.length} Videos
                          </p>
                          <p className="text-xs text-text-sub">
                            {completedVideos}/{videoResources.length} completed
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Articles */}
                    {articleResources.length > 0 && (
                      <div className="flex items-center gap-3">
                        <ProgressRing
                          value={
                            articleResources.length > 0
                              ? Math.round((completedArticles / articleResources.length) * 100)
                              : 0
                          }
                        />
                        <div>
                          <p className="text-sm font-semibold text-text-main dark:text-white">
                            Read {articleResources.length} Articles
                          </p>
                          <p className="text-xs text-text-sub">
                            {completedArticles}/{articleResources.length} completed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-text-sub uppercase mb-4 tracking-wide">
                    Overall Progress
                  </h3>
                  <div className="flex items-center gap-4">
                    <ProgressRing value={progressPercent} size="lg" />
                    <div>
                      <p className="text-lg font-bold text-text-main dark:text-white">
                        {progressPercent}%
                      </p>
                      <p className="text-xs text-text-sub">
                        {completedResources}/{totalResources} resources
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Plan Info — Motivational */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-text-sub uppercase mb-4 tracking-wide">
                    Your Journey
                  </h3>
                  <div className="space-y-3">
                    {/* Goal */}
                    <div className="p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/10">
                      <p className="text-xs text-primary font-semibold mb-0.5">Goal</p>
                      <p className="text-sm font-medium text-text-main dark:text-white leading-snug">
                        {plan.topic}
                      </p>
                    </div>
                    {/* Estimated completion */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-sub">Est. completion</span>
                      <span className="text-xs font-semibold text-text-main dark:text-white">
                        {new Date(
                          new Date(plan.createdAt).getTime() +
                            plan.durationWeeks * 7 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {/* Exercises */}
                    {(() => {
                      const exerciseCount = plan.phases
                        .flatMap((p) => p.resources)
                        .filter((r) => r.type === 'EXERCISE').length;
                      return exerciseCount > 0 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-sub">Exercises</span>
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            ✍️ {exerciseCount} hands-on
                          </span>
                        </div>
                      ) : null;
                    })()}
                    {/* Duration */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-sub">Duration</span>
                      <span className="text-xs font-semibold text-text-main dark:text-white">
                        {plan.durationWeeks} weeks · {plan.phases.length} phases
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-xs text-text-sub mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-primary">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

/* ─── ProgressRing component ───────────────────────────────────────────────── */

function ProgressRing({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'size-14' : 'size-12';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div className={`relative ${dim}`}>
      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-gray-100 dark:text-gray-800"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="text-primary"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${value}, 100`}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center ${textSize} font-bold text-primary`}
      >
        {value}%
      </div>
    </div>
  );
}
