import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import Header from './Header';
import Drawer from './Drawer';
import useTeam from 'hooks/useTeam';
import { setCustomDimension } from '@/lib/matomo/client';

import AiChat from './AiChat';

export default function AppShell({ children }) {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const { team } = useTeam();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Custom Dimensions 1 (Subscription Tier) and 2 (Frameworks Enabled) must
  // be created in Matomo Admin > Manage Custom Dimensions before this does
  // anything — Matomo silently ignores unset dimension slots.
  useEffect(() => {
    if (!team) return;
    if (team.subscription?.plan) {
      setCustomDimension(1, team.subscription.plan);
    }
    const csc_iso = (team.properties as { csc_iso?: string[] } | null)?.csc_iso;
    if (csc_iso?.length) {
      setCustomDimension(2, csc_iso.join(','));
    }
  }, [team]);

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
