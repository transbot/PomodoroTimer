import React, { useState, useEffect } from 'react';
import { Bug, Zap, RotateCcw } from 'lucide-react';
import { getDevModeConfig, setTimeScale, toggleDevMode, TIME_SCALES, DevModeConfig } from '../utils/devMode';
import { useLanguage } from '../contexts/LanguageContext';

export function DevModePanel() {
  const [config, setConfig] = useState<DevModeConfig>({ enabled: false, timeScale: 1 });
  const { language } = useLanguage();

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

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      devMode: { en: 'Dev Mode', zh: '开发者模式' },
      timeScale: { en: 'Time Scale', zh: '时间倍速' },
      resetData: { en: 'Reset All Data', zh: '重置所有数据' },
      warning: { en: 'Dev mode only - not for production', zh: '仅开发模式 - 不用于生产' },
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
            <div className="text-xs text-amber-600 italic">
              {t('warning')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
