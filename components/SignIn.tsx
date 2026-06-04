import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { signInWithGoogle, isSupabaseConfigured } from '../src/lib/supabase';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';

export default function SignIn({ navigateTo: _navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMinutes, setBlockMinutes] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const hasRedirected = useRef(false);

  // Silent redirect for already-authenticated users who visit /signin
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      const raw = searchParams.get('redirect');
      const redirectTo =
        raw && raw.startsWith('/') && !raw.startsWith('//')
          ? raw
          : getDefaultRouteForRole(user.role);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  const getDefaultRouteForRole = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/console-admin';
      case 'EMPLOYER':
        return '/console-employer';
      case 'STUDENT':
      default:
        return '/app';
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      setError('Google sign-in is not available at the moment. Please use email login.');
      toast.error('Google sign-in not configured');
      return;
    }

    setIsGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('[SignIn] Google login error:', err);
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(message);
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRemainingAttempts(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      // Show toast exactly once, right when login succeeds
      const name = (result as any).user?.profile?.fullName || (result as any).user?.email || email;
      toast.success(`Welcome back, ${name}!`);
      // Navigation is handled by the useEffect above (isAuthenticated → redirect)
      return;
    }

    if (!result.success) {
      console.error('[SignIn] Login failed:', result);

      if (result.error === 'email_not_verified') {
        toast(t('Auth.email_not_verified_toast'), { icon: '⚠️' });
        navigate(`/signup/step-1?email=${encodeURIComponent(result.email ?? email)}&verify=true`, {
          replace: false,
        });
        return;
      } else if (result.blocked) {
        setIsBlocked(true);
        setBlockMinutes(result.retryAfterMinutes ?? 30);
        setError('');
      } else {
        const remaining = result.remaining_attempts;
        setRemainingAttempts(remaining ?? null);
        setError(result.error || 'Invalid email or password');
      }

      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('Auth.sign_in')}
      footerText={t('Auth.dont_have_account')}
      footerLinkText={t('Auth.sign_up')}
      footerLinkTo="/signup/step-1"
    >
      {/* Blocked Banner */}
      {isBlocked && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <span className="text-xl shrink-0">🔒</span>
          <div>
            <p className="text-sm font-semibold text-red-700">{t('Auth.account_locked')}</p>
            <p className="text-sm text-red-600 mt-0.5">
              {t('Auth.too_many_failed', { minutes: blockMinutes })}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!isBlocked && error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
          {remainingAttempts !== null && remainingAttempts > 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              {t('Auth.attempts_left_before_lock', { count: remainingAttempts })}
            </p>
          )}
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isSubmitting || isBlocked}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isGoogleLoading ? (
          <>
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
            <span>{t('Auth.connecting')}</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="white"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="white"
                fillOpacity="0.8"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="white"
                fillOpacity="0.6"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
            <span>{t('Auth.google')}</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-400">{t('Auth.or')}</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            {t('Auth.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@studentos.com"
            disabled={isBlocked}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
            {t('Auth.password')}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isBlocked}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-left">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            {t('Auth.forgot_password')}
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !email || !password || isBlocked}
          className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
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
              {t('Auth.signing_in')}
            </span>
          ) : isBlocked ? (
            t('Auth.locked_for', { minutes: blockMinutes })
          ) : (
            t('Auth.sign_in')
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
