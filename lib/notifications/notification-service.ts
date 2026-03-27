import { NotificationType, Prisma } from '@/generated/client';

import { prisma } from '@/lib/prisma';

import { buildNotificationEmail, emailService } from './email-service';
import { pushService } from './push-service';
import type {
  ChannelPrefs,
  CreateNotificationPayload,
  DeliveryAttempt,
  NotificationDeliveryLog,
} from './types';

const DEFAULT_PREFERENCES: Record<NotificationType, ChannelPrefs> = {
  TASK_DUE: { inApp: true, email: true, push: true },
  TASK_CREATED: { inApp: true, email: true, push: true },
  TASK_UPDATED: { inApp: true, email: true, push: true },
  TASK_COMMENTED: { inApp: true, email: true, push: true },
  TASK_DELETED: { inApp: true, email: true, push: true },
  FILE_UPLOADED: { inApp: true, email: true, push: true },
};

const nowIso = () => new Date().toISOString();

const ensureDeliveryLog = (
  metadata: Prisma.JsonObject
): NotificationDeliveryLog => {
  const existing = (metadata.delivery ?? {}) as NotificationDeliveryLog;

  return {
    ...existing,
    email: [...(existing.email ?? [])],
    push: [...(existing.push ?? [])],
  };
};

const appendAttempt = (
  delivery: NotificationDeliveryLog,
  channel: 'email' | 'push',
  attempt: DeliveryAttempt
) => {
  const list = delivery[channel] ?? [];
  delivery[channel] = [...list, attempt];
};

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

export const notificationService = {
  async getPreferences(userId: string, type: NotificationType) {
    const record = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    const rawPreferences = record?.preferences as
      | Partial<Record<NotificationType, ChannelPrefs>>
      | undefined;
    const override = rawPreferences?.[type];

    return {
      ...DEFAULT_PREFERENCES[type],
      ...(override ?? {}),
    };
  },

  async send(payload: CreateNotificationPayload) {
    const prefs = await this.getPreferences(payload.recipientId, payload.type);

    if (!prefs.inApp && !prefs.email && !prefs.push) {
      return null;
    }

    const baseMetadata = (payload.metadata ?? {}) as Prisma.JsonObject;
    const delivery = ensureDeliveryLog(baseMetadata);
    const metadata = {
      ...baseMetadata,
      delivery,
      ...(prefs.inApp ? {} : { hidden: true }),
    } as Prisma.InputJsonValue;

    let notification;

    try {
      notification = await prisma.notification.create({
        data: {
          type: payload.type,
          title: payload.title,
          body: payload.body,
          link: payload.link ?? null,
          metadata,
          dedupeKey: payload.dedupeKey ?? null,
          recipientId: payload.recipientId,
          teamId: payload.teamId ?? null,
          ...(prefs.inApp ? {} : { isRead: true, readAt: new Date() }),
        },
      });
    } catch (error) {
      if (payload.dedupeKey && isUniqueViolation(error)) {
        return null;
      }
      throw error;
    }

    if (prefs.email) {
      if (!payload.recipientEmail) {
        appendAttempt(delivery, 'email', {
          at: nowIso(),
          status: 'skipped',
          error: 'missing recipient email',
        });
      } else {
        try {
          const { html, text } = buildNotificationEmail({
            title: payload.title,
            body: payload.body,
            link: payload.link ?? null,
          });

          await emailService.send({
            to: payload.recipientEmail,
            subject: payload.title,
            html,
            text,
          });

          appendAttempt(delivery, 'email', {
            at: nowIso(),
            status: 'sent',
          });
        } catch (error: any) {
          appendAttempt(delivery, 'email', {
            at: nowIso(),
            status: 'failed',
            error: error?.message ?? 'email send failed',
          });
        }
      }
    }

    if (prefs.push) {
      try {
        const result = await pushService.sendToUser(payload.recipientId, {
          title: payload.title,
          body: payload.body,
          url: payload.link ?? null,
        });

        if (result.sent === 0) {
          appendAttempt(delivery, 'push', {
            at: nowIso(),
            status: 'skipped',
            error: 'no subscriptions',
          });
        } else {
          appendAttempt(delivery, 'push', {
            at: nowIso(),
            status: result.failed > 0 ? 'failed' : 'sent',
            error: result.failed > 0 ? 'partial failure' : undefined,
          });
        }
      } catch (error: any) {
        appendAttempt(delivery, 'push', {
          at: nowIso(),
          status: 'failed',
          error: error?.message ?? 'push send failed',
        });
      }
    }

    await prisma.notification.update({
      where: { id: notification.id },
      data: { metadata },
    });

    return notification;
  },

  async sendBulk(payloads: CreateNotificationPayload[]) {
    return Promise.all(payloads.map((payload) => this.send(payload)));
  },
};
