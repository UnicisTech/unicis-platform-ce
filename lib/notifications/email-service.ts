import env from '@/lib/env';
import { sendEmail } from '@/lib/email/sendEmail';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildNotificationEmail = (payload: {
  title: string;
  body: string;
  link?: string | null;
}) => {
  const title = escapeHtml(payload.title);
  const body = escapeHtml(payload.body);
  const link = payload.link ? `${env.appUrl}${payload.link}` : null;

  return {
    html: `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 20px; color: #111;">${title}</h2>
      <p style="margin: 0 0 16px; font-size: 14px; color: #333; line-height: 1.5;">${body}</p>
      ${
        link
          ? `<a href="${link}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">Open</a>`
          : ''
      }
    </div>
  </body>
</html>`,
    text: `${payload.title}\n\n${payload.body}${link ? `\n\n${link}` : ''}`,
  };
};

export const emailService = {
  async send(payload: EmailPayload) {
    return sendEmail(payload);
  },
};
