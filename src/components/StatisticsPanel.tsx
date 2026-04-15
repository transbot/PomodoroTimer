import React from 'react';
import { useStatistics } from '../contexts/StatisticsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSkin } from '../contexts/SkinContext';
import { Flame, Trophy, Clock, TrendingUp, Star } from 'lucide-react';

export function StatisticsPanel() {
  const { userStats, dailyStats, weeklyStats, xpProgress } = useStatistics();
  const { language } = useLanguage();
  const { currentSkin } = useSkin();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      today: { en: 'Today', zh: '今日' },
      thisWeek: { en: 'This Week', zh: '本周' },
      sessions: { en: 'sessions', zh: '个番茄' },
      minutes: { en: 'min', zh: '分钟' },
      streak: { en: 'Streak', zh: '连续' },
      days: { en: 'days', zh: '天' },
      level: { en: 'Level', zh: '等级' },
      xp: { en: 'XP', zh: '经验' },
      bestDay: { en: 'Best Day', zh: '最佳日' },
      dailyAvg: { en: 'Daily Avg', zh: '日均' },
      totalFocus: { en: 'Total Focus', zh: '累计专注' },
      hours: { en: 'hrs', zh: '小时' },
    };
    return translations[key]?.[language] || key;
  };

  const formatHours = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}${t('minutes')}`;
    if (mins === 0) return `${hrs}${t('hours')}`;
    return `${hrs}${t('hours')} ${mins}${t('minutes')}`;
  };

  return (
    <div className="space-y-6">
      {/* Level & XP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg-primary)',
              borderRadius: currentSkin.id === 'lamborghini' ? '0' : '50%',
            }}
          >
            {userStats.level}
          </div>
          <div>
            <div className="text-sm text-[var(--color-text-muted)]">{t('level')}</div>
            <div className="text-sm">
              {xpProgress.current} / {xpProgress.needed} {t('xp')}
            </div>
          </div>
        </div>
        <div className="flex-1 mx-4">
          <div className="h-2 rounded-full bg-[var(--color-bg-secondary)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${xpProgress.percentage}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </div>
        </div>
        <Star className="w-5 h-5 text-[var(--color-accent)]" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today */}
        <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-muted)]">{t('today')}</span>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {dailyStats.workSessions}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">{t('sessions')}</div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-[var(--color-text-muted)]">{t('streak')}</span>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {userStats.currentStreak}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">{t('days')}</div>
        </div>

        {/* Weekly Total */}
        <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-[var(--color-text-muted)]">{t('thisWeek')}</span>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {weeklyStats.totalWorkSessions}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">{t('sessions')}</div>
        </div>

        {/* Total Focus */}
        <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-[var(--color-text-muted)]">{t('totalFocus')}</span>
          </div>
          <div className="text-lg font-bold text-[var(--color-text-primary)]">
            {formatHours(userStats.totalWorkMinutes)}
          </div>
        </div>
      </div>

      {/* Weekly Details */}
      <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
        <span>{t('dailyAvg')}: {weeklyStats.dailyAverage.toFixed(1)} {t('sessions')}</span>
        <span>{t('bestDay')}: {weeklyStats.bestDaySessions} {t('sessions')}</span>
      </div>
    </div>
  );
}
