import { Screen } from '../../types';
import {
  LayoutGrid,
  FileText,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Target,
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
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { screen: Screen.DASHBOARD, icon: LayoutGrid, label: 'Dashboard' },
  { screen: Screen.CAREER_TOOLS, icon: FileText, label: 'Career Tools' },
  { screen: Screen.ACADEMIC_TOOLS, icon: ShieldCheck, label: 'Academic Tools' },
  { screen: Screen.SCHOLARSHIPS, icon: Briefcase, label: 'Scholarships' },
  { screen: Screen.HABIT_TRACKER, icon: GraduationCap, label: 'Habit Tracker' },
];

/**
 * Helper to check if a screen is a student tool screen
 */
export function isStudentToolScreen(screen: Screen): boolean {
  return STUDENT_NAV_ITEMS.some((item) => item.screen === screen);
}
