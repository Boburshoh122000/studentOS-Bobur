import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavigationProps } from '../types';
import { authApi } from '../src/services/api';
import { signInWithGoogle, isSupabaseConfigured } from '../src/lib/supabase';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';

export default function SignUpStep1({ navigateTo: _navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleSignUp = async () => {
    if (!isSupabaseConfigured()) {
      setError('Google sign-up is not available at the moment. Please use email registration.');
      toast.error('Google sign-up not configured');
      return;
    }

    setIsGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('[SignUp] Google signup error:', err);
      const message = err instanceof Error ? err.message : 'Failed to sign up with Google';
      setError(message);
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special character');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: apiError } = await authApi.register({
        email,
        password,
        fullName,
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      if (data) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        toast.success('Account created successfully!');

        // Navigate to onboarding (role selection)
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else {
          navigate('/signup/step-2', { replace: true });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <AuthLayout
      title={t('Auth.sign_up')}
      subtitle={t('Auth.get_started_free')}
      footerText={t('Auth.already_have_account')}
      footerLinkText={t('Auth.sign_in')}
      footerLinkTo="/signin"
    >
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isLoading}
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
            {t('Auth.full_name')}
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

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
            placeholder="you@university.edu"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
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
              placeholder="••••••••••"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 pr-12"
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
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength >= level
                        ? passwordStrength >= 3
                          ? 'bg-green-500'
                          : passwordStrength >= 2
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {passwordStrength < 2 && t('Auth.password_weak')}
                {passwordStrength === 2 && t('Auth.password_fair')}
                {passwordStrength === 3 && t('Auth.password_good')}
                {passwordStrength === 4 && t('Auth.password_strong')}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('Auth.confirm_password')}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 pr-12 ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 bg-red-50'
                  : confirmPassword && password === confirmPassword
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-300'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
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
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{t('Auth.passwords_dont_match')}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email || !password || !fullName || password !== confirmPassword}
          className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
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
              {t('Auth.creating_account')}
            </span>
          ) : (
            t('Auth.create_account')
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
