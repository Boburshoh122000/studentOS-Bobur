import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

/**
 * Auth Callback Page
 * Handles the OAuth redirect from Google/Supabase
 * Exchanges the Supabase session for our backend JWT tokens
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard against double-invocation (React StrictMode, unstable deps, etc.)
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          setError(`Google sign-in cancelled or failed: ${errorParam}`);
          return;
        }

        if (!code) {
          console.error('[AuthCallback] No authorization code in URL');
          setError('No authorization code received. Please try signing in again.');
          return;
        }

        const redirectUri = `${window.location.origin}/auth/callback`;
        const response = await authApi.googleExchange(code, redirectUri);

        if (response.error) {
          console.error('[AuthCallback] Backend error:', response.error);
          setError(response.error);
          return;
        }

        if (response.data) {
          // Mark user as authenticated (non-sensitive flag for route guards)
          localStorage.setItem('wasAuthenticated', '1');
          // Persist tokens for mobile where cross-origin cookies may not be stored
          if (response.data.accessToken)
            localStorage.setItem('accessToken', response.data.accessToken);
          if (response.data.refreshToken)
            localStorage.setItem('refreshToken', response.data.refreshToken);

          // Hydrate auth context directly to avoid /me round-trip on mobile
          await refreshUser(response.data.user as any);

          toast.success(
            `Welcome${response.data.isNewUser ? '' : ' back'}, ${response.data.user.profile?.fullName || response.data.user.email}!`
          );

          if (response.data.isNewUser) {
            navigate('/signup/step-2', { replace: true });
          } else {
            const role = response.data.user.role;
            if (role === 'ADMIN') {
              navigate('/console-admin', { replace: true });
            } else if (role === 'EMPLOYER') {
              navigate('/console-employer', { replace: true });
            } else {
              navigate('/app', { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="bg-white dark:bg-[#1e2130] rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Authentication Failed
            </h2>
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <GlobalLoader />;
}
