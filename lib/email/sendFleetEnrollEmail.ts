import { render } from '@react-email/components';
import env from '@/lib/env';
import app from '@/lib/app';
import { sendEmail } from './sendEmail';
import FleetEnrollEmail from '@/components/emailTemplates/FleetEnrollEmail';

export const sendFleetEnrollEmail = async (
  toEmail: string,
  team: { name: string; slug: string },
  token: string,
  tempPassword: string
) => {
  if (!toEmail) return;

  const baseUrl =
    env.appUrl?.replace(/\/$/, '') || 'http://localhost:4002';

  const enrollLink =
    `${baseUrl}/teams/${team.slug}/asset` +
    `?fleetEnrollToken=${encodeURIComponent(token)}`;

  const subject = `Fleet enrollment for ${team.name} on ${app.name}`;

  const html = await render(
    FleetEnrollEmail({
      subject,
      teamName: team.name,
      enrollLink,
      tempPassword,
    })
  );

  await sendEmail({
    to: toEmail,
    subject,
    html,
  });
};
