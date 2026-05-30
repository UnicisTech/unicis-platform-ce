import { hashPassword, validatePasswordPolicy } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import { recordMetric } from '@/lib/metrics';
import { passwordPolicies } from '@/lib/common';

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
        res.setHeader('Allow', 'POST');
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

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token, password } = req.body;

  if (!token) {
    throw new ApiError(422, 'Password reset token is required');
  }

  // Check if this is a Fleet password reset token
  const fleetPasswordReset = await prisma.fleetPasswordReset.findUnique({
    where: { token },
  });

  if (fleetPasswordReset) {
    // Handle Fleet password reset
    if (fleetPasswordReset.expiresAt < new Date()) {
      throw new ApiError(
        422,
        'Password reset token has expired. Please request a new one.'
      );
    }

    // Validate Fleet password policy
    if (!password || password.length < passwordPolicies.fleetMinLength) {
      throw new ApiError(
        422,
        `Password must be at least ${passwordPolicies.fleetMinLength} characters`
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: fleetPasswordReset.email },
    });

    if (!user) {
      throw new ApiError(422, 'User not found');
    }

    // Change Fleet password via Fleet API
    const fleetBase = process.env.FLEET_API_URL;
    const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

    if (!fleetBase || !fleetServiceToken) {
      throw new ApiError(500, 'Fleet configuration missing');
    }

    // Call Fleet API to admin reset password (no oldPassword required)
    const response = await fetch(`${fleetBase}/api/v1/account/admin-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fleetServiceToken}`,
      },
      body: JSON.stringify({
        email: user.email,
        newPassword: password,
      }),
    });

    if (!response.ok) {
      console.error('[FleetPasswordReset] Failed to reset Fleet password:', await response.text());
      throw new ApiError(500, 'Failed to reset Fleet password');
    }

    // Delete the token
    await prisma.fleetPasswordReset.delete({
      where: { token },
    });

    recordMetric('user.fleet_password.reset');

    return res.status(200).json({
      message: 'Fleet password reset successfully',
      type: 'fleet'
    });
  }

  // Handle Platform password reset (original logic)
  validatePasswordPolicy(password);

  const passwordReset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!passwordReset) {
    throw new ApiError(
      422,
      'Invalid password reset token. Please request a new one.'
    );
  }

  if (passwordReset.expiresAt < new Date()) {
    throw new ApiError(
      422,
      'Password reset token has expired. Please request a new one.'
    );
  }

  const hashedPassword = await hashPassword(password);

  await Promise.all([
    prisma.user.update({
      where: { email: passwordReset.email },
      data: {
        password: hashedPassword,
      },
    }),
    prisma.passwordReset.delete({
      where: { token },
    }),
  ]);

  recordMetric('user.password.reset');

  res.status(200).json({
    message: 'Password reset successfully',
    type: 'platform'
  });
};
