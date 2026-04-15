import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import { useUser } from '../contexts/UserContext';
import { LeaderboardCategory } from '../services/types';
import { updateDisplayName, generateDefaultDisplayName } from '../services';
import { Trophy, RefreshCw, Crown, User, Edit2, Check, X } from 'lucide-react';

export function LeaderboardPanel() {
  const { language } = useLanguage();
  const { entries, userRank, category, isLoading, isSyncing, setCategory, refresh, sync } = useLeaderboard();
  const { isConfigured, userId, cloudUser, refreshUser } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      leaderboard: { en: 'Leaderboard', zh: '排行榜' },
      rank: { en: 'Rank', zh: '排名' },
      name: { en: 'Name', zh: '名称' },
      level: { en: 'Level', zh: '等级' },
      sessions: { en: 'Sessions', zh: '番茄数' },
      streak: { en: 'Streak', zh: '连续' },
      focusTime: { en: 'Focus Time', zh: '专注时长' },
      yourRank: { en: 'Your Rank', zh: '你的排名' },
      notRanked: { en: 'Complete more sessions to rank', zh: '完成更多番茄钟以获得排名' },
      notConfigured: { en: 'Leaderboard requires cloud sync', zh: '排行榜需要云端同步' },
      loading: { en: 'Loading...', zh: '加载中...' },
      days: { en: 'days', zh: '天' },
      hrs: { en: 'hrs', zh: '小时' },
      yourProfile: { en: 'Your Profile', zh: '你的资料' },
      editNickname: { en: 'Edit nickname', zh: '编辑昵称' },
      save: { en: 'Save', zh: '保存' },
      cancel: { en: 'Cancel', zh: '取消' },
      nicknamePlaceholder: { en: 'Enter your nickname', zh: '输入你的昵称' },
    };
    return translations[key]?.[language] || key;
  };

  const handleStartEdit = () => {
    const currentName = cloudUser?.displayName || generateDefaultDisplayName(userId || '');
    setEditName(currentName.replace(/ #\w{4}$/, '')); // Remove #XXXX suffix if exists
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim() || !userId) return;

    setIsSaving(true);
    const success = await updateDisplayName(userId, editName.trim());
    if (success) {
      await refreshUser();
      await refresh();
    }
    setIsSaving(false);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditName('');
  };

  const categories: { key: LeaderboardCategory; label: string }[] = [
    { key: 'level', label: t('level') },
    { key: 'sessions', label: t('sessions') },
    { key: 'streak', label: t('streak') },
    { key: 'focusTime', label: t('focusTime') },
  ];

  const formatFocusTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    return `${hours} ${t('hrs')}`;
  };

  const getStatValue = (entry: typeof entries[0]): string => {
    switch (category) {
      case 'level':
        return `Lv.${entry.level}`;
      case 'sessions':
        return `${entry.totalSessions}`;
      case 'streak':
        return `${entry.currentStreak} ${t('days')}`;
      case 'focusTime':
        return formatFocusTime(entry.totalWorkMinutes);
      default:
        return `Lv.${entry.level}`;
    }
  };

  if (!isConfigured) {
    return (
      <div className="text-center py-8 text-[var(--color-text-muted)]">
        {t('notConfigured')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t('leaderboard')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={sync}
            disabled={isSyncing}
            className="p-1.5 rounded transition-colors hover:bg-[var(--color-bg-secondary)]"
            title="Sync"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--color-text-muted)] ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User profile section */}
      {userId && (
        <div
          className="p-3 rounded-lg bg-[var(--color-bg-secondary)]"
          style={{ borderRadius: 'var(--radius-card)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--color-accent)]" />
              <span className="text-xs text-[var(--color-text-muted)]">{t('yourProfile')}</span>
            </div>
            {!isEditingName && (
              <button
                onClick={handleStartEdit}
                className="p-1 rounded transition-colors hover:bg-[var(--color-bg-primary)]"
                title={t('editNickname')}
              >
                <Edit2 className="w-3 h-3 text-[var(--color-text-muted)]" />
              </button>
            )}
          </div>
          <div className="mt-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t('nicknamePlaceholder')}
                  maxLength={20}
                  className="flex-1 px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  style={{ borderRadius: 'var(--radius-button)' }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving || !editName.trim()}
                  className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                {cloudUser?.displayName || generateDefaultDisplayName(userId)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
              category === cat.key ? 'font-semibold' : ''
            }`}
            style={{
              backgroundColor: category === cat.key ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
              color: category === cat.key ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            {t('loading')}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            {t('notRanked')}
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                entry.isCurrentUser
                  ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]'
                  : 'bg-[var(--color-bg-secondary)]'
              }`}
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {entry.rank <= 3 ? (
                  <Crown
                    className={`w-5 h-5 mx-auto ${
                      entry.rank === 1
                        ? 'text-yellow-500'
                        : entry.rank === 2
                        ? 'text-gray-400'
                        : 'text-amber-600'
                    }`}
                  />
                ) : (
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* User icon */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  backgroundColor: entry.isCurrentUser
                    ? 'var(--color-accent)'
                    : 'var(--color-bg-primary)',
                  color: entry.isCurrentUser
                    ? 'var(--color-bg-primary)'
                    : 'var(--color-text-primary)',
                }}
              >
                {entry.isCurrentUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  entry.displayName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    entry.isCurrentUser
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  {entry.displayName}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs">({language === 'en' ? 'You' : '你'})</span>
                  )}
                </div>
              </div>

              {/* Stat value */}
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                {getStatValue(entry)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* User's rank if not in top 50 */}
      {userRank && userRank > 50 && (
        <div
          className="p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]"
          style={{ borderRadius: 'var(--radius-card)' }}
        >
          <div className="text-sm text-[var(--color-text-muted)]">
            {t('yourRank')}: <span className="font-semibold text-[var(--color-accent)]">#{userRank}</span>
          </div>
        </div>
      )}
    </div>
  );
}
