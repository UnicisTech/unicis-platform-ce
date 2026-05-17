import { sendEmail } from './sendEmail';
import { render } from '@react-email/render';
import { FleetPasswordResetEmail } from '@/components/emailTemplates';
import app from '../app';
import env from '../env';
import { User } from '@prisma/client';

export const sendFleetPasswordResetEmail = async (user: User, token: string) => {
  const subject = `Reset your ${app.name} Fleet password`;
  const url = `${env.appUrl}/auth/reset-password/${token}`;

  const html = await render(
    FleetPasswordResetEmail({ url, subject, email: user.email })
  );

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};
