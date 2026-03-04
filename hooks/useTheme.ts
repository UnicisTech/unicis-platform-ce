import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';

import { Theme, ThemesProps, applyTheme } from '@/lib/theme';

const parseTheme = (value: string | null): Theme | null => {
  if (value === 'dark' || value === 'light' || value === 'system') {
    return value;
  }
  return null;
};

const useTheme = () => {
  const [theme, setTheme] = useState<Theme | null>(() => {
    if (typeof window === 'undefined') return null;
    return parseTheme(localStorage.getItem('theme'));
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    const handleStorageChange = () => {
      const updated = parseTheme(localStorage.getItem('theme'));
      setTheme(updated);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemPreference = () => {
      setSystemPrefersDark(media.matches);
    };

    updateSystemPreference();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateSystemPreference);
    } else {
      media.addListener(updateSystemPreference);
    }

    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', updateSystemPreference);
      } else {
        media.removeListener(updateSystemPreference);
      }
    };
  }, []);

  const themes: ThemesProps[] = [
    {
      id: 'system',
      name: t('system'),
      icon: ComputerDesktopIcon,
    },
    {
      id: 'dark',
      name: t('dark'),
      icon: MoonIcon,
    },
    {
      id: 'light',
      name: t('light'),
      icon: SunIcon,
    },
  ];

  const selectedTheme = themes.find((t) => t.id === theme) || themes[0];
  const resolvedTheme = useMemo<Exclude<Theme, 'system'>>(() => {
    if (theme === 'dark' || theme === 'light') return theme;
    return systemPrefersDark ? 'dark' : 'light';
  }, [theme, systemPrefersDark]);
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    const newTheme =
      selectedTheme.id === 'light'
        ? 'dark'
        : selectedTheme.id === 'dark'
          ? 'light'
          : 'dark';

    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setTheme(newTheme);

    window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));
  };

  return {
    theme,
    setTheme,
    selectedTheme,
    toggleTheme,
    themes,
    applyTheme,
    resolvedTheme,
    isDark,
  };
};

export default useTheme;
