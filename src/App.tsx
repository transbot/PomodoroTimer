import React, { useState } from 'react';
import { Timer } from './components/Timer';
import { TimerSettings } from './components/TimerSettings';
import { Clock } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitch } from './components/LanguageSwitch';
import { useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { t } = useLanguage();

  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Clock className="w-8 h-8 text-red-500 mr-2" />
              <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
              <LanguageSwitch />
            </div>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>
          
          <Timer workTime={workTime} breakTime={breakTime} />
          
          <div className="mt-12 border-t pt-8">
            <TimerSettings
              workTime={workTime}
              breakTime={breakTime}
              onWorkTimeChange={setWorkTime}
              onBreakTimeChange={setBreakTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;