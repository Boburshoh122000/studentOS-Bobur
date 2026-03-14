import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - lazy initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Lazy-initialized Supabase client
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client
 * Only creates the client when actually needed (lazy initialization)
 */
const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: true,
        // Use implicit flow (hash-based token) instead of PKCE.
        // With persistSession:false, PKCE stores the code verifier in memory —
        // which is cleared when the OAuth redirect navigates away from the page.
        // The new client instance on /auth/callback can't find the verifier,
        // so getSession() returns null (breaks iOS Safari and some Android browsers).
        // Implicit flow puts the access_token directly in the URL hash, which
        // detectSessionInUrl reads without needing any stored state.
        // Safe here because we immediately exchange for our own HttpOnly-cookie
        // JWT and call signOutSupabase() to clear the Supabase session.
        flowType: 'implicit',
      },
    });
  }

  return supabaseClient;
};

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

/**
 * Sign in with Google OAuth
 * Redirects user to Google sign-in page
 */
export const signInWithGoogle = async () => {
  const supabase = getSupabaseClient();

  // Dynamically build redirect URL based on current origin
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline', // Request refresh token
        prompt: 'consent', // Always prompt for account selection
      },
    },
  });

  if (error) {
    console.error('[Supabase] Google OAuth error:', error);
    throw error;
  }

  return data;
};

/**
 * Get current Supabase session
 */
export const getSession = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[Supabase] Get session error:', error);
    throw error;
  }
  return data.session;
};

/**
 * Sign out from Supabase
 */
export const signOutSupabase = async () => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[Supabase] Sign out error:', error);
    throw error;
  }
};

// Export a getter for the client (lazy)
export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
  get storage() {
    return getSupabaseClient().storage;
  },
};

export default supabase;
