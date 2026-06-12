import { Screen } from '../../types';
import {
  Squares2X2Icon,
  BriefcaseIcon,
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/solid';

/**
 * Single source of truth for student dashboard navigation items.
 * Uses @heroicons/react/24/solid for a premium filled icon aesthetic.
 */
export interface NavItem {
  screen: Screen;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { screen: Screen.DASHBOARD, icon: Squares2X2Icon, label: 'Dashboard' },
  { screen: Screen.CAREER_TOOLS, icon: BriefcaseIcon, label: 'Career Tools' },
  { screen: Screen.ACADEMIC_TOOLS, icon: AcademicCapIcon, label: 'Academic Tools' },
  { screen: Screen.SCHOLARSHIPS, icon: TrophyIcon, label: 'Scholarships' },
  { screen: Screen.HABIT_TRACKER, icon: FireIcon, label: 'Habit Tracker' },
  { screen: Screen.CAREER_TRACKER, icon: ClipboardDocumentListIcon, label: 'Career Tracker' },
];

/**
 * Helper to check if a screen is a student tool screen
 */
export function isStudentToolScreen(screen: Screen): boolean {
  return STUDENT_NAV_ITEMS.some((item) => item.screen === screen);
}
