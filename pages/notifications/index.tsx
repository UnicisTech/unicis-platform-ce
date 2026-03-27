import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import Link from 'next/link';

import NotificationItem from '@/components/notifications/NotificationItem';
import { Button } from '@/components/shadcn/ui/button';
import useNotifications from 'hooks/useNotifications';
import {
  getPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/notifications/push-client';

const NotificationsPage = () => {
  const { t } = useTranslation('common');
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    isLoading,
  } = useNotifications({ limit: 50 });

  const [pushStatus, setPushStatus] = useState<
    'unknown' | 'enabled' | 'disabled' | 'unsupported'
  >('unknown');
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushLoading, setPushLoading] = useState(false);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('notifications.title')}</h1>
        <div className="flex items-center gap-2">
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

      <section className="rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              {t('notifications.browser-push')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('notifications.browser-push-description')}
            </p>
          </div>
          {pushStatus === 'unsupported' ? (
            <span className="text-xs text-muted-foreground">
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
          <p className="mt-2 text-xs text-red-600">{pushError}</p>
        )}
      </section>

      <section className="space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        )}
        {!isLoading && notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">
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
