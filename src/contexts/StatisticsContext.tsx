import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  PomodoroSession,
  UserStats,
  DailyStats,
  WeeklyStats,
  Achievement,
  generateSessionId,
  saveSession,
  loadUserStats,
  getDailyStats,
  getWeeklyStats,
  getHeatmapData,
  checkAchievements,
  getAllAchievementsWithStatus,
  getXpProgress,
} from '../utils/statistics';

interface StatisticsContextType {
  // Session management
  startSession: (type: 'work' | 'break', duration: number) => string;
  completeSession: (sessionId: string) => void;
  cancelSession: (sessionId: string) => void;

  // Stats access
  userStats: UserStats;
  dailyStats: DailyStats;
  weeklyStats: WeeklyStats;
  xpProgress: { current: number; needed: number; percentage: number };

  // Heatmap
  heatmapData: Map<string, number>;

  // Achievements
  achievements: Array<Achievement & { unlocked: boolean }>;
  newAchievements: Achievement[];
  clearNewAchievements: () => void;

  // Refresh
  refreshStats: () => void;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

// Track active session
let activeSession: { id: string; type: 'work' | 'break'; startTime: number; duration: number } | null = null;

export function StatisticsProvider({ children }: { children: React.ReactNode }) {
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats);
  const [dailyStats, setDailyStats] = useState<DailyStats>(() =>
    getDailyStats(new Date().toISOString().split('T')[0])
  );
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>(getWeeklyStats);
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(() => getHeatmapData());
  const [achievements, setAchievements] = useState<Array<Achievement & { unlocked: boolean }>>(
    getAllAchievementsWithStatus
  );
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [xpProgress, setXpProgress] = useState(() => getXpProgress(loadUserStats()));

  const refreshStats = useCallback(() => {
    const stats = loadUserStats();
    setUserStats(stats);
    setDailyStats(getDailyStats(new Date().toISOString().split('T')[0]));
    setWeeklyStats(getWeeklyStats());
    setHeatmapData(getHeatmapData());
    setAchievements(getAllAchievementsWithStatus());
    setXpProgress(getXpProgress(stats));
  }, []);

  const startSession = useCallback((type: 'work' | 'break', duration: number): string => {
    const id = generateSessionId();
    activeSession = {
      id,
      type,
      startTime: Date.now(),
      duration,
    };
    return id;
  }, []);

  const completeSession = useCallback((sessionId: string) => {
    if (!activeSession || activeSession.id !== sessionId) return;

    const session: PomodoroSession = {
      id: activeSession.id,
      startTime: activeSession.startTime,
      endTime: Date.now(),
      duration: activeSession.duration,
      type: activeSession.type,
      completed: true,
    };

    saveSession(session);
    activeSession = null;

    // Check for new achievements
    const newUnlocked = checkAchievements();
    if (newUnlocked.length > 0) {
      setNewAchievements(prev => [...prev, ...newUnlocked]);
    }

    refreshStats();
  }, [refreshStats]);

  const cancelSession = useCallback((sessionId: string) => {
    if (!activeSession || activeSession.id !== sessionId) return;

    const session: PomodoroSession = {
      id: activeSession.id,
      startTime: activeSession.startTime,
      endTime: Date.now(),
      duration: activeSession.duration,
      type: activeSession.type,
      completed: false,
    };

    saveSession(session);
    activeSession = null;
    refreshStats();
  }, [refreshStats]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  // Refresh stats on mount and when window gains focus
  useEffect(() => {
    refreshStats();

    const handleFocus = () => refreshStats();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshStats]);

  return (
    <StatisticsContext.Provider
      value={{
        startSession,
        completeSession,
        cancelSession,
        userStats,
        dailyStats,
        weeklyStats,
        xpProgress,
        heatmapData,
        achievements,
        newAchievements,
        clearNewAchievements,
        refreshStats,
      }}
    >
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
}
