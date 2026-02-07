import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import { ThemeToggle } from './ThemeToggle';

interface LearningPlanData {
  title: string;
  timeframe: string;
  phases: Array<{
    title: string;
    duration: string;
    topics: string[];
    resources: string[];
  }>;
}

export default function LearningPlan({ navigateTo }: NavigationProps) {
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('4 weeks');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LearningPlanData | null>(null);

  const handleGeneratePlan = async () => {
    if (!goal.trim()) {
      setError('Please enter a learning goal');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await aiApi.generateLearningPlan({ goal: goal.trim(), timeframe });
      const data = response.data as LearningPlanData;
      setGeneratedPlan(data);
    } catch (err: any) {
      console.error('Failed to generate learning plan:', err);
      setError(err.response?.data?.error || 'Failed to generate learning plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const headerContent = (
    <header className="h-24 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col">
        <div
          className="flex items-center gap-2 text-text-sub mb-1 cursor-pointer"
          onClick={() => navigateTo(Screen.DASHBOARD)}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="text-sm font-medium">Back to Dashboard</span>
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
        <div className="flex gap-2">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Become a Junior Product Designer"
            className="flex-1 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary w-72"
          />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            aria-label="Select timeframe"
            className="px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="2 weeks">2 weeks</option>
            <option value="4 weeks">4 weeks</option>
            <option value="8 weeks">8 weeks</option>
            <option value="12 weeks">12 weeks</option>
          </select>
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating || !goal.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Generating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                Generate Plan
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );

  return (
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

          <div className="flex gap-8">
            <div className="flex-1 space-y-8 relative pb-20">
              <div className="absolute left-[27px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>

              {/* Phase 1: Completed */}
              <div className="relative pl-16 group">
                <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-background-dark bg-green-500 flex items-center justify-center shadow-sm z-10">
                  <span className="material-symbols-outlined text-white text-[28px]">check</span>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/60 opacity-60">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-text-main dark:text-white line-through text-gray-400 dark:text-gray-500">
                        Phase 1: Foundations
                      </h3>
                      <p className="text-sm text-gray-400">Completed</p>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold dark:bg-green-900/20 dark:text-green-400">
                      Done
                    </span>
                  </div>
                </div>
              </div>

              {/* Phase 2: Current */}
              <div className="relative pl-16 group">
                <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-background-dark bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-10">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-lg border border-primary/20 ring-1 ring-primary/5">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-text-main dark:text-white">
                        Phase 2: Design Fundamentals
                      </h3>
                      <p className="text-sm text-text-sub mt-1">
                        Mastering color, typography, and layout.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Current Step
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="group/item flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer">
                      <div className="size-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                        <span className="material-symbols-outlined">smart_display</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-text-main dark:text-white group-hover/item:text-primary transition-colors">
                          Typography Masterclass
                        </h4>
                        <p className="text-xs text-text-sub mt-1">YouTube • 45 mins</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-red-500 h-full w-[60%] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="group/item flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer">
                      <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                        <span className="material-symbols-outlined">article</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-text-main dark:text-white group-hover/item:text-primary transition-colors">
                          Case Study: Airbnb Redesign
                        </h4>
                        <p className="text-xs text-text-sub mt-1">Article • Medium • 12 min read</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 3: Locked */}
              <div className="relative pl-16 group opacity-50">
                <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-background-dark bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm z-10">
                  <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[24px]">
                    lock
                  </span>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 border-dashed">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-text-main dark:text-white">
                      Phase 3: Prototyping
                    </h3>
                    <span className="text-xs text-text-sub font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      Locked
                    </span>
                  </div>
                  <p className="text-sm text-text-sub mt-2">Unlock by completing Phase 2.</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-6">
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-text-sub uppercase mb-4 tracking-wide">
                  Weekly Goals
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-100 dark:text-gray-800"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        ></path>
                        <path
                          className="text-primary"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="75, 100"
                          strokeLinecap="round"
                          strokeWidth="3"
                        ></path>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                        75%
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main dark:text-white">
                        Watch 3 Videos
                      </p>
                      <p className="text-xs text-text-sub">2/3 completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
