import { Screen } from '../../types';
import {
  LayoutDashboard,
  FileText,
  FileSearch,
  BookOpen,
  Target,
  Trophy,
  ScanSearch,
  Presentation,
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
  /** Category header to render ABOVE this item (if it starts a new group) */
  category?: string;
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { screen: Screen.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },

  // ── Career Tools ──
  { screen: Screen.CV_BUILDER, icon: FileText, label: 'CV Builder', category: 'Career Tools' },
  { screen: Screen.ATS_CHECKER, icon: FileSearch, label: 'ATS Checker' },

  // ── Academic Tools ──
  { screen: Screen.PLAGIARISM, icon: ScanSearch, label: 'Plagiarism Checker', category: 'Academic Tools' },
  { screen: Screen.LEARNING_PLAN, icon: BookOpen, label: 'Learning Plan' },
  { screen: Screen.PRESENTATION, icon: Presentation, label: 'Presentations' },

  // ── Other ──
  { screen: Screen.SCHOLARSHIPS, icon: Trophy, label: 'Scholarships', category: 'Other' },
  { screen: Screen.HABIT_TRACKER, icon: Target, label: 'Habit Tracker' },
];

/**
 * Helper to check if a screen is a student tool screen
 */
export function isStudentToolScreen(screen: Screen): boolean {
  return STUDENT_NAV_ITEMS.some((item) => item.screen === screen);
}
