import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateToken, validateEmail } from '@/lib/common';
import { ApiError } from '@/lib/errors';
import { sendFleetPasswordResetEmail } from '@/lib/email/sendFleetPasswordResetEmail';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(422).json({ error: 'Invalid email address' });
  }

  // Check if user has Fleet enrollment
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      fleetEnrollments: {
        where: {
          status: 'COMPLETED',
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.fleetEnrollments || user.fleetEnrollments.length === 0) {
    return res.status(404).json({ error: 'No Fleet enrollment found for this user' });
  }

  // Generate reset token
  const resetToken = generateToken();

  // Create Fleet password reset record
  await prisma.fleetPasswordReset.create({
    data: {
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
    },
  });

  // Send email with reset link
  await sendFleetPasswordResetEmail(user, encodeURIComponent(resetToken));

  return res.status(200).json({ success: true });
}
