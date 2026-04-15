import React, { useState, useEffect } from 'react';
import { Bug, Zap, RotateCcw, Trophy, Lock, Unlock, Users, Trash2, Cloud } from 'lucide-react';
import { getDevModeConfig, setTimeScale, toggleDevMode, TIME_SCALES, DevModeConfig } from '../utils/devMode';
import { useLanguage } from '../contexts/LanguageContext';
import { useStatistics } from '../contexts/StatisticsContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import { useUser } from '../contexts/UserContext';
import { unlockAllAchievements, resetAchievements, unlockOneAchievement, resetAllStats } from '../utils/statistics';
import { generateFakeUsers, clearFakeUsers, syncStats } from '../services';

export function DevModePanel() {
  const [config, setConfig] = useState<DevModeConfig>({ enabled: false, timeScale: 1 });
  const { language } = useLanguage();
  const { refreshStats, achievements, newAchievements } = useStatistics();
  const { refresh: refreshLeaderboard, isSyncing } = useLeaderboard();
  const { isConfigured, userId } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setConfig(getDevModeConfig());
  }, []);

  const handleToggle = () => {
    const newConfig = toggleDevMode();
    setConfig(newConfig);
  };

  const handleTimeScaleChange = (scale: number) => {
    setTimeScale(scale);
    setConfig(prev => ({ ...prev, timeScale: scale }));
  };

  const handleReset = () => {
    // Clear all localStorage data for fresh testing
    localStorage.removeItem('tomatoclock-sessions');
    localStorage.removeItem('tomatoclock-user-stats');
    localStorage.removeItem('tomatoclock-achievements');
    localStorage.removeItem('tomatoclock-skin');
    window.location.reload();
  };

  const handleUnlockAllAchievements = () => {
    const newlyUnlocked = unlockAllAchievements();
    refreshStats();
    // Trigger notifications for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      // The context will pick up the changes via refreshStats
    }
  };

  const handleResetAchievements = () => {
    // Reset both achievements and user stats to properly test achievement unlocking
    resetAllStats();
    refreshStats();
  };

  const handleUnlockOneAchievement = () => {
    unlockOneAchievement();
    refreshStats();
  };

  const handleGenerateFakeUsers = async () => {
    setIsGenerating(true);
    await generateFakeUsers(100);
    await refreshLeaderboard();
    setIsGenerating(false);
  };

  const handleClearFakeUsers = async () => {
    setIsGenerating(true);
    await clearFakeUsers();
    await refreshLeaderboard();
    setIsGenerating(false);
  };

  const handleSyncToCloud = async () => {
    await syncStats();
    await refreshLeaderboard();
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const hasLockedAchievements = unlockedCount < achievements.length;

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      devMode: { en: 'Dev Mode', zh: '开发者模式' },
      timeScale: { en: 'Time Scale', zh: '时间倍速' },
      resetData: { en: 'Reset All Data', zh: '重置所有数据' },
      warning: { en: 'Dev mode only - not for production', zh: '仅开发模式 - 不用于生产' },
      achievementTest: { en: 'Achievement Test', zh: '成就测试' },
      unlockAll: { en: 'Unlock All', zh: '解锁全部' },
      resetAchievements: { en: 'Reset Achievements', zh: '重置成就' },
      unlockOne: { en: 'Unlock One', zh: '解锁一个' },
      achievementStatus: { en: `Achievements: ${unlockedCount}/${achievements.length}`, zh: `成就: ${unlockedCount}/${achievements.length}` },
      leaderboardTest: { en: 'Leaderboard Test', zh: '排行榜测试' },
      generateFakeUsers: { en: 'Generate Users', zh: '生成用户' },
      clearFakeUsers: { en: 'Clear Fake', zh: '清除假用户' },
      syncToCloud: { en: 'Sync to Cloud', zh: '同步到云端' },
      cloudNotConfigured: { en: 'Cloud not configured', zh: '云端未配置' },
    };
    return translations[key]?.[language] || key;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className="rounded-lg shadow-lg p-3 space-y-3"
        style={{
          backgroundColor: config.enabled ? '#fef3c7' : 'var(--color-bg-card)',
          border: config.enabled ? '2px solid #f59e0b' : '1px solid var(--color-border)',
        }}
      >
        {/* Toggle button */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              config.enabled
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Bug className="w-4 h-4" />
            {t('devMode')}
          </button>

          {config.enabled && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title={t('resetData')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Time scale selector */}
        {config.enabled && (
          <>
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <Zap className="w-3 h-3" />
              {t('timeScale')}
            </div>
            <div className="flex flex-wrap gap-1">
              {TIME_SCALES.map((scale) => (
                <button
                  key={scale.value}
                  onClick={() => handleTimeScaleChange(scale.value)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    config.timeScale === scale.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {scale.label}
                </button>
              ))}
            </div>

            {/* Achievement test section */}
            <div className="border-t border-amber-300 pt-3 mt-3">
              <div className="flex items-center gap-2 text-xs text-amber-700 mb-2">
                <Trophy className="w-3 h-3" />
                {t('achievementTest')}
              </div>
              <div className="text-xs text-amber-600 mb-2">
                {t('achievementStatus')}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={handleUnlockAllAchievements}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  <Unlock className="w-3 h-3" />
                  {t('unlockAll')}
                </button>
                <button
                  onClick={handleResetAchievements}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  {t('resetAchievements')}
                </button>
                <button
                  onClick={handleUnlockOneAchievement}
                  disabled={!hasLockedAchievements}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    hasLockedAchievements
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Trophy className="w-3 h-3" />
                  {t('unlockOne')}
                </button>
              </div>
            </div>

            {/* Leaderboard test section */}
            {isConfigured && (
              <div className="border-t border-amber-300 pt-3 mt-3">
                <div className="flex items-center gap-2 text-xs text-amber-700 mb-2">
                  <Users className="w-3 h-3" />
                  {t('leaderboardTest')}
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={handleGenerateFakeUsers}
                    disabled={isGenerating}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    {t('generateFakeUsers')}
                  </button>
                  <button
                    onClick={handleClearFakeUsers}
                    disabled={isGenerating}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    {t('clearFakeUsers')}
                  </button>
                  <button
                    onClick={handleSyncToCloud}
                    disabled={isSyncing}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      isSyncing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <Cloud className="w-3 h-3" />
                    {t('syncToCloud')}
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs text-amber-600 italic">
              {t('warning')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
