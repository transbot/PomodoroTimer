export * from './types';
export { supabase, isSupabaseConfigured, signInAnonymously, getAuthUserId, getSession } from './supabase';
export {
  initializeAuth,
  getCurrentAuthUserId,
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
