import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan, SubscriptionStatus } from '@prisma/client';
import { sendSubscriptionRequest } from '@/lib/email/sendSubscriptionRequest';
import { addInitialPayment, changeSubscription } from 'models/subscription';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, PUT, DELETE');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Send a client subscription request to billing email
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_billing', 'create');

  const { companyName, address, zipCode, country, vatId, email, subscription } =
    req.body;
  console.log('req.body', req.body);
  const team = teamMember.team;
  const response = await sendSubscriptionRequest({
    team,
    companyName,
    address,
    zipCode,
    country,
    vatId,
    email,
    subscription,
  });
  if (response?.accepted.includes(env.billingEmail as string)) {
    const createdSubscription = await changeSubscription(
      team.id,
      Plan[subscription],
      SubscriptionStatus.PENDING
    );
    await addInitialPayment(team, createdSubscription);
  }
  console.log('restResp', response);
  res.status(200).json({ data: response });
};
