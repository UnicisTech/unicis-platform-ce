import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { cn } from '@/components/shadcn/lib/utils';
import type { NotificationDto } from 'types';

type NotificationItemProps = {
  notification: NotificationDto;
  onRead?: (id: string) => void;
  compact?: boolean;
};

const NotificationItem = ({
  notification,
  onRead,
  compact = false,
}: NotificationItemProps) => {
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createdAt = notification.createdAt
    ? new Date(notification.createdAt)
    : null;
  const timeLabel = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : '';

  const handleRead = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!notification.isRead && onRead) {
      onRead(notification.id);
    }
  };

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }
    if (hoverTimeoutRef.current || notification.isRead || !onRead) {
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      hoverTimeoutRef.current = null;
      if (!notification.isRead) {
        onRead(notification.id);
      }
    }, 350);
  };

  const handleMouseLeave = () => {
    clearHoverTimeout();
  };

  useEffect(() => {
    if (notification.isRead) {
      clearHoverTimeout();
    }
    return () => {
      clearHoverTimeout();
    };
  }, [notification.isRead]);

  const body = (
    <div
      className={cn(
        'rounded-md border px-3 py-2 transition-colors',
        notification.isRead ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/40',
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">
            {notification.title?.split('\n').map((line, i) => (
              <p key={i} className="truncate">
                {line}
              </p>
            ))}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
            {notification.body}
          </p>
        </div>
        {!notification.isRead && (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        )}
      </div>
      {timeLabel && (
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{timeLabel}</p>
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={handleRead}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRead}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full text-left"
    >
      {body}
    </button>
  );
};

export default NotificationItem;
