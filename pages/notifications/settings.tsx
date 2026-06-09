import { useEffect, useMemo, useState } from 'react';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/shadcn/ui/button';
import { Checkbox } from '@/components/shadcn/ui/checkbox';
import { Label } from '@/components/shadcn/ui/label';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPES,
} from '@/lib/notifications/preferences';
import type { NotificationType } from '@/generated/enums';
import type { ChannelPrefs } from '@/lib/notifications/preferences';
import useNotificationPreferences from 'hooks/useNotificationPreferences';

const channelOrder: Array<keyof ChannelPrefs> = ['inApp', 'email', 'push'];

const channelLabelKey: Record<keyof ChannelPrefs, string> = {
  inApp: 'notifications.channels.in-app',
  email: 'notifications.channels.email',
  push: 'notifications.channels.push',
};

const buildMergedPreferences = (
  raw: Partial<Record<NotificationType, ChannelPrefs>>
) => {
  const merged = {} as Record<NotificationType, ChannelPrefs>;

  for (const { type } of NOTIFICATION_TYPES) {
    merged[type] = {
      ...DEFAULT_NOTIFICATION_PREFERENCES[type],
      ...(raw?.[type] ?? {}),
    };
  }

  return merged;
};

const NotificationSettingsPage = () => {
  const { t } = useTranslation('common');
  const { preferences, isLoading, updatePreferences } =
    useNotificationPreferences();

  const mergedPreferences = useMemo(
    () => buildMergedPreferences(preferences),
    [preferences]
  );

  const [draft, setDraft] =
    useState<Record<NotificationType, ChannelPrefs>>(mergedPreferences);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(mergedPreferences);
    setDirty(false);
  }, [mergedPreferences]);

  const handleToggle = (
    type: NotificationType,
    channel: keyof ChannelPrefs,
    checked: boolean
  ) => {
    setDraft((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: checked,
      },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(draft);
      setDirty(false);
      toast.success(t('notifications.saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {t('notifications.preferences-title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('notifications.preferences-description')}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || saving || isLoading}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('save')
          )}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_90px_90px_90px] gap-2 border-b bg-slate-100/60 dark:bg-slate-700/60 px-4 py-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          <span>{t('notifications.type')}</span>
          {channelOrder.map((channel) => (
            <span key={channel} className="text-center">
              {t(channelLabelKey[channel])}
            </span>
          ))}
        </div>
        <div className="divide-y">
          {NOTIFICATION_TYPES.map(({ type, labelKey }) => (
            <div
              key={type}
              className="grid grid-cols-[1fr_90px_90px_90px] items-center gap-2 px-4 py-3"
            >
              <span className="text-sm">{t(labelKey)}</span>
              {channelOrder.map((channel) => {
                const checkboxId = `${type}-${channel}`;
                const checked = draft[type]?.[channel] ?? false;

                return (
                  <div
                    key={channel}
                    className="flex items-center justify-center"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={(value) =>
                        handleToggle(type, channel, value === true)
                      }
                    />
                    <Label htmlFor={checkboxId} className="sr-only">
                      {t(labelKey)} {t(channelLabelKey[channel])}
                    </Label>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}
