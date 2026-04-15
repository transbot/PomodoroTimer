import React from 'react';
import { useStatistics } from '../contexts/StatisticsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Achievement } from '../utils/statistics';
import { X } from 'lucide-react';

export function AchievementsPanel() {
  const { achievements } = useStatistics();
  const { language } = useLanguage();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      achievements: { en: 'Achievements', zh: '成就' },
      unlocked: { en: 'unlocked', zh: '已解锁' },
    };
    return translations[key]?.[language] || key;
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t('achievements')}
        </h3>
        <span className="text-sm text-[var(--color-text-muted)]">
          {unlockedCount} / {achievements.length} {t('unlocked')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg transition-opacity ${
              achievement.unlocked ? '' : 'opacity-40'
            }`}
            style={{
              backgroundColor: achievement.unlocked
                ? 'var(--color-bg-secondary)'
                : 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {achievement.name[language]}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] truncate">
                  {achievement.description[language]}
                </div>
              </div>
            </div>
            {!achievement.unlocked && (
              <div className="mt-2 flex justify-center">
                <div className="w-6 h-6 rounded-full bg-[var(--color-text-muted)] opacity-30 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Achievement notification popup
export function AchievementNotification({
  achievement,
  onClose,
}: {
  achievement: Achievement;
  onClose: () => void;
}) {
  const { language } = useLanguage();

  return (
    <div
      className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg animate-bounce z-50 cursor-pointer"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-accent)',
        borderRadius: 'var(--radius-card)',
      }}
      onClick={onClose}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{achievement.icon}</span>
        <div>
          <div className="text-sm font-bold text-[var(--color-accent)]">
            🎉 {language === 'en' ? 'Achievement Unlocked!' : '解锁新成就！'}
          </div>
          <div className="text-lg font-semibold text-[var(--color-text-primary)]">
            {achievement.name[language]}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {achievement.description[language]}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 hover:opacity-70"
        >
          <X className="w-5 h-5 text-[var(--color-text-muted)]" />
        </button>
      </div>
    </div>
  );
}
