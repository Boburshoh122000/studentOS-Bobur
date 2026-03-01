import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  ClockIcon,
  LightBulbIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';

const tools = [
  {
    label: 'CV Builder',
    description: 'Create ATS-optimized resumes with AI assistance',
    icon: DocumentTextIcon,
    screen: Screen.CV_BUILDER,
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  {
    label: 'ATS Checker',
    description: 'Analyze and score your CV against job descriptions',
    icon: DocumentCheckIcon,
    screen: Screen.ATS_CHECKER,
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
  },
];

const recentActivity = [
  {
    title: 'Software Engineer Resume',
    subtitle: 'Edited 2 hours ago',
    icon: DocumentTextIcon,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'ATS Score: 85%',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    title: 'Product Manager CV',
    subtitle: 'Scanned 5 hours ago',
    icon: DocumentCheckIcon,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    badge: 'ATS Score: 72%',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    title: 'Data Analyst Resume',
    subtitle: 'Created yesterday',
    icon: DocumentTextIcon,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: 'Draft',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
];

export default function CareerToolsHub({ navigateTo }: NavigationProps) {
  return (
    <DashboardLayout currentScreen={Screen.CAREER_TOOLS} navigateTo={navigateTo}>
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Tools</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg ml-[52px]">
                Build your professional profile and land your dream job.
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
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-indigo-100/40 to-purple-50/40 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center ${tool.iconColor} mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm relative z-10`}
                  >
                    <tool.icon className="w-7 h-7" />
                  </div>

                  {/* Bottom: Text + Arrow */}
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tool.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[85%] leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-colors shrink-0">
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-0.5 transition-all" />
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
            {/* Widget A: Profile Readiness */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserCircleIcon className="w-6 h-6 text-indigo-500" />
                Profile Readiness
              </h3>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: '65%' }}
                />
              </div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                65% Complete
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                Add your latest education and work experience to increase your visibility to
                employers.
              </p>
              <button
                onClick={() => navigateTo(Screen.PROFILE)}
                className="w-full py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition"
              >
                Complete Profile
              </button>
            </div>

            {/* Widget B: Quick Tip */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800/40 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                Quick Tip
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed mb-4">
                Did you know? Tailoring your CV to specific job descriptions using our ATS Checker
                increases your interview chances by 3x.
              </p>
              <button
                onClick={() => navigateTo(Screen.ATS_CHECKER)}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Try ATS Checker &rarr;
              </button>
            </div>

            {/* Widget C: Quick Actions */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigateTo(Screen.CV_BUILDER)}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-left"
                >
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Create New CV
                  </span>
                </button>
                <button
                  onClick={() => navigateTo(Screen.ATS_CHECKER)}
                  className="w-full flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition text-left"
                >
                  <DocumentCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Scan Existing CV
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
