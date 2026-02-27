import React from 'react';
import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import { FileText, FileSearch, Presentation, Briefcase, ArrowRight } from 'lucide-react';

const tools = [
    {
        label: 'CV Builder',
        description: 'Create ATS-optimized resumes with AI assistance',
        icon: FileText,
        screen: Screen.CV_BUILDER,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        borderHover: 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
    },
    {
        label: 'ATS Checker',
        description: 'Analyze and score your CV against job descriptions',
        icon: FileSearch,
        screen: Screen.ATS_CHECKER,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderHover: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-800',
    },
    {
        label: 'Presentations',
        description: 'Generate professional slide decks with AI',
        icon: Presentation,
        screen: Screen.PRESENTATION,
        color: 'text-violet-500',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        borderHover: 'group-hover:border-violet-200 dark:group-hover:border-violet-800',
    },
];

export default function CareerToolsHub({ navigateTo }: NavigationProps) {
    return (
        <DashboardLayout currentScreen={Screen.CAREER_TOOLS} navigateTo={navigateTo}>
            <div className="p-8 md:p-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Briefcase size={24} className="text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Tools</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg ml-[52px]">
                            Build your professional profile and land your dream job.
                        </p>
                    </div>

                    {/* Tool Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((tool) => (
                            <button
                                key={tool.label}
                                onClick={() => navigateTo(tool.screen)}
                                className={`group flex flex-col items-center text-center p-6 rounded-3xl border border-transparent ${tool.bg} ${tool.borderHover} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
                            >
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <tool.icon size={36} className={`${tool.color} transition-transform duration-300 group-hover:scale-110`} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{tool.label}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{tool.description}</p>
                                <span className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open <ArrowRight size={14} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
