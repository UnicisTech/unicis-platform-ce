import { generateToken, validateEmail } from '@/lib/common';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { validateRecaptcha } from '@/lib/recaptcha';
import rateLimit from '@/lib/rate-limit';
import { getIpAddress } from '@/lib/utils';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 requests per second
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await limiter.check(5, getIpAddress(req), res); // 5 requests per minute for IP address
    try {
      switch (req.method) {
        case 'POST':
          await handlePOST(req, res);
          break;
        default:
          res.setHeader('Allow', 'POST');
          res.status(405).json({
            error: { message: `Method ${req.method} Not Allowed` },
          });
      }
    } catch (error: any) {
      const message = error.message || 'Something went wrong';
      const status = error.status || 500;
      res.status(status).json({ error: { message } });
    }
  } catch (error: any) {
    res.status(429).json({ error: { message: 'Rate limit exceeded' } });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, recaptchaToken } = req.body;

  await validateRecaptcha(recaptchaToken);

  if (!email || !validateEmail(email)) {
    throw new ApiError(422, 'The e-mail address you entered is invalid');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(422, `We can't find a user with that e-mail address`);
  }

  const resetToken = generateToken();

  await prisma.passwordReset.create({
    data: {
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
    },
  });

  await sendPasswordResetEmail(email, encodeURIComponent(resetToken));

  recordMetric('user.password.request');

  res.json({});
};
