import { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import { useTranslation } from 'react-i18next';
import {
  AcademicCapIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  ArrowRightIcon,
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

const API = import.meta.env.VITE_API_URL || '/api';

interface Activity {
  id: string;
  type: 'plagiarism_check' | 'learning_plan';
  title: string;
  score?: number | null;
  isOriginal?: boolean | null;
  durationWeeks?: number;
  progress?: number;
  timestamp: string;
}

interface AcademicStats {
  totalChecks: number;
  totalPlans: number;
  avgOriginalityScore: number | null;
}

const tools = [
  {
    labelKey: 'Academic.plagiarism_checker',
    descKey: 'Academic.plagiarism_desc',
    fallbackLabel: 'Plagiarism Checker',
    fallbackDesc: 'Verify the originality of your academic writing',
    icon: ShieldCheckIcon,
    screen: Screen.PLAGIARISM,
    iconBg: 'bg-rose-50 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
  {
    labelKey: 'Academic.learning_plan',
    descKey: 'Academic.learning_plan_desc',
    fallbackLabel: 'Learning Plan',
    fallbackDesc: 'Generate personalized study roadmaps with AI',
    icon: BookOpenIcon,
    screen: Screen.LEARNING_PLAN,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function AcademicToolsHub({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<AcademicStats>({
    totalChecks: 0,
    totalPlans: 0,
    avgOriginalityScore: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API}/ai/academic-activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
          setStats(data.stats || { totalChecks: 0, totalPlans: 0, avgOriginalityScore: null });
        }
      } catch {
        // silently fail — show empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const originalityScore = stats.avgOriginalityScore;
  const scoreLabel =
    originalityScore !== null
      ? originalityScore >= 90
        ? t(
            'Academic.excellent_originality',
            'Your papers show excellent originality. Keep maintaining high academic standards.'
          )
        : originalityScore >= 70
          ? t(
              'Academic.good_originality',
              'Your papers show good originality. There is room for improvement.'
            )
          : t(
              'Academic.needs_improvement',
              'Some papers may need revision. Check your recent reports.'
            )
      : t(
          'Academic.no_checks_yet',
          'No plagiarism checks yet. Run your first check to see your score.'
        );

  return (
    <DashboardLayout currentScreen={Screen.ACADEMIC_TOOLS} navigateTo={navigateTo}>
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <AcademicCapIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('Academic.title', 'Academic Tools')}
                </h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg ml-[52px]">
                {t('Academic.subtitle', 'Enhance your studies and maintain academic integrity.')}
              </p>
            </div>

            {/* Tool Cards — Premium Bento Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {tools.map((tool) => (
                <button
                  key={tool.labelKey}
                  onClick={() => navigateTo(tool.screen)}
                  className={`group relative p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${tool.hoverBorder} rounded-[2rem] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col justify-between min-h-[220px] text-left`}
                >
                  {/* Decorative hover glow orb */}
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-emerald-100/40 to-teal-50/40 dark:from-emerald-900/20 dark:to-teal-900/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center ${tool.iconColor} mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm relative z-10`}
                  >
                    <tool.icon className="w-7 h-7" />
                  </div>

                  {/* Bottom: Text + Arrow */}
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {t(tool.labelKey, tool.fallbackLabel)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[85%] leading-relaxed">
                        {t(tool.descKey, tool.fallbackDesc)}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:border-emerald-200 dark:group-hover:border-emerald-700 transition-colors shrink-0">
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('Academic.recent_activity', 'Recent Activity')}
                </h3>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-2 shadow-sm">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <ClockIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(
                        'Academic.no_activity',
                        'No activity yet. Run a plagiarism check or create a learning plan to get started.'
                      )}
                    </p>
                  </div>
                ) : (
                  activities.map((item) => (
                    <div
                      key={item.id}
                      onClick={() =>
                        navigateTo(
                          item.type === 'plagiarism_check'
                            ? Screen.PLAGIARISM
                            : Screen.LEARNING_PLAN
                        )
                      }
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.type === 'plagiarism_check'
                              ? 'bg-rose-100 dark:bg-rose-900/30'
                              : 'bg-emerald-100 dark:bg-emerald-900/30'
                          }`}
                        >
                          {item.type === 'plagiarism_check' ? (
                            <ShieldCheckIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                          ) : (
                            <BookOpenIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {timeAgo(item.timestamp)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full hidden sm:block ${
                          item.type === 'plagiarism_check'
                            ? item.score !== null && item.score !== undefined && item.score >= 80
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {item.type === 'plagiarism_check'
                          ? item.score !== null && item.score !== undefined
                            ? `${item.score}% Original`
                            : 'Pending'
                          : item.durationWeeks
                            ? `${item.durationWeeks} ${t('Academic.weeks', 'weeks')}`
                            : `${item.progress ?? 0}%`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Widget A: Academic Score */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-amber-500" />
                {t('Academic.academic_score', 'Academic Score')}
              </h3>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    originalityScore !== null && originalityScore >= 80
                      ? 'bg-emerald-500'
                      : originalityScore !== null && originalityScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ width: `${originalityScore ?? 0}%` }}
                />
              </div>
              <p
                className={`text-xs font-semibold mb-3 ${
                  originalityScore !== null && originalityScore >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : originalityScore !== null
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-400'
                }`}
              >
                {originalityScore !== null
                  ? `${originalityScore}% ${t('Academic.integrity_score', 'Integrity Score')}`
                  : t('Academic.no_score', 'No score yet')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                {scoreLabel}
              </p>
              <button
                onClick={() => navigateTo(Screen.PLAGIARISM)}
                className="w-full py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition"
              >
                {t('Academic.check_paper', 'Check New Paper')}
              </button>
            </div>

            {/* Widget B: Quick Tip */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800/40 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                {t('Academic.study_tip', 'Study Tip')}
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed mb-4">
                {t(
                  'Academic.study_tip_text',
                  'AI-generated study plans that adapt to your pace help you retain 40% more information compared to static schedules.'
                )}
              </p>
              <button
                onClick={() => navigateTo(Screen.LEARNING_PLAN)}
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t('Academic.create_plan', 'Create Learning Plan')} &rarr;
              </button>
            </div>

            {/* Widget C: Quick Actions */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                {t('Academic.quick_actions', 'Quick Actions')}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigateTo(Screen.PLAGIARISM)}
                  className="w-full flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition text-left"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('Academic.check_originality', 'Check Paper Originality')}
                  </span>
                </button>
                <button
                  onClick={() => navigateTo(Screen.LEARNING_PLAN)}
                  className="w-full flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-left"
                >
                  <BookOpenIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('Academic.generate_roadmap', 'Generate Study Roadmap')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
