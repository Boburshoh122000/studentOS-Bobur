import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../types';
import { STUDENT_NAV_ITEMS } from '../src/config/navigation';
import { useAuth } from '../src/contexts/AuthContext';

interface SidebarProps {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  userData: {
    email: string;
    profile?: {
      fullName?: string;
      avatarUrl?: string;
    };
  } | null;
}

export default function Sidebar({ currentScreen, navigateTo, userData }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 320);
  };

  const isSidebarExpanded = isSidebarLocked || isSidebarHovered;

  // User data
  const fullName = userData?.profile?.fullName || userData?.email?.split('@')[0] || 'User';
  const email = userData?.email || '';
  const avatarUrl =
    userData?.profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  // Use shared navigation config (single source of truth)
  const navItems = STUDENT_NAV_ITEMS;

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-all duration-300 ease-in-out hidden md:flex items-center py-6 z-20 flex-shrink-0 relative`}
    >
      {/* Lock/Unlock Toggle */}
      <button
        onClick={() => setIsSidebarLocked(!isSidebarLocked)}
        className={`absolute -right-3 top-10 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6 ${isSidebarLocked ? 'text-primary border-primary' : ''}`}
        title={isSidebarLocked ? 'Unlock Sidebar' : 'Lock Sidebar Open'}
      >
        <span className="material-symbols-outlined text-[14px]">
          {isSidebarLocked ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>

      <div
        className={`flex flex-col ${isSidebarExpanded ? 'items-start px-4' : 'items-center'} gap-8 w-full transition-all duration-300`}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 w-full ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}
          onClick={() => navigateTo(Screen.LANDING)}
        >
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer group hover:scale-105 transition-transform flex-shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">school</span>
          </div>
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
          >
            <h1 className="text-lg font-bold leading-none tracking-tight whitespace-nowrap">
              StudentOS
            </h1>
            <p className="text-xs text-text-sub font-medium mt-1 whitespace-nowrap">Pro Plan</p>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={`flex flex-col ${isSidebarExpanded ? 'items-stretch' : 'items-center'} space-y-2 w-full`}
        >
          {navItems.map((item, idx) => {
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={idx}
                onClick={() => navigateTo(item.screen)}
                className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${isActive ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white'}`}
                title={!isSidebarExpanded ? item.label : ''}
              >
                <span
                  className={`material-symbols-outlined ${isActive ? 'icon-filled' : 'group-hover:text-primary'} ${!isSidebarExpanded ? 'text-2xl' : 'text-[20px]'}`}
                >
                  {item.icon}
                </span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {!isSidebarExpanded && (
                  <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div
        className={`flex flex-col ${isSidebarExpanded ? 'items-stretch px-4' : 'items-center px-2'} space-y-2 w-full mt-auto`}
      >
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative text-text-sub hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400`}
          title={!isSidebarExpanded ? 'Log Out' : ''}
        >
          <span
            className={`material-symbols-outlined ${isLoggingOut ? 'animate-spin' : ''} ${!isSidebarExpanded ? 'text-2xl' : 'text-[20px]'}`}
          >
            {isLoggingOut ? 'progress_activity' : 'logout'}
          </span>
          {isSidebarExpanded && (
            <span className="text-sm font-medium whitespace-nowrap">
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </span>
          )}
          {!isSidebarExpanded && (
            <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Log Out
            </span>
          )}
        </button>

        {/* User Profile */}
        <div
          onClick={() => navigateTo(Screen.PROFILE)}
          className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2 w-full' : 'justify-center size-10'} rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
        >
          <div
            className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0"
            style={{ backgroundImage: `url('${avatarUrl}')` }}
          />
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
          >
            <span className="text-sm font-bold text-text-main dark:text-white truncate">
              {fullName}
            </span>
            <span className="text-xs text-text-sub truncate">{email}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
