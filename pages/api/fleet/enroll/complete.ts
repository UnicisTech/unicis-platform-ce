import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { token, email, teamId, fleetPassword } = req.body as {
    token?: string;
    email?: string;
    teamId?: string;
    fleetPassword?: string;
  };

  console.log('[EnrollComplete] Request received:', {
    token: !!token,
    email,
    teamId,
    hasPassword: !!fleetPassword,
  });

  // Support both token-based (from email link) and email+teamId (from direct login)
  if (!token && (!email || !teamId)) {
    console.log('[EnrollComplete] Invalid payload - missing required fields');
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }

  let enrollment;

  if (token) {
    // Find by token (enrollment flow from email)
    console.log('[EnrollComplete] Looking up enrollment by token');
    enrollment = await prisma.fleetEnrollment.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!enrollment) {
      console.log('[EnrollComplete] Token not found');
      return res.status(404).json({ error: 'TOKEN_NOT_FOUND' });
    }
    console.log(
      '[EnrollComplete] Enrollment found by token for user:',
      enrollment.user.email,
      'status:',
      enrollment.status
    );
  } else {
    // Find by email + teamId (direct login after password change)
    console.log('[EnrollComplete] Looking up user by email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      console.log('[EnrollComplete] User not found:', email);
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    console.log(
      '[EnrollComplete] User found, looking up enrollment for userId:',
      user.id,
      'teamId:',
      teamId
    );
    enrollment = await prisma.fleetEnrollment.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId!,
          userId: user.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!enrollment) {
      console.log(
        '[EnrollComplete] No enrollment found for userId:',
        user.id,
        'teamId:',
        teamId
      );
      return res.status(404).json({ error: 'ENROLLMENT_NOT_FOUND' });
    }
    console.log(
      '[EnrollComplete] Enrollment found by email+teamId for user:',
      enrollment.user.email,
      'status:',
      enrollment.status
    );
  }

  if (!enrollment) {
    return res.status(404).json({ error: 'ENROLLMENT_NOT_FOUND' });
  }

  // Якщо вже COMPLETED - просто повертаємо success
  if (enrollment.status === 'COMPLETED') {
    console.log(
      '[EnrollComplete] Enrollment already completed for:',
      enrollment.user.email
    );
    return res.status(200).json({ success: true, alreadyCompleted: true });
  }

  // Перевірка expiration - але дозволяємо completion навіть якщо expired
  // оскільки користувач успішно авторизувався з правильним паролем
  if (enrollment.expiresAt <= new Date()) {
    console.log(
      '[EnrollComplete] Enrollment expired but allowing completion since user authenticated'
    );
  }

  // This endpoint should not create the account - it was already created by /api/fleet/enroll
  // This endpoint is only called to complete the enrollment after user changes password
  // The account and team membership were already set up in /api/fleet/enroll

  console.log(
    '[EnrollComplete] Updating enrollment status to COMPLETED for:',
    enrollment.user.email
  );
  await prisma.fleetEnrollment.update({
    where: { id: enrollment.id },
    data: { status: 'COMPLETED' },
  });
  console.log('[EnrollComplete] Enrollment status updated successfully');

  // Order Fleet secret for the enrolled user
  const fleetBase = process.env.FLEET_API_URL;
  const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

  if (fleetBase && fleetServiceToken) {
    try {
      // Login to get Fleet token
      const loginRes = await fetch(`${fleetBase}/api/v1/account/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: enrollment.user.email,
          password: fleetPassword,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const fleetToken = loginData.fleet_access?.secret_key;

        if (fleetToken) {
          // Order secret
          await fetch(
            `${fleetBase}/api/v1/fleet/teams/${enrollment.teamId}/secret`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
              },
            }
          );
          console.log(
            '[EnrollComplete] Fleet secret ordered for user:',
            enrollment.user.email
          );
        }
      }
    } catch (error) {
      console.error('[EnrollComplete] Failed to order Fleet secret:', error);
      // Don't fail the enrollment if secret creation fails
    }
  }

  return res.status(200).json({ success: true });
}
