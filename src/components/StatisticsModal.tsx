import React, { useState } from 'react';
import { BarChart3, Trophy, X } from 'lucide-react';
import { StatisticsPanel } from './StatisticsPanel';
import { Heatmap } from './Heatmap';
import { AchievementsPanel, AchievementNotification } from './AchievementsPanel';
import { useLanguage } from '../contexts/LanguageContext';
import { useStatistics } from '../contexts/StatisticsContext';

type Tab = 'stats' | 'achievements';

export function StatisticsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const { language } = useLanguage();
  const { newAchievements, clearNewAchievements } = useStatistics();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Statistics', zh: '统计' },
      stats: { en: 'Overview', zh: '概览' },
      achievements: { en: 'Achievements', zh: '成就' },
    };
    return translations[key]?.[language] || key;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="relative w-full max-w-lg skin-card p-6 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[var(--color-accent)]" />
              {t('title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 skin-button-secondary"
              style={{ borderRadius: 'var(--radius-button)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2 px-4 transition-colors ${
                activeTab === 'stats' ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'stats' ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                color: activeTab === 'stats' ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                borderRadius: 'var(--radius-button)',
              }}
            >
              {t('stats')}
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-2 px-4 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'achievements' ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'achievements' ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                color: activeTab === 'achievements' ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                borderRadius: 'var(--radius-button)',
              }}
            >
              <Trophy className="w-4 h-4" />
              {t('achievements')}
              {newAchievements.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {newAchievements.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <StatisticsPanel />
                <Heatmap />
              </div>
            )}
            {activeTab === 'achievements' && (
              <AchievementsPanel />
            )}
          </div>
        </div>
      </div>

      {/* Achievement notifications */}
      {newAchievements.length > 0 && (
        <AchievementNotification
          achievement={newAchievements[0]}
          onClose={() => {
            const remaining = newAchievements.slice(1);
            if (remaining.length === 0) {
              clearNewAchievements();
            } else {
              // Show next achievement
            }
          }}
        />
      )}
    </>
  );
}
