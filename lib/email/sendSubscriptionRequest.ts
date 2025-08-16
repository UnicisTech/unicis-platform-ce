import { Team } from '@prisma/client';
import { sendEmail } from './sendEmail';
import { SubscriptionRequest } from '@/components/emailTemplates';
import { render } from '@react-email/render';
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
  //TODO: throw error if env.billingEmail is not set
  if (!env.billingEmail) {
    return;
  }

  const html = await render(
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

  return await sendEmail({
    to: env.billingEmail,
    subject: 'Subscription Request',
    html,
  });
};
