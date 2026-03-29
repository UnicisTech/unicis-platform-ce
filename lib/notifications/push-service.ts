import webpush from 'web-push';

import env from '@/lib/env';
import { prisma } from '@/lib/prisma';

export type PushPayload = {
  title: string;
  body: string;
  url?: string | null;
};

let vapidConfigured = false;

const ensureVapid = () => {
  if (vapidConfigured) return;

  const { publicKey, privateKey, subject } = env.vapid;
  if (!publicKey || !privateKey || !subject) {
    throw new Error('VAPID keys are not configured');
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
};

export const pushService = {
  async sendToUser(userId: string, payload: PushPayload) {
    ensureVapid();

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    const message = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? undefined,
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dhKey,
                auth: subscription.authKey,
              },
            },
            message
          );
          sent += 1;
        } catch (error: any) {
          failed += 1;
          const statusCode = error?.statusCode as number | undefined;
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { id: subscription.id },
            });
          }
        }
      })
    );

    return { sent, failed };
  },
};
