import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getZodiacForWeekday } from '../utils/zodiac';

export function ZodiacBackground() {
  const { language } = useLanguage();
  const today = new Date();
  const weekday = today.getDay();
  
  // Convert Sunday (0) to 7 for consistent indexing
  const adjustedWeekday = weekday === 0 ? 7 : weekday;
  const zodiac = getZodiacForWeekday(adjustedWeekday);

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        style={{ backgroundImage: `url(${zodiac.constellation})` }}
      />
      <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <p className="text-sm text-gray-600">
          {language === 'en' ? zodiac.name.en : zodiac.name.zh}
        </p>
      </div>
    </>
  );
}