import { Screen } from '../../types';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single source of truth for student dashboard navigation items.
 * Career Tools and Academic Tools are hub pages that contain sub-tools.
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
  { screen: Screen.CAREER_TOOLS, icon: Briefcase, label: 'Career Tools' },
  { screen: Screen.ACADEMIC_TOOLS, icon: GraduationCap, label: 'Academic Tools' },
  { screen: Screen.SCHOLARSHIPS, icon: Trophy, label: 'Scholarships' },
  { screen: Screen.HABIT_TRACKER, icon: Target, label: 'Habit Tracker' },
];

/**
 * Helper to check if a screen is a student tool screen
 */
export function isStudentToolScreen(screen: Screen): boolean {
  return STUDENT_NAV_ITEMS.some((item) => item.screen === screen);
}
