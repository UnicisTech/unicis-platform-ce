import { useState, useCallback } from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import React from 'react';
import Header from './Header';
import Drawer from './Drawer';

import GlobalTheme from '@atlaskit/theme/components';
import { ThemeModes } from '@atlaskit/theme/types';

export default function AppShell({ children }) {
  const { status } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [atlaskitTheme, setAtlaskitTheme] = useState<ThemeModes>('dark');

  const getAtlaskitThemeMode = useCallback(() => {
    return { mode: atlaskitTheme };
  }, [atlaskitTheme]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  return (
    <GlobalTheme.Provider value={getAtlaskitThemeMode}>
      <Drawer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64 dark:border-gray-200">
        <Header
          setSidebarOpen={setSidebarOpen}
          themeCallback={setAtlaskitTheme}
        />
        <main className="py-10 dark:bg-black">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </GlobalTheme.Provider>
  );
}
