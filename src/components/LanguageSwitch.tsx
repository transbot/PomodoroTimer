import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
      aria-label="Switch Language"
    >
      <Languages className="w-5 h-5 text-gray-600" />
      <span className="ml-2 text-sm text-gray-600">{language === 'en' ? '中文' : 'EN'}</span>
    </button>
  );
}