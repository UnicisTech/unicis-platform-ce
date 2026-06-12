import type { SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import Link from 'next/link';

import NotificationItem from '@/components/notifications/NotificationItem';
import { Button } from '@/components/shadcn/ui/button';
import { PerPageSelector } from '@/components/shared';
import PaginationControls from '@/components/shadcn/ui/audit-pagination';
import useNotifications from 'hooks/useNotifications';
import {
  getPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/notifications/push-client';

const NotificationsPage = () => {
  const { t } = useTranslation('common');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    isLoading,
    total,
  } = useNotifications({ limit: perPage, page });

  const [pushStatus, setPushStatus] = useState<
    'unknown' | 'enabled' | 'disabled' | 'unsupported'
  >('unknown');
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const hasLoaded = total > 0 || notifications.length > 0;

  const currentPage = hasLoaded ? Math.min(page, totalPages) : page;

  const handlePerPageChange = (value: SetStateAction<number>) => {
    setPerPage(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(nextPage, totalPages));
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!isPushSupported()) {
        if (mounted) setPushStatus('unsupported');
        return;
      }

      const subscription = await getPushSubscription();
      if (mounted) {
        setPushStatus(subscription ? 'enabled' : 'disabled');
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleEnablePush = async () => {
    setPushError(null);
    setPushLoading(true);
    try {
      await subscribeToPush();
      setPushStatus('enabled');
    } catch (error: any) {
      setPushError(error?.message ?? 'Failed to enable push');
    } finally {
      setPushLoading(false);
    }
  };

  const handleDisablePush = async () => {
    setPushError(null);
    setPushLoading(true);
    try {
      await unsubscribeFromPush();
      setPushStatus('disabled');
    } catch (error: any) {
      setPushError(error?.message ?? 'Failed to disable push');
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t('notifications.title')}</h1>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <PerPageSelector perPage={perPage} setPerPage={handlePerPageChange} />
          <Button variant="outline" asChild>
            <Link href="/notifications/settings">
              {t('notifications.settings')}
            </Link>
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead}>
              {t('notifications.mark-all-read')}
            </Button>
          )}
        </div>
      </div>

      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              {t('notifications.browser-push')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('notifications.browser-push-description')}
            </p>
          </div>
          {pushStatus === 'unsupported' ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('not-supported')}
            </span>
          ) : pushStatus === 'enabled' ? (
            <Button
              variant="outline"
              onClick={handleDisablePush}
              disabled={pushLoading}
            >
              {t('disable')}
            </Button>
          ) : (
            <Button onClick={handleEnablePush} disabled={pushLoading}>
              {t('enable')}
            </Button>
          )}
        </div>
        {pushError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {pushError}
          </p>
        )}
      </section>

      <section className="space-y-3">
        {isLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('loading')}
          </p>
        )}
        {!isLoading && notifications.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('notifications.none')}
          </p>
        )}
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={markAsRead}
          />
        ))}
      </section>

      {totalPages > 1 && (
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default NotificationsPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}
