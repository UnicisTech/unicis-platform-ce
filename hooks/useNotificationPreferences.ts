import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import type { ApiResponse } from 'types';
import type { NotificationType } from '@/generated/enums';
import type { ChannelPrefs } from '@/lib/notifications/preferences';

export type NotificationPreferences = Partial<
  Record<NotificationType, ChannelPrefs>
>;

const useNotificationPreferences = () => {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<{ preferences: NotificationPreferences }>
  >('/api/notifications/preferences', fetcher);

  const preferences = data?.data.preferences ?? {};

  const updatePreferences = async (updated: NotificationPreferences) => {
    await fetch('/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: updated }),
    });
    mutate();
  };

  return {
    preferences,
    isLoading,
    isError: error,
    updatePreferences,
    refresh: mutate,
  };
};

export default useNotificationPreferences;
