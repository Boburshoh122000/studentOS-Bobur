import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../../types';

const screenToPath: Record<Screen, string> = {
  [Screen.LANDING]: '/',
  [Screen.SIGN_IN]: '/signin',
  [Screen.SIGNUP_STEP_1]: '/signup/step-1',
  [Screen.SIGNUP_STEP_2]: '/signup/step-2',
  [Screen.ABOUT]: '/about',
  [Screen.BLOG]: '/blog',
  [Screen.CONTACT]: '/contact',

  [Screen.DASHBOARD]: '/app',
  [Screen.SCHOLARSHIPS]: '/app/scholarships',
  [Screen.JOBS]: '/app/jobs',
  [Screen.CV_ATS]: '/app/cv-ats',
  [Screen.COVER_LETTER]: '/app/cover-letter',
  [Screen.PRESENTATION]: '/app/presentation',
  [Screen.LEARNING_PLAN]: '/app/learning-plan',
  [Screen.PLAGIARISM]: '/app/plagiarism',
  [Screen.HABIT_TRACKER]: '/app/habit-tracker',
  [Screen.COMMUNITY]: '/app/community',
  [Screen.PROFILE]: '/app/profile',

  [Screen.ADMIN_DASHBOARD]: '/admin',
  [Screen.ADMIN_EMPLOYERS]: '/admin/employers',
  [Screen.ADMIN_PRICING]: '/admin/pricing',
  [Screen.ADMIN_USERS]: '/admin/users',
  [Screen.ADMIN_SCHOLARSHIPS]: '/admin/scholarships',
  [Screen.ADMIN_ROLES]: '/admin/roles',
  [Screen.ADMIN_BLOG]: '/admin/blog',

  [Screen.EMPLOYER_DASHBOARD]: '/employer',
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
