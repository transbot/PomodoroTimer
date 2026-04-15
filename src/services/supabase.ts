import { createClient, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Leaderboard features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== undefined && supabaseAnonKey !== undefined;
}

/**
 * Sign in anonymously with Supabase Auth
 * This creates a unique user ID that persists across sessions
 */
export async function signInAnonymously(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  try {
    // Check if already signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return session;
    }

    // Sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Failed to sign in anonymously:', error);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    return null;
  }
}

/**
 * Get current auth user ID
 */
export async function getAuthUserId(): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
