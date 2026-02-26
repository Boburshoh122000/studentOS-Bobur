import React from 'react';
import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import CVBuilder from './cv-builder/CVBuilder';

export default function CVBuilderPage({ navigateTo }: NavigationProps) {
    const headerContent = (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] backdrop-blur-sm px-6 flex items-center shrink-0 z-10">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    StudentOS
                </h1>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                <span className="text-sm font-medium text-slate-500">CV Builder</span>
            </div>
        </header>
    );

    return (
        <DashboardLayout
            currentScreen={Screen.CV_BUILDER}
            navigateTo={navigateTo}
            headerContent={headerContent}
        >
            <div className="flex-1 flex overflow-hidden">
                <CVBuilder />
            </div>
        </DashboardLayout>
    );
}
