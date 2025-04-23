import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError, isPrismaError } from '@/lib/errors';
import env from '@/lib/env';
import { getUser } from 'models/user';
import { UserReturned } from 'types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'PUT');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    if (isPrismaError(error)) {
      return res.status(status).json({ error: 'Prisma Error' });
    }

    res.status(status).json({ error: { message } });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const allowEmailChange = env.confirmEmail === false;
  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const toUpdate = {};

  if (
    'firstName' in req.body &&
    typeof req.body.firstName === 'string' &&
    'lastName' in req.body &&
    typeof req.body.lastName === 'string'
  ) {
    toUpdate['firstName'] = req.body.firstName.trim();
    toUpdate['lastName'] = req.body.lastName.trim();
    toUpdate['name'] =
      `${req.body.firstName.trim()} ${req.body.lastName.trim()}`;
  }

  // Only allow email change if confirmEmail is false
  if (
    'email' in req.body &&
    typeof req.body.email === 'string' &&
    allowEmailChange
  ) {
    const user = await getUser({ email: req.body.email.trim() });

    if (user && user.id !== session?.user.id) {
      throw new ApiError(400, 'Email already in use.');
    }

    toUpdate['email'] = req.body.email.trim();
  }

  if ('image' in req.body && typeof req.body.image === 'string') {
    toUpdate['image'] = req.body.image.trim();
  }

  if (Object.keys(toUpdate).length === 0) {
    throw new ApiError(400, 'Invalid request');
  }

  const user = await prisma.user.update({
    where: { id: session?.user.id },
    data: toUpdate,
  });

  recordMetric('user.updated');

  res.status(200).json({
    data: {
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
    } as UserReturned,
  });
};
