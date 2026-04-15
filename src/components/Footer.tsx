import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="mt-8 text-center text-[var(--color-text-muted)]">
      <div className="space-x-4">
        <a
          href="https://bookzhou.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--color-accent)] transition-colors"
        >
          {language === 'en' ? "Zhou Jing's Blog" : '周靖的博客'}
        </a>
        <span>|</span>
        <a
          href="https://github.com/transbot/PomodoroTimer"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--color-accent)] transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
