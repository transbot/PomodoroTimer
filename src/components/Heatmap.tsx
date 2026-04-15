import React from 'react';
import { useStatistics } from '../contexts/StatisticsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSkin } from '../contexts/SkinContext';

interface HeatmapProps {
  compact?: boolean;
}

export function Heatmap({ compact = false }: HeatmapProps) {
  const { heatmapData } = useStatistics();
  const { language } = useLanguage();
  const { currentSkin } = useSkin();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      contribution: { en: 'Focus Activity', zh: '专注活动' },
      less: { en: 'Less', zh: '少' },
      more: { en: 'More', zh: '多' },
    };
    return translations[key]?.[language] || key;
  };

  // Generate last 12 weeks of data
  const now = new Date();
  const weeks: Array<Array<{ date: string; count: number }>> = [];

  for (let week = 11; week >= 0; week--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - week * 7 - now.getDay());

    const days: Array<{ date: string; count: number }> = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: heatmapData.get(dateStr) || 0,
      });
    }
    weeks.push(days);
  }

  const maxCount = Math.max(1, ...Array.from(heatmapData.values()));

  const getColor = (count: number) => {
    if (count === 0) return 'var(--color-bg-secondary)';
    const intensity = count / maxCount;

    if (currentSkin.id === 'lamborghini') {
      // Gold gradient for dark theme
      if (intensity < 0.25) return '#3d3000';
      if (intensity < 0.5) return '#6b5400';
      if (intensity < 0.75) return '#997800';
      return '#ffc000';
    } else {
      // Blue/green gradient for light theme
      if (intensity < 0.25) return '#c6e48b';
      if (intensity < 0.5) return '#7bc96f';
      if (intensity < 0.75) return '#239a3b';
      return '#196127';
    }
  };

  const dayLabels = language === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (compact) {
    // Compact view: just show last 4 weeks
    return (
      <div className="flex gap-1">
        {weeks.slice(-4).map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: getColor(day.count) }}
                title={`${day.date}: ${day.count}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-[var(--color-text-muted)]">{t('contribution')}</div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 text-xs text-[var(--color-text-muted)] flex items-center">
              {i % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="w-3 h-3 rounded-sm transition-colors"
                style={{
                  backgroundColor: getColor(day.count),
                  borderRadius: currentSkin.id === 'lamborghini' ? '0' : '2px',
                }}
                title={`${day.date}: ${day.count}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-[var(--color-text-muted)]">
        <span>{t('less')}</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColor(intensity * maxCount) }}
          />
        ))}
        <span>{t('more')}</span>
      </div>
    </div>
  );
}
