export * from './types';
export { supabase, isSupabaseConfigured } from './supabase';
export {
  getOrCreateUserId,
  getCurrentUserId,
  registerUser,
  getUser,
  updateDisplayName,
  generateDefaultDisplayName,
} from './userService';
export {
  syncStats,
  getLeaderboard,
  getUserRank,
  generateFakeUsers,
  clearFakeUsers,
} from './leaderboardService';
