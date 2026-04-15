import { supabase, isSupabaseConfigured } from './supabase';
import { CloudUser } from './types';

const STORAGE_KEY = 'tomatoclock-user-id';

/**
 * Get or create a local user ID (UUID)
 */
export function getOrCreateUserId(): string {
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}

/**
 * Get the current user ID without creating one
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Register user in Supabase (creates record if not exists)
 */
export async function registerUser(userId: string): Promise<CloudUser | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured, skipping user registration');
    return null;
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingUser) {
      // Map snake_case to camelCase
      return {
        id: existingUser.id,
        displayName: existingUser.display_name,
        createdAt: existingUser.created_at,
        isFake: existingUser.is_fake,
      };
    }

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({ id: userId })
      .select()
      .single();

    if (error) {
      console.error('Failed to register user:', error);
      return null;
    }

    // Map snake_case to camelCase
    return {
      id: data.id,
      displayName: data.display_name,
      createdAt: data.created_at,
      isFake: data.is_fake,
    };
  } catch (error) {
    console.error('User registration error:', error);
    return null;
  }
}

/**
 * Get user profile from Supabase
 */
export async function getUser(userId: string): Promise<CloudUser | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }

    // Map snake_case to camelCase
    return {
      id: data.id,
      displayName: data.display_name,
      createdAt: data.created_at,
      isFake: data.is_fake,
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Update user display name
 */
export async function updateDisplayName(userId: string, displayName: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update display name:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Update display name error:', error);
    return false;
  }
}

/**
 * Generate a default display name from user ID
 */
export function generateDefaultDisplayName(userId: string): string {
  // Use last 4 characters for a shorter, cleaner look
  const shortId = userId.substring(0, 4).toUpperCase();
  return `Tomato Hero #${shortId}`;
}
