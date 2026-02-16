import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Get Supabase admin client (uses service role key to bypass RLS).
 * Returns null if Supabase env vars are not configured.
 */
export const getSupabaseAdmin = (): SupabaseClient | null => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn(
      '[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — storage uploads disabled'
    );
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
};
