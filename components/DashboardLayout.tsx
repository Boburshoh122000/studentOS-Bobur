import React, { useState, useEffect, ReactNode } from 'react';
import { Screen, NavigationProps } from '../types';
import { authApi } from '../src/services/api';
import Sidebar from './Sidebar';
import { GlobalLoader } from './ui/GlobalLoader';
import { AcademicCapIcon, Bars3Icon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface DashboardLayoutProps extends NavigationProps {
  currentScreen: Screen;
  children: ReactNode;
  headerContent?: ReactNode;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  profile?: {
    fullName?: string;
    avatarUrl?: string;
  };
}

/* ── Focus-mode screens: sidebar is hidden, full width + back button ── */
const FOCUS_SCREENS = new Set<Screen>([
  Screen.CV_BUILDER,
  Screen.ATS_CHECKER,
  Screen.LEARNING_PLAN,
  Screen.PLAGIARISM,
  Screen.PRESENTATION,
]);

/* ── Map focus screens to their parent hub for the back button ── */
const FOCUS_BACK_MAP: Partial<Record<Screen, { label: string; screen: Screen }>> = {
  [Screen.CV_BUILDER]: { label: 'Career Tools', screen: Screen.CAREER_TOOLS },
  [Screen.ATS_CHECKER]: { label: 'Career Tools', screen: Screen.CAREER_TOOLS },
  [Screen.LEARNING_PLAN]: { label: 'Academic Tools', screen: Screen.ACADEMIC_TOOLS },
  [Screen.PLAGIARISM]: { label: 'Academic Tools', screen: Screen.ACADEMIC_TOOLS },
  [Screen.PRESENTATION]: { label: 'Academic Tools', screen: Screen.ACADEMIC_TOOLS },
};

export default function DashboardLayout({
  currentScreen,
  navigateTo,
  children,
  headerContent,
}: DashboardLayoutProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isFocusMode = FOCUS_SCREENS.has(currentScreen);
  const backTarget = FOCUS_BACK_MAP[currentScreen];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authApi.me();
      if (response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <GlobalLoader />;
  }

  /* ═══ F O C U S   M O D E ═══ */
  if (isFocusMode) {
    return (
      <div className="flex flex-col h-screen bg-[#fafafa] dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
        {/* Focus Top Bar */}
        <div className="flex items-center gap-3 px-4 md:px-8 py-3 bg-white dark:bg-card-dark border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          {backTarget && (
            <button
              onClick={() => navigateTo(backTarget.screen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group"
            >
              <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>{backTarget.label}</span>
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
              <AcademicCapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">StudentOS</span>
          </div>
        </div>

        {/* Full-width content — no headerContent in focus mode */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }

  /* ═══ N O R M A L   M O D E ═══ */
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden relative">
      <Sidebar
        currentScreen={currentScreen}
        navigateTo={navigateTo}
        userData={userData}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa] dark:bg-background-dark">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Bars3Icon className="w-5 h-5 text-white dark:text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <AcademicCapIcon className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-base font-bold text-text-main dark:text-white tracking-tight">
              StudentOS
            </span>
          </div>
          <div className="w-10" />
        </div>

        {headerContent}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
