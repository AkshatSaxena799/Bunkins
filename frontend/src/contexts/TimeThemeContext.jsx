import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TimeThemeContext = createContext({ theme: 'day', toggleTheme: () => {} });

export function useTimeTheme() {
  return useContext(TimeThemeContext);
}

function getTimeBasedTheme() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'day' : 'night';
}

export function TimeThemeProvider({ children }) {
  const [theme, setTheme] = useState(getTimeBasedTheme);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isManual) return;
    const interval = setInterval(() => {
      setTheme(getTimeBasedTheme());
    }, 60000);
    return () => clearInterval(interval);
  }, [isManual]);

  const toggleTheme = useCallback(() => {
    setIsManual(true);
    setTheme(prev => prev === 'day' ? 'night' : 'day');
  }, []);

  return (
    <TimeThemeContext.Provider value={{ theme, toggleTheme, isManual }}>
      {children}
    </TimeThemeContext.Provider>
  );
}
