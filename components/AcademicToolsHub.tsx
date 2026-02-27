import React from 'react';
import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import { ScanSearch, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

const tools = [
    {
        label: 'Plagiarism Checker',
        description: 'Verify the originality of your academic writing',
        icon: ScanSearch,
        screen: Screen.PLAGIARISM,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        borderHover: 'group-hover:border-rose-200 dark:group-hover:border-rose-800',
    },
    {
        label: 'Learning Plan',
        description: 'Generate personalized study roadmaps with AI',
        icon: BookOpen,
        screen: Screen.LEARNING_PLAN,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderHover: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-800',
    },
];

export default function AcademicToolsHub({ navigateTo }: NavigationProps) {
    return (
        <DashboardLayout currentScreen={Screen.ACADEMIC_TOOLS} navigateTo={navigateTo}>
            <div className="p-8 md:p-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                <GraduationCap size={24} className="text-emerald-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Tools</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg ml-[52px]">
                            Enhance your studies and maintain academic integrity.
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
