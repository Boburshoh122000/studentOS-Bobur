import React from 'react';
import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import {
    BriefcaseIcon,
    DocumentTextIcon,
    DocumentCheckIcon,
    ArrowRightIcon,
    ClockIcon,
    LightBulbIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/solid';

const tools = [
    {
        label: 'CV Builder',
        description: 'Create ATS-optimized resumes with AI assistance',
        icon: DocumentTextIcon,
        screen: Screen.CV_BUILDER,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        borderHover: 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
    },
    {
        label: 'ATS Checker',
        description: 'Analyze and score your CV against job descriptions',
        icon: DocumentCheckIcon,
        screen: Screen.ATS_CHECKER,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderHover: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-800',
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
            <div className="p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
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

                    {/* Tool Grid — 2 cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {tools.map((tool) => (
                            <button
                                key={tool.label}
                                onClick={() => navigateTo(tool.screen)}
                                className={`group flex flex-col items-center text-center p-8 rounded-3xl border border-transparent ${tool.bg} ${tool.borderHover} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
                            >
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <tool.icon className={`w-9 h-9 ${tool.color} transition-transform duration-300 group-hover:scale-110`} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{tool.label}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{tool.description}</p>
                                <span className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open <ArrowRightIcon className="w-3.5 h-3.5" />
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-2 shadow-sm">
                            {recentActivity.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                                            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.badgeColor}`}>
                                        {item.badge}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Tip */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 p-6 flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <LightBulbIcon className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                                <span>💡</span> Pro Tip
                            </h4>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                Tailor your CV to specific job descriptions using our ATS Checker. Resumes that score above 80% are 3x more likely to secure an interview.
                            </p>
                        </div>
                        <CheckBadgeIcon className="w-8 h-8 text-indigo-200 dark:text-indigo-700 flex-shrink-0 ml-auto hidden md:block" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
