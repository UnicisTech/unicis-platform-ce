import fetcher from '@/lib/fetcher';
import useSWR, { mutate as globalMutate } from 'swr';
import type { ApiResponse, NotificationListResponse } from 'types';

const buildQuery = (params: Record<string, string | number | boolean>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    search.set(key, String(value));
  });
  return search.toString();
};

const getUnreadOnlyFromKey = (key: string) => {
  const queryIndex = key.indexOf('?');
  if (queryIndex === -1) return false;
  const params = new URLSearchParams(key.slice(queryIndex + 1));
  return params.get('unreadOnly') === 'true';
};

const isNotificationsKey = (cacheKey: unknown) =>
  typeof cacheKey === 'string' && cacheKey.startsWith('/api/notifications');

const useNotifications = (options?: {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}) => {
  const limit = options?.limit ?? 10;
  const page = options?.page ?? 1;
  const unreadOnly = options?.unreadOnly ?? false;

  const query = buildQuery({ limit, unreadOnly, page });
  const key = `/api/notifications?${query}`;

  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<NotificationListResponse>
  >(key, fetcher, { keepPreviousData: true });

  const revalidateAll = () => globalMutate(isNotificationsKey);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    globalMutate(
      isNotificationsKey,
      (current, cacheKey) => {
        if (!current || current.error || typeof cacheKey !== 'string') {
          return current;
        }
        const cacheUnreadOnly = getUnreadOnlyFromKey(cacheKey);
        const hasItem = current.data.notifications.some(
          (notification) => notification.id === id
        );
        const wasUnread = hasItem
          ? current.data.notifications.find(
              (notification) => notification.id === id
            )?.isRead === false
          : true;
        const updatedNotifications = current.data.notifications.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }
              : notification
        );
        const nextUnreadCount = wasUnread
          ? Math.max(0, current.data.unreadCount - 1)
          : current.data.unreadCount;

        return {
          data: {
            ...current.data,
            notifications: cacheUnreadOnly
              ? updatedNotifications.filter((item) => !item.isRead)
              : updatedNotifications,
            unreadCount: nextUnreadCount,
          },
          error: current.error,
        };
      },
      { revalidate: false }
    );
    revalidateAll();
  };

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    globalMutate(
      isNotificationsKey,
      (current, cacheKey) => {
        if (!current || current.error || typeof cacheKey !== 'string') {
          return current;
        }
        const cacheUnreadOnly = getUnreadOnlyFromKey(cacheKey);
        const now = new Date().toISOString();
        const updatedNotifications = current.data.notifications.map(
          (notification) => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt ?? now,
          })
        );

        return {
          data: {
            ...current.data,
            notifications: cacheUnreadOnly ? [] : updatedNotifications,
            unreadCount: 0,
          },
          error: current.error,
        };
      },
      { revalidate: false }
    );
    revalidateAll();
  };

  return {
    isLoading,
    isError: error,
    notifications: data?.data.notifications ?? [],
    total: data?.data.total ?? 0,
    unreadCount: data?.data.unreadCount ?? 0,
    markAsRead,
    markAllRead,
    refresh: mutate,
  };
};

export default useNotifications;
