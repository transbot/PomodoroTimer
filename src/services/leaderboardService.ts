import { supabase, isSupabaseConfigured } from './supabase';
import { getOrCreateUserId, generateDefaultDisplayName } from './userService';
import { LeaderboardEntry, LeaderboardCategory, CloudUserStats } from './types';
import { UserStats, loadUserStats } from '../utils/statistics';
import { isDevelopment } from '../utils/devMode';

/**
 * Sync local stats to Supabase
 */
export async function syncStats(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  const userId = getOrCreateUserId();
  const stats = loadUserStats();

  try {
    // First, ensure user exists
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: userId }, { onConflict: 'id' });

    if (userError) {
      console.error('Failed to ensure user exists:', userError);
    }

    // Upsert stats
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_sessions: stats.totalSessions,
        total_work_minutes: stats.totalWorkMinutes,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        level: stats.level,
        experience: stats.experience,
        last_active_date: stats.lastActiveDate || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to sync stats:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Sync stats error:', error);
    return false;
  }
}

/**
 * Get leaderboard by category
 */
export async function getLeaderboard(
  category: LeaderboardCategory = 'level',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const currentUserId = getOrCreateUserId();
  const showFakeUsers = isDevelopment();

  try {
    let query = supabase
      .from('user_stats')
      .select(`
        user_id,
        total_sessions,
        total_work_minutes,
        current_streak,
        longest_streak,
        level,
        experience,
        users!inner (
          id,
          display_name,
          is_fake
        )
      `)
      .order(getOrderByField(category), { ascending: false })
      .limit(limit);

    // Only filter out fake users in production
    if (!showFakeUsers) {
      query = query.eq('users.is_fake', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }

    return (data || []).map((row, index) => {
      const user = row.users as { id: string; display_name: string | null; is_fake: boolean };
      return {
        rank: index + 1,
        userId: row.user_id,
        displayName: user.display_name || generateDefaultDisplayName(row.user_id),
        level: row.level,
        totalSessions: row.total_sessions,
        currentStreak: row.current_streak,
        totalWorkMinutes: row.total_work_minutes,
        isCurrentUser: row.user_id === currentUserId,
      };
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return [];
  }
}

/**
 * Get current user's rank
 */
export async function getUserRank(category: LeaderboardCategory = 'level'): Promise<number | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const userId = getOrCreateUserId();
  const showFakeUsers = isDevelopment();

  try {
    let query = supabase
      .from('user_stats')
      .select(`
        user_id,
        users!inner (
          is_fake
        )
      `)
      .order(getOrderByField(category), { ascending: false });

    // Only filter out fake users in production
    if (!showFakeUsers) {
      query = query.eq('users.is_fake', false);
    }

    const { data, error } = await query;

    if (error || !data) {
      return null;
    }

    const rank = data.findIndex(row => row.user_id === userId) + 1;
    return rank > 0 ? rank : null;
  } catch (error) {
    console.error('Get user rank error:', error);
    return null;
  }
}

/**
 * Get order by field for category
 */
function getOrderByField(category: LeaderboardCategory): string {
  switch (category) {
    case 'level':
      return 'level';
    case 'sessions':
      return 'total_sessions';
    case 'streak':
      return 'current_streak';
    case 'focusTime':
      return 'total_work_minutes';
    default:
      return 'level';
  }
}

/**
 * Generate fake users for testing (dev mode only)
 */
export async function generateFakeUsers(count: number = 20): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase not configured');
    return false;
  }

  const names = [
    'Tomato Master', 'Focus Ninja', 'Pomodoro Pro', 'Time Lord',
    'Zen Focus', 'Clock Watcher', 'Deep Worker', 'Streak King',
    'Concentration Champ', 'Flow State', 'Mindful Worker', 'Productivity Guru',
    'Session Slayer', 'Timer Titan', 'Focus Phantom', 'Clock Conqueror',
  ];

  try {
    // Prepare batch data
    const usersToCreate: { id: string; display_name: string; is_fake: boolean }[] = [];
    const statsToCreate: {
      user_id: string;
      total_sessions: number;
      total_work_minutes: number;
      current_streak: number;
      longest_streak: number;
      level: number;
      experience: number;
      last_active_date: string;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const fakeId = crypto.randomUUID();
      const name = names[Math.floor(Math.random() * names.length)];
      const suffix = Math.floor(Math.random() * 9999);

      const level = Math.floor(Math.random() * 30) + 1;
      const totalSessions = Math.floor(Math.random() * 200) + level * 5;
      const currentStreak = Math.floor(Math.random() * 15);
      const totalWorkMinutes = totalSessions * (20 + Math.floor(Math.random() * 10));

      usersToCreate.push({
        id: fakeId,
        display_name: `${name} #${suffix}`,
        is_fake: true,
      });

      statsToCreate.push({
        user_id: fakeId,
        total_sessions: totalSessions,
        total_work_minutes: totalWorkMinutes,
        current_streak: currentStreak,
        longest_streak: currentStreak + Math.floor(Math.random() * 5),
        level: level,
        experience: level * 100 + Math.floor(Math.random() * 100),
        last_active_date: new Date().toISOString().split('T')[0],
      });
    }

    // Batch insert users
    const { error: usersError } = await supabase
      .from('users')
      .insert(usersToCreate);

    if (usersError) {
      console.error('Failed to create fake users:', usersError);
      return false;
    }

    // Batch insert stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert(statsToCreate);

    if (statsError) {
      console.error('Failed to create fake stats:', statsError);
      return false;
    }

    console.log(`Successfully created ${count} fake users`);
    return true;
  } catch (error) {
    console.error('Generate fake users error:', error);
    return false;
  }
}

/**
 * Clear all fake users (dev mode only)
 */
export async function clearFakeUsers(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  try {
    // Get fake user IDs
    const { data: fakeUsers, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('is_fake', true);

    if (fetchError || !fakeUsers) {
      return false;
    }

    if (fakeUsers.length === 0) {
      return true;
    }

    const fakeIds = fakeUsers.map(u => u.id);

    // Delete fake user stats first (due to foreign key)
    const { error: statsError } = await supabase
      .from('user_stats')
      .delete()
      .in('user_id', fakeIds);

    if (statsError) {
      console.error('Failed to delete fake stats:', statsError);
    }

    // Delete fake users
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .in('id', fakeIds);

    if (userError) {
      console.error('Failed to delete fake users:', userError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Clear fake users error:', error);
    return false;
  }
}
