import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../../types';

export const screenToPath: Record<Screen, string> = {
  [Screen.LANDING]: '/',
  [Screen.SIGN_IN]: '/signin',
  [Screen.SIGNUP_STEP_1]: '/signup/step-1',
  [Screen.SIGNUP_STEP_2]: '/signup/step-2',
  [Screen.ABOUT]: '/about',
  [Screen.BLOG]: '/blog',
  [Screen.CONTACT]: '/contact',

  [Screen.DASHBOARD]: '/app',
  [Screen.SCHOLARSHIPS]: '/app/scholarships',
  [Screen.CAREER_TRACKER]: '/career-tracker',
  [Screen.CV_BUILDER]: '/app/cv-builder',
  [Screen.ATS_CHECKER]: '/app/ats-checker',
  [Screen.PRESENTATION]: '/app/presentation',
  [Screen.CAREER_TOOLS]: '/app/career-tools',
  [Screen.ACADEMIC_TOOLS]: '/app/academic-tools',
  [Screen.LEARNING_PLAN]: '/app/learning-plan',
  [Screen.PLAGIARISM]: '/app/plagiarism',
  [Screen.HABIT_TRACKER]: '/app/habit-tracker',
  [Screen.COMMUNITY]: '/app/community',
  [Screen.PROFILE]: '/app/profile',
  [Screen.SETTINGS]: '/app/settings',

  [Screen.ADMIN_DASHBOARD]: '/console-admin',
  [Screen.ADMIN_EMPLOYERS]: '/console-admin/employers',
  [Screen.ADMIN_TOOLS]: '/console-admin/tools',
  [Screen.ADMIN_USERS]: '/console-admin/users',
  [Screen.ADMIN_SCHOLARSHIPS]: '/console-admin/scholarships',
  [Screen.ADMIN_ROLES]: '/console-admin/roles',
  [Screen.ADMIN_BLOG]: '/console-admin/blog',
  [Screen.ADMIN_SETTINGS]: '/console-admin/settings',
  [Screen.ADMIN_NOTIFICATIONS]: '/console-admin/notifications',
  [Screen.ADMIN_TEAM]: '/console-admin/team',
  [Screen.ADMIN_DEMOGRAPHICS]: '/console-admin/demographics',

  [Screen.EMPLOYER_DASHBOARD]: '/console-employer',
  [Screen.VERIFICATION_PENDING]: '/verification-pending',
};

type AnyComponent<P> = React.ComponentType<P> | React.LazyExoticComponent<React.ComponentType<P>>;

export function withNavigate<P extends NavigationProps>(Component: AnyComponent<P>) {
  return function Wrapped(props: Omit<P, keyof NavigationProps>) {
    const navigate = useNavigate();

    const navigateTo = (screen: Screen) => {
      window.scrollTo(0, 0);
      navigate(screenToPath[screen] ?? '/');
    };

    return <Component {...(props as P)} navigateTo={navigateTo} />;
  };
}
