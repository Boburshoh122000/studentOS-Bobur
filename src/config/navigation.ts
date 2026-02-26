import { Screen } from '../../types';
import {
  LayoutDashboard,
  FileText,
  FileSearch,
  BookOpen,
  Target,
  Trophy,
  ScanSearch,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single source of truth for student dashboard navigation items.
 * Uses lucide-react components instead of Material Symbol strings.
 */
export interface NavItem {
  screen: Screen;
  icon: LucideIcon;
  label: string;
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { screen: Screen.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { screen: Screen.CV_BUILDER, icon: FileText, label: 'CV Builder' },
  { screen: Screen.ATS_CHECKER, icon: FileSearch, label: 'ATS Checker' },
  { screen: Screen.LEARNING_PLAN, icon: BookOpen, label: 'Learning Plan' },
  { screen: Screen.HABIT_TRACKER, icon: Target, label: 'Habit Tracker' },
  { screen: Screen.SCHOLARSHIPS, icon: Trophy, label: 'Scholarships' },
  { screen: Screen.PLAGIARISM, icon: ScanSearch, label: 'Plagiarism Checker' },
];

/**
 * Helper to check if a screen is a student tool screen
 */
export function isStudentToolScreen(screen: Screen): boolean {
  return STUDENT_NAV_ITEMS.some((item) => item.screen === screen);
}
