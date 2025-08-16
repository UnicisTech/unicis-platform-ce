import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

import { ThemesProps, applyTheme } from '@/lib/theme';

const useTheme = () => {
  const [theme, setTheme] = useState<string | null>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    const current = localStorage.getItem('theme');
    setTheme(current);

    const handleStorageChange = () => {
      const updated = localStorage.getItem('theme');
      setTheme(updated);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
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

  return { theme, setTheme, selectedTheme, toggleTheme, themes, applyTheme };
};

export default useTheme;
