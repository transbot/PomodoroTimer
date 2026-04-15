// Statistics Data Model for TomatoClock
// Stores pomodoro sessions and provides analytics

export interface PomodoroSession {
  id: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // minutes
  type: 'work' | 'break';
  completed: boolean; // whether session was completed or cancelled
  skin?: string; // which skin was used
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  workSessions: number;
  breakSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  completedSessions: number;
  cancelledSessions: number;
  sessions: PomodoroSession[];
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  totalWorkSessions: number;
  totalWorkMinutes: number;
  dailyAverage: number;
  bestDay: string;
  bestDaySessions: number;
  streakDays: number;
}

export interface UserStats {
  totalSessions: number;
  totalWorkMinutes: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  lastActiveDate: string;
  joinedDate: string;
}

// Level system constants
export const LEVEL_CONFIG = {
  baseXP: 100, // XP needed for level 1
  multiplier: 1.5, // each level requires multiplier * previous
  xpPerSession: 25, // XP earned per completed pomodoro
  xpPerMinute: 2, // XP earned per minute of focus
};

// Achievement definitions
export interface Achievement {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  icon: string; // emoji or icon name
  condition: (stats: UserStats) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Storage keys
const STORAGE_KEYS = {
  SESSIONS: 'tomatoclock-sessions',
  USER_STATS: 'tomatoclock-user-stats',
  ACHIEVEMENTS: 'tomatoclock-achievements',
};

// Helper functions
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Storage operations
export function saveSession(session: PomodoroSession): void {
  const sessions = loadAllSessions();
  sessions.push(session);

  // Keep only last 365 days of sessions
  const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const filtered = sessions.filter(s => s.startTime > cutoff);

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  updateUserStats(session);
}

export function loadAllSessions(): PomodoroSession[] {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function loadSessionsByDate(date: string): PomodoroSession[] {
  const sessions = loadAllSessions();
  return sessions.filter(s => formatDate(new Date(s.startTime)) === date);
}

export function loadSessionsByDateRange(startDate: string, endDate: string): PomodoroSession[] {
  const sessions = loadAllSessions();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
  return sessions.filter(s => s.startTime >= start && s.startTime < end);
}

export function loadUserStats(): UserStats {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  // Default stats
  return {
    totalSessions: 0,
    totalWorkMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    experience: 0,
    lastActiveDate: formatDate(new Date()),
    joinedDate: formatDate(new Date()),
  };
}

export function saveUserStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
}

function updateUserStats(session: PomodoroSession): void {
  const stats = loadUserStats();
  const today = formatDate(new Date());
  const sessionDate = formatDate(new Date(session.startTime));

  if (session.type === 'work' && session.completed) {
    stats.totalSessions += 1;
    stats.totalWorkMinutes += session.duration;

    // Add XP
    const xpGained = LEVEL_CONFIG.xpPerSession + session.duration * LEVEL_CONFIG.xpPerMinute;
    stats.experience += xpGained;

    // Check level up
    stats.level = calculateLevel(stats.experience);

    // Update streak
    if (sessionDate !== stats.lastActiveDate) {
      const lastDate = new Date(stats.lastActiveDate);
      const currentDate = new Date(sessionDate);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));

      if (diffDays === 1) {
        stats.currentStreak += 1;
      } else if (diffDays > 1) {
        stats.currentStreak = 1;
      }
      // diffDays === 0 means same day, streak unchanged

      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    }
  }

  stats.lastActiveDate = today;
  saveUserStats(stats);
}

export function calculateLevel(experience: number): number {
  let level = 1;
  let xpNeeded = LEVEL_CONFIG.baseXP;
  let totalXp = 0;

  while (totalXp + xpNeeded <= experience) {
    totalXp += xpNeeded;
    level += 1;
    xpNeeded = Math.floor(xpNeeded * LEVEL_CONFIG.multiplier);
  }

  return level;
}

export function getXpForNextLevel(currentLevel: number): number {
  let xpNeeded = LEVEL_CONFIG.baseXP;
  for (let i = 1; i < currentLevel; i++) {
    xpNeeded = Math.floor(xpNeeded * LEVEL_CONFIG.multiplier);
  }
  return xpNeeded;
}

