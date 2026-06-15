import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import Header from './Header';
import Drawer from './Drawer';

import AiChat from './AiChat';

export default function AppShell({ children }) {
  const { t } = useTranslation('common');
  const { data, status } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      const { email, name } = data.user;
      if (email && name) {
        const [firstName, lastName] = name.split(' ') as string[];
        const matomo = (window as any).mt;
        if (typeof matomo === 'function') {
          matomo('send', 'pageview', {
            email: email,
            firstname: firstName,
            lastname: lastName,
            tags: 'BE',
          });
        }
      }
    }
  }, [status]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    return <p>{t('errors.accessDenied')}</p>;
  }

  return (
    <>
      <Drawer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <AiChat />
      <div className="lg:pl-64 dark:border-gray-200">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="py-6 dark:bg-black">
          <div className="mx-auto px-4 sm:px-6 lg:px-6">{children}</div>
        </main>
      </div>
    </>
  );
}
