import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SignIn({ navigateTo: _navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, isLoading: isAuthLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Ref to track if we've already redirected (prevents multiple redirects/toasts)
  const hasRedirected = useRef(false);

  // Get returnUrl from query params (set by ProtectedRoute)
  const returnUrl = searchParams.get('returnUrl');
  const justRegistered = searchParams.get('registered') === 'true';

  // Check if user just registered and show success message
  useEffect(() => {
    if (justRegistered) {
      toast.success('Account created! Please sign in with your credentials.');
    }
  }, [justRegistered]);

  // Redirect authenticated users away from signin page
  useEffect(() => {
    // Only redirect once auth loading is complete and user is authenticated
    if (!isAuthLoading && isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log('[SignIn] User already authenticated, redirecting...');

      // Show toast only once
      toast.success('You are already logged in!', { id: 'already-logged-in' });

      // Navigate to returnUrl or role-based default
      const destination = returnUrl
        ? decodeURIComponent(returnUrl)
        : getDefaultRouteForRole(user.role);

      navigate(destination, { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, user, navigate, returnUrl]);

  const getDefaultRouteForRole = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'EMPLOYER':
        return '/employer';
      case 'STUDENT':
      default:
        return '/app';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Use the login method from useAuth to properly update context state
      const result = await login(email, password);

      if (!result.success) {
        console.error('[SignIn] Login error:', result.error);
        setError(result.error || 'Login failed');
        toast.error(
          result.error === 'Invalid credentials'
            ? 'Email or password is incorrect'
            : result.error || 'Login failed'
        );
        setIsSubmitting(false);
        return;
      }

      // Login successful - show toast
      toast.success(`Welcome back!`);

      // Reset submitting state before redirect
      setIsSubmitting(false);

      // IMMEDIATELY redirect - don't wait for useEffect
      const destination = returnUrl
        ? decodeURIComponent(returnUrl)
        : getDefaultRouteForRole(user?.role || 'STUDENT');

      // Force navigation with replace to prevent back-navigation to login
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('[SignIn] Network error:', err);
      setError('Network error. Please check your connection.');
      toast.error('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while auth state is being determined
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirect message (brief flash before redirect)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f6f8] dark:bg-[#111421] min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-200 font-display text-slate-900 dark:text-white">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-8 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="size-10 text-primary bg-white dark:bg-[#1e2130] rounded-xl shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 p-2">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            StudentOS
          </h2>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white dark:bg-[#1e2130] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-200 dark:border-slate-700 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Social Sign In */}
          <button
            disabled
            title="Coming soon"
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg bg-slate-100 dark:bg-[#25293b] border border-slate-200 dark:border-slate-700 px-4 py-3 text-base font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
          >
            <svg aria-hidden="true" className="h-5 w-5 grayscale" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            <span>Sign in with Google</span>
            <span className="ml-2 text-xs bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#1e2130] px-3 text-slate-500 dark:text-slate-400 font-medium">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold text-slate-900 dark:text-slate-200"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-lg border-none bg-[#f8f9fb] dark:bg-[#111421] px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 transition-all"
                  id="email"
                  name="email"
                  placeholder="name@studentos.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold text-slate-900 dark:text-slate-200"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-lg border-none bg-[#f8f9fb] dark:bg-[#111421] px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 transition-all pr-10"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-bold text-white shadow-md hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?
            <button
              onClick={() => navigate('/signup/step-1')}
              className="font-bold text-primary hover:text-blue-700 hover:underline transition-all ml-1"
            >
              Create an account
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-6 text-sm text-slate-500 dark:text-slate-500 opacity-60">
          <a href="/terms" className="hover:text-primary transition-colors">
            Terms
          </a>
          <a href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Help
          </a>
        </div>
      </div>
    </div>
  );
}
