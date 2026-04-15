import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getLeaderboard,
  getUserRank,
  syncStats,
  LeaderboardEntry,
  LeaderboardCategory,
} from '../services';
import { useUser } from './UserContext';

interface LeaderboardContextType {
  entries: LeaderboardEntry[];
  userRank: number | null;
  category: LeaderboardCategory;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  setCategory: (category: LeaderboardCategory) => void;
  refresh: () => Promise<void>;
  sync: () => Promise<boolean>;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: React.ReactNode }) {
  const { isConfigured, isRegistered } = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [category, setCategory] = useState<LeaderboardCategory>('level');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(
    localStorage.getItem('tomatoclock-last-sync')
  );

  const refresh = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    setIsLoading(true);
    try {
      const [leaderboardData, rank] = await Promise.all([
        getLeaderboard(category, 100),
        getUserRank(category),
      ]);
      setEntries(leaderboardData);
      setUserRank(rank);
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, category]);

  const sync = useCallback(async (): Promise<boolean> => {
    if (!isConfigured || !isRegistered) {
      return false;
    }

    setIsSyncing(true);
    try {
      const success = await syncStats();
      if (success) {
        const now = new Date().toISOString();
        setLastSyncAt(now);
        localStorage.setItem('tomatoclock-last-sync', now);
        // Refresh leaderboard after sync
        await refresh();
      }
      return success;
    } catch (error) {
      console.error('Failed to sync:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConfigured, isRegistered, refresh]);

  // Refresh when category changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <LeaderboardContext.Provider
      value={{
        entries,
        userRank,
        category,
        isLoading,
        isSyncing,
        lastSyncAt,
        setCategory,
        refresh,
        sync,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
}