export function getXpProgress(stats: UserStats): { current: number; needed: number; percentage: number } {
  const needed = getXpForNextLevel(stats.level);
  let totalXpForCurrentLevel = 0;
  let xpNeeded = LEVEL_CONFIG.baseXP;

  for (let i = 1; i < stats.level; i++) {
    totalXpForCurrentLevel += xpNeeded;
    xpNeeded = Math.floor(xpNeeded * LEVEL_CONFIG.multiplier);
  }

  const current = stats.experience - totalXpForCurrentLevel;
  const percentage = Math.min(100, (current / needed) * 100);

  return { current, needed, percentage };
}

// Analytics functions
export function getDailyStats(date: string): DailyStats {
  const sessions = loadSessionsByDate(date);
  const workSessions = sessions.filter(s => s.type === 'work');
  const breakSessions = sessions.filter(s => s.type === 'break');

  return {
    date,
    workSessions: workSessions.length,
    breakSessions: breakSessions.length,
    totalWorkMinutes: workSessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0),
    totalBreakMinutes: breakSessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0),
    completedSessions: sessions.filter(s => s.completed).length,
    cancelledSessions: sessions.filter(s => !s.completed).length,
    sessions,
  };
}

export function getWeeklyStats(weekStart?: string): WeeklyStats {
  const start = weekStart ? new Date(weekStart) : getWeekStart(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startDateStr = formatDate(start);
  const endDateStr = formatDate(end);

  const sessions = loadSessionsByDateRange(startDateStr, endDateStr);
  const workSessions = sessions.filter(s => s.type === 'work' && s.completed);

  // Calculate daily stats
  const dailyStats: Map<string, number> = new Map();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dailyStats.set(formatDate(d), 0);
  }

  workSessions.forEach(s => {
    const date = formatDate(new Date(s.startTime));
    const current = dailyStats.get(date) || 0;
    dailyStats.set(date, current + 1);
  });

  // Find best day
  let bestDay = startDateStr;
  let bestDaySessions = 0;
  dailyStats.forEach((count, date) => {
    if (count > bestDaySessions) {
      bestDay = date;
      bestDaySessions = count;
    }
  });

  // Calculate streak (consecutive days with sessions)
  let streakDays = 0;
  const sortedDays = Array.from(dailyStats.entries()).reverse();
  for (const [, count] of sortedDays) {
    if (count > 0) streakDays++;
    else break;
  }

  return {
    weekStart: startDateStr,
    weekEnd: endDateStr,
    totalWorkSessions: workSessions.length,
    totalWorkMinutes: workSessions.reduce((sum, s) => sum + s.duration, 0),
    dailyAverage: workSessions.length / 7,
    bestDay,
    bestDaySessions,
    streakDays,
  };
}

export function getHeatmapData(year?: number): Map<string, number> {
  const targetYear = year || new Date().getFullYear();
  const sessions = loadAllSessions();

  const heatmap: Map<string, number> = new Map();

  // Initialize all days
  const start = new Date(targetYear, 0, 1);
  const end = new Date(targetYear, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    heatmap.set(formatDate(d), 0);
  }

  // Count sessions per day
  sessions.forEach(s => {
    if (s.type === 'work' && s.completed) {
      const date = formatDate(new Date(s.startTime));
      const year = new Date(s.startTime).getFullYear();
      if (year === targetYear) {
        const current = heatmap.get(date) || 0;
        heatmap.set(date, current + 1);
      }
    }
  });

  return heatmap;
}

// Achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-pomodoro',
    name: { en: 'First Step', zh: '第一步' },
    description: { en: 'Complete your first pomodoro', zh: '完成第一个番茄钟' },
    icon: '🌱',
    condition: (stats) => stats.totalSessions >= 1,
    rarity: 'common',
  },
  {
    id: 'ten-pomodoros',
    name: { en: 'Getting Started', zh: '初见成效' },
    description: { en: 'Complete 10 pomodoros', zh: '完成10个番茄钟' },
    icon: '🌿',
    condition: (stats) => stats.totalSessions >= 10,
    rarity: 'common',
  },
  {
    id: 'fifty-pomodoros',
    name: { en: 'Focus Master', zh: '专注达人' },
    description: { en: 'Complete 50 pomodoros', zh: '完成50个番茄钟' },
    icon: '🌳',
    condition: (stats) => stats.totalSessions >= 50,
    rarity: 'rare',
  },
  {
    id: 'hundred-pomodoros',
    name: { en: 'Century', zh: '百里挑一' },
    description: { en: 'Complete 100 pomodoros', zh: '完成100个番茄钟' },
    icon: '🏆',
    condition: (stats) => stats.totalSessions >= 100,
    rarity: 'epic',
  },
  {
    id: 'streak-3',
    name: { en: 'Consistent', zh: '持之以恒' },
    description: { en: '3-day streak', zh: '连续打卡3天' },
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 3,
    rarity: 'common',
  },
  {
    id: 'streak-7',
    name: { en: 'Week Warrior', zh: '周周向上' },
    description: { en: '7-day streak', zh: '连续打卡7天' },
    icon: '⚡',
    condition: (stats) => stats.currentStreak >= 7,
    rarity: 'rare',
  },
  {
    id: 'streak-30',
    name: { en: 'Monthly Master', zh: '月度冠军' },
    description: { en: '30-day streak', zh: '连续打卡30天' },
    icon: '💎',
    condition: (stats) => stats.currentStreak >= 30,
    rarity: 'legendary',
  },
  {
    id: 'level-5',
    name: { en: 'Rising Star', zh: '冉冉升起' },
    description: { en: 'Reach level 5', zh: '达到5级' },
    icon: '⭐',
    condition: (stats) => stats.level >= 5,
    rarity: 'rare',
  },
  {
    id: 'level-10',
    name: { en: 'Expert', zh: '专家' },
    description: { en: 'Reach level 10', zh: '达到10级' },
    icon: '🌟',
    condition: (stats) => stats.level >= 10,
    rarity: 'epic',
  },
  {
    id: 'five-hours',
    name: { en: 'Deep Work', zh: '深度工作' },
    description: { en: 'Total 5 hours of focus', zh: '累计专注5小时' },
    icon: '🎯',
    condition: (stats) => stats.totalWorkMinutes >= 300,
    rarity: 'common',
  },
  {
    id: 'twenty-hours',
    name: { en: 'Time Lord', zh: '时间领主' },
    description: { en: 'Total 20 hours of focus', zh: '累计专注20小时' },
    icon: '⏰',
    condition: (stats) => stats.totalWorkMinutes >= 1200,
    rarity: 'rare',
  },
  {
    id: 'hundred-hours',
    name: { en: 'Grand Master', zh: '宗师' },
    description: { en: 'Total 100 hours of focus', zh: '累计专注100小时' },
    icon: '👑',
    condition: (stats) => stats.totalWorkMinutes >= 6000,
    rarity: 'legendary',
  },
];

export function getUnlockedAchievements(): string[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return [];
}

export function checkAchievements(): Achievement[] {
  const stats = loadUserStats();
  const unlocked = getUnlockedAchievements();
  const newAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!unlocked.includes(achievement.id) && achievement.condition(stats)) {
      newAchievements.push(achievement);
      unlocked.push(achievement.id);
    }
  });

  if (newAchievements.length > 0) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
  }

  return newAchievements;
}

export function getAllAchievementsWithStatus(): Array<Achievement & { unlocked: boolean }> {
  const unlocked = getUnlockedAchievements();
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));
}

// Dev mode achievement operations
export function unlockAllAchievements(): Achievement[] {
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!unlocked.includes(achievement.id)) {
      unlocked.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
  return newlyUnlocked;
}

export function resetAchievements(): void {
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
}

export function resetAllStats(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.USER_STATS);
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
}

export function unlockOneAchievement(): Achievement | null {
  const unlocked = getUnlockedAchievements();

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.includes(achievement.id)) {
      unlocked.push(achievement.id);
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
      return achievement;
    }
  }

  return null; // All achievements already unlocked
}
