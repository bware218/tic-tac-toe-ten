import React, { useState, useEffect, useCallback } from 'react';
import './ThemeToggle.css';

type Theme = 'light' | 'dark' | 'auto';

const THEME_KEY = 'ttt10-theme';

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  return 'auto';
}

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply the theme to the document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme(prev => {
      if (prev === 'auto') return 'dark';
      if (prev === 'dark') return 'light';
      return 'auto';
    });
  }, []);

  const label = theme === 'auto' ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light';
  const icon = theme === 'auto' ? '\u25D0' : theme === 'dark' ? '\u263E' : '\u2600'; // ◐ ☾ ☀

  return (
    <button
      className="theme-toggle"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">{icon}</span>
      <span className="theme-toggle__label">{label}</span>
    </button>
  );
};

export default ThemeToggle;
