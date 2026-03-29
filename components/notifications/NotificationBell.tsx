import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

import useNotifications from 'hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { Button } from '@/components/shadcn/ui/button';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
  const { t } = useTranslation('common');
  const { notifications, unreadCount, markAsRead, markAllRead, isLoading } =
    useNotifications({ limit: 5 });

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {badgeLabel}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1 text-sm font-semibold">
          <span>{t('notifications.title')}</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('notifications.mark-all-read')}
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 space-y-2 overflow-y-auto px-2 py-2">
          {isLoading && (
            <p className="text-xs text-muted-foreground">{t('loading')}</p>
          )}
          {!isLoading && notifications.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {t('notifications.none')}
            </p>
          )}
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              compact
            />
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <Link href="/notifications" className="text-xs text-blue-600">
            {t('notifications.view-all')}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
