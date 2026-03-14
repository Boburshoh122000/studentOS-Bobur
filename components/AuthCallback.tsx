import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, signOutSupabase } from '../src/lib/supabase';
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
        // Get the session from Supabase (it parses the URL hash automatically)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setError(sessionError.message);
          return;
        }

        if (!sessionData.session) {
          console.error('[AuthCallback] No session found');
          setError('No session found. Please try signing in again.');
          return;
        }

        const { user, access_token } = sessionData.session;

        // Exchange Supabase session for our backend JWT tokens
        const response = await authApi.googleCallback({
          supabaseAccessToken: access_token,
          email: user?.email || '',
          fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
          avatarUrl: user?.user_metadata?.avatar_url || '',
          providerId: user?.id || '',
        });

        if (response.error) {
          console.error('[AuthCallback] Backend error:', response.error);
          setError(response.error);
          return;
        }

        if (response.data) {
          // Mark user as authenticated (non-sensitive flag for route guards)
          localStorage.setItem('wasAuthenticated', '1');

          // Clear Supabase OAuth session — tokens are now in HttpOnly cookies
          signOutSupabase().catch(() => {});

          // Refresh auth context
          await refreshUser();

          toast.success(
            `Welcome${response.data.isNewUser ? '' : ' back'}, ${response.data.user.profile?.fullName || response.data.user.email}!`
          );

          // Redirect based on whether user is new (needs onboarding) or existing
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
