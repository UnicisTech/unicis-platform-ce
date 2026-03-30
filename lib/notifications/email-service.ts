import env from '@/lib/env';
import app from '@/lib/app';
import { sendEmail } from '@/lib/email/sendEmail';
import { JSDOM } from 'jsdom';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const escapeHtml = (value: string) => {
  const dom = new JSDOM('');
  const textNode = dom.window.document.createTextNode(value);
  const container = dom.window.document.createElement('div');
  container.appendChild(textNode);
  return container.innerHTML;
};

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
  <head><meta charset="utf-8" /></head>
  <body style="background-color: #ffffff; margin: auto; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
      <tr>
        <td align="center">
          <table width="465" cellpadding="0" cellspacing="0" style="border: 1px solid #f0f0f0; border-radius: 4px; background-color: #ffffff; margin: 40px auto; padding: 20px;">
            <tr>
              <td align="center" style="padding: 32px 0 32px;">
                <img src="${app.emailLogoUrl}" alt="${app.name}" style="max-height: 40px;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 0 20px;">
                <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #111827;">${title}</h2>
                <p style="margin: 0 0 16px; font-size: 14px; color: #374151; line-height: 1.6;">${body}</p>
                ${
                  link
                    ? `<table cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
                  <tr>
                    <td align="center" style="border-radius: 4px; background-color: #0052cc;">
                      <a href="${link}" style="display: inline-block; padding: 16px 20px; background-color: #0052cc; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">Open</a>
                    </td>
                  </tr>
                </table>`
                    : ''
                }
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0; width: 100%;" />
                <p style="margin: 0; text-align: center; font-size: 12px; color: #666666;">${app.name}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
