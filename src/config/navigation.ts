import { Screen } from '../types';

/**
 * Single source of truth for student dashboard navigation items.
 * Used by Sidebar and any other components that need navigation consistency.
 */
export interface NavItem {
  screen: Screen;
  icon: string;
  label: string;
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { screen: Screen.DASHBOARD, icon: 'dashboard', label: 'Dashboard' },
  { screen: Screen.CV_ATS, icon: 'description', label: 'CV & ATS' },
  { screen: Screen.JOBS, icon: 'work', label: 'Job Finder' },
  { screen: Screen.LEARNING_PLAN, icon: 'book_2', label: 'Learning Plan' },
  { screen: Screen.HABIT_TRACKER, icon: 'track_changes', label: 'Habit Tracker' },
  { screen: Screen.SCHOLARSHIPS, icon: 'emoji_events', label: 'Scholarships' },
  { screen: Screen.PRESENTATION, icon: 'co_present', label: 'Presentation Maker' },
  { screen: Screen.PLAGIARISM, icon: 'plagiarism', label: 'Plagiarism Checker' },
];

/**
 * Helper to check if a screen is a student tool screen
 */
export function isStudentToolScreen(screen: Screen): boolean {
  return STUDENT_NAV_ITEMS.some((item) => item.screen === screen);
}
