// Platform-agnostic types for iOS compatibility

export interface CloudUser {
  id: string;
  displayName: string | null;
  createdAt: string;
  isFake: boolean;
}

export interface CloudUserStats {
  userId: string;
  totalSessions: number;
  totalWorkMinutes: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  lastActiveDate: string | null;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  level: number;
  totalSessions: number;
  currentStreak: number;
  totalWorkMinutes: number;
  isCurrentUser: boolean;
}

export type LeaderboardCategory = 'level' | 'sessions' | 'streak' | 'focusTime';

export interface SyncStatus {
  lastSyncAt: string | null;
  isSyncing: boolean;
  error: string | null;
}
