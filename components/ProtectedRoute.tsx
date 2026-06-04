import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { GlobalLoader } from './ui/GlobalLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'EMPLOYER' | 'EDUCATOR' | 'ADMIN')[];
}

function Loader() {
  return <GlobalLoader />;
}

function getRoleDefaultRoute(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/console-admin';
    case 'EMPLOYER':
      return '/console-employer';
    case 'STUDENT':
    default:
      return '/app';
  }
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated || !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signin?redirect=${returnUrl}`} replace />;
  }

  const onboardingPaths = ['/signup/step-2', '/verification-pending'];
  const isOnOnboarding = onboardingPaths.some((p) => location.pathname.startsWith(p));

  if (!isOnOnboarding && (user.role === 'STUDENT' || user.role === 'EDUCATOR')) {
    const profile = user.profile;
    const hasCompletedOnboarding = profile && (profile.university || profile.major);
    if (!hasCompletedOnboarding) {
      return <Navigate to="/signup/step-2" replace />;
    }
  }

  if (isOnOnboarding && location.pathname === '/signup/step-2') {
    const profile = user.profile;
    const hasCompletedOnboarding =
      (user.role !== 'STUDENT' && user.role !== 'EDUCATOR') ||
      (profile && (profile.university || profile.major));
    if (hasCompletedOnboarding) {
      return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
