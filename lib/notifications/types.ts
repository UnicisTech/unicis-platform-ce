import type { NotificationType } from '@/generated/client';

export type ChannelPrefs = {
  inApp: boolean;
  email: boolean;
  push: boolean;
};

export type CreateNotificationPayload = {
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  recipientId: string;
  recipientEmail?: string | null;
  teamId?: string | null;
  metadata?: Record<string, unknown> | null;
  dedupeKey?: string | null;
};

export type DeliveryAttempt = {
  at: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
};

export type NotificationDeliveryLog = {
  email?: DeliveryAttempt[];
  push?: DeliveryAttempt[];
};
