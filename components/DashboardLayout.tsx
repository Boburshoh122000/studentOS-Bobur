import React, { useState, useEffect, ReactNode } from 'react';
import { Screen, NavigationProps } from '../types';
import { authApi } from '../src/services/api';
import Sidebar from './Sidebar';
import { GlobalLoader } from './ui/GlobalLoader';
import { AcademicCapIcon, Bars3Icon } from '@heroicons/react/24/solid';

interface DashboardLayoutProps extends NavigationProps {
  currentScreen: Screen;
  children: ReactNode;
  // Optional: allow pages to show custom header
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

export default function DashboardLayout({
  currentScreen,
  navigateTo,
  children,
  headerContent,
}: DashboardLayoutProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        {/* Mobile Header – visible only on small screens */}
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
          {/* Spacer to keep logo centered */}
          <div className="w-10" />
        </div>

        {headerContent}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
