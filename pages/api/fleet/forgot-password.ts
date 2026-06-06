import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateToken, validateEmail } from '@/lib/common';
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

  // Check if user exists in Platform
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if Fleet account exists
  const fleetBase = process.env.FLEET_API_URL;
  const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

  if (!fleetBase || !fleetServiceToken) {
    return res.status(500).json({ error: 'Fleet configuration missing' });
  }

  try {
    const fleetAccountRes = await fetch(
      `${fleetBase}/api/v1/account/users/${user.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetServiceToken}`,
        },
      }
    );

    if (!fleetAccountRes.ok) {
      console.log(
        '[FleetForgotPassword] No Fleet account found for user:',
        email
      );
      return res
        .status(404)
        .json({ error: 'No Fleet account found for this user' });
    }

    console.log('[FleetForgotPassword] Fleet account exists for user:', email);
  } catch (error) {
    console.error('[FleetForgotPassword] Error checking Fleet account:', error);
    return res.status(500).json({ error: 'Failed to verify Fleet account' });
  }

  // Generate reset token
  const resetToken = generateToken();

  await prisma.fleetPasswordReset.create({
    data: {
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  await sendFleetPasswordResetEmail(user, encodeURIComponent(resetToken));

  return res.status(200).json({ success: true });
}
