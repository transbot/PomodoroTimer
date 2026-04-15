import React, { useState } from 'react';
import { Timer } from './components/Timer';
import { TimerSettings } from './components/TimerSettings';
import { Clock, BarChart3 } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitch } from './components/LanguageSwitch';
import { useLanguage } from './contexts/LanguageContext';
import { SkinSwitch } from './components/SkinSwitch';
import { SkinProvider } from './contexts/SkinContext';
import { StatisticsProvider } from './contexts/StatisticsContext';
import { StatisticsModal } from './components/StatisticsModal';
import { Footer } from './components/Footer';

function AppContent() {
  const { t } = useLanguage();
  const [showStats, setShowStats] = useState(false);

  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto skin-card p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4 flex-wrap gap-4">
              <Clock className="w-8 h-8 text-[var(--color-accent)]" />
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
              <LanguageSwitch />
              <SkinSwitch />
              <button
                onClick={() => setShowStats(true)}
                className="p-2 skin-button-secondary flex items-center gap-2"
                style={{ borderRadius: 'var(--radius-button)' }}
                title={t('statistics')}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[var(--color-text-secondary)]">{t('subtitle')}</p>
          </div>

          <Timer workTime={workTime} breakTime={breakTime} />

          <div className="mt-12 border-t border-[var(--color-border)] pt-8">
            <TimerSettings
              workTime={workTime}
              breakTime={breakTime}
              onWorkTimeChange={setWorkTime}
              onBreakTimeChange={setBreakTime}
            />
          </div>
          <Footer />
        </div>
      </div>

      <StatisticsModal isOpen={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <SkinProvider>
        <StatisticsProvider>
          <AppContent />
        </StatisticsProvider>
      </SkinProvider>
    </LanguageProvider>
  );
}

export default App;
