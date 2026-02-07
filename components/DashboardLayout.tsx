import React, { useState, useEffect, ReactNode } from 'react';
import { Screen, NavigationProps } from '../types';
import { authApi } from '../src/services/api';
import Sidebar from './Sidebar';

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
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-text-sub">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden relative">
      <Sidebar currentScreen={currentScreen} navigateTo={navigateTo} userData={userData} />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa] dark:bg-background-dark">
        {headerContent}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
