import React from 'react';
import { Palette } from 'lucide-react';
import { useSkin, skins } from '../contexts/SkinContext';
import { useLanguage } from '../contexts/LanguageContext';

export function SkinSwitch() {
  const { currentSkin, setSkin } = useSkin();
  const { language } = useLanguage();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg skin-button-secondary"
        title={language === 'en' ? 'Switch skin' : '切换皮肤'}
      >
        <Palette size={18} />
        <span className="text-sm hidden sm:inline">
          {currentSkin.name[language]}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-48 py-2 rounded-lg skin-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {skins.map((skin) => (
          <button
            key={skin.id}
            onClick={() => setSkin(skin.id)}
            className={`w-full px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] transition-colors ${
              currentSkin.id === skin.id ? 'font-semibold' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{skin.name[language]}</span>
              {currentSkin.id === skin.id && (
                <span className="text-xs text-[var(--color-accent)]">✓</span>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {skin.description[language]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
