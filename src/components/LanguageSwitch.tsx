import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="p-2 skin-button-secondary flex items-center"
      style={{ borderRadius: 'var(--radius-button)' }}
      aria-label="Switch Language"
    >
      <Languages className="w-5 h-5" />
      <span className="ml-2 text-sm">{language === 'en' ? '中文' : 'EN'}</span>
    </button>
  );
}
