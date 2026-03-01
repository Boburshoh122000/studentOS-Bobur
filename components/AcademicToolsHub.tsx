import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import {
  AcademicCapIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  ArrowRightIcon,
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

const tools = [
  {
    label: 'Plagiarism Checker',
    description: 'Verify the originality of your academic writing',
    icon: ShieldCheckIcon,
    screen: Screen.PLAGIARISM,
    iconBg: 'bg-rose-50 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
  {
    label: 'Learning Plan',
    description: 'Generate personalized study roadmaps with AI',
    icon: BookOpenIcon,
    screen: Screen.LEARNING_PLAN,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
];

const recentActivity = [
  {
    title: 'Research Paper — AI Ethics',
    subtitle: 'Checked 3 hours ago',
    icon: ShieldCheckIcon,
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badge: '97% Original',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    title: 'Web Dev Roadmap',
    subtitle: 'Generated yesterday',
    icon: BookOpenIcon,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: '4 weeks',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
];

export default function AcademicToolsHub({ navigateTo }: NavigationProps) {
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Tools</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg ml-[52px]">
                Enhance your studies and maintain academic integrity.
              </p>
            </div>

            {/* Tool Cards — Premium Bento Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {tools.map((tool) => (
                <button
                  key={tool.label}
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
                        {tool.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[85%] leading-relaxed">
                        {tool.description}
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-700 p-2 shadow-sm">
                {recentActivity.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${item.badgeColor} hidden sm:block`}
                    >
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Widget A: Study Streak */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-amber-500" />
                Academic Score
              </h3>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: '82%' }}
                />
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                82% Integrity Score
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                Your papers show excellent originality. Keep maintaining high academic standards.
              </p>
              <button
                onClick={() => navigateTo(Screen.PLAGIARISM)}
                className="w-full py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition"
              >
                Check New Paper
              </button>
            </div>

            {/* Widget B: Quick Tip */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800/40 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                Study Tip
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed mb-4">
                AI-generated study plans that adapt to your pace help you retain 40% more
                information compared to static schedules.
              </p>
              <button
                onClick={() => navigateTo(Screen.LEARNING_PLAN)}
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Create Learning Plan &rarr;
              </button>
            </div>

            {/* Widget C: Quick Actions */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigateTo(Screen.PLAGIARISM)}
                  className="w-full flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition text-left"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Check Paper Originality
                  </span>
                </button>
                <button
                  onClick={() => navigateTo(Screen.LEARNING_PLAN)}
                  className="w-full flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-left"
                >
                  <BookOpenIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Generate Study Roadmap
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
