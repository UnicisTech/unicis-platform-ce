import { Team } from '@prisma/client';
import { sendEmail } from './sendEmail';
import { SubscriptionRequest } from '@/components/emailTemplates';
import { render } from '@react-email/components';
import env from '../env';

export const sendSubscriptionRequest = async ({
  companyName,
  address,
  zipCode,
  country,
  vatId,
  email,
  team,
  subscription,
}: {
  companyName: string;
  address: string;
  zipCode: string;
  country: string;
  vatId: string;
  email: string;
  team: Team;
  subscription: string;
}) => {
  // const invitationLink = `${env.appUrl}/invitations/${invitation.token}`;
  const html = render(
    SubscriptionRequest({
      companyName,
      address,
      zipCode,
      country,
      vatId,
      email,
      team,
      subscription,
    })
  );
  if (!env.billingEmail) {
    return;
  }
  console.log('sending Email', subscription);
  return await sendEmail({
    to: env.billingEmail,
    subject: 'Subscription Request',
    html,
  });
};
