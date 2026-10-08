import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

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

  if (!token && (!email || !teamId)) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }

  let enrollment;

  if (token) {
    enrollment = await prisma.fleetEnrollment.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'TOKEN_NOT_FOUND' });
    }
  } else {
    const session = await getSession(req, res);
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (session.user.email?.toLowerCase() !== email?.trim().toLowerCase()) {
      return res.status(403).json({ error: 'EMAIL_MISMATCH' });
    }

    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId!,
          userId: currentUserId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    enrollment = await prisma.fleetEnrollment.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId!,
          userId: currentUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'ENROLLMENT_NOT_FOUND' });
    }
  }

  if (enrollment.expiresAt <= new Date()) {
    return res.status(410).json({ error: 'ENROLLMENT_EXPIRED' });
  }

  if (enrollment.status === 'COMPLETED') {
    return res.status(200).json({ success: true, alreadyCompleted: true });
  }

  if (!fleetPassword) {
    return res.status(400).json({ error: 'FLEET_PASSWORD_REQUIRED' });
  }

  const fleetBase = process.env.FLEET_API_URL;

  if (!fleetBase) {
    return res.status(503).json({ error: 'FLEET_NOT_CONFIGURED' });
  }

  let loginRes: Response;

  try {
    loginRes = await fetch(`${fleetBase}/api/v1/account/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: enrollment.user.email,
        password: fleetPassword,
      }),
    });
  } catch (error) {
    console.error('[EnrollComplete] Fleet login failed:', error);
    return res.status(502).json({ error: 'FLEET_UNAVAILABLE' });
  }

  if (!loginRes.ok) {
    return res.status(loginRes.status === 401 ? 401 : 502).json({
      error:
        loginRes.status === 401
          ? 'INVALID_FLEET_CREDENTIALS'
          : 'FLEET_LOGIN_FAILED',
    });
  }

  const loginData = await loginRes.json().catch(() => null);

  if (loginData?.is_temporary_password) {
    return res.status(409).json({ error: 'FLEET_PASSWORD_CHANGE_REQUIRED' });
  }

  const fleetToken = loginData?.fleet_access?.secret_key;

  if (!fleetToken) {
    return res.status(502).json({ error: 'FLEET_TOKEN_MISSING' });
  }

  await prisma.fleetEnrollment.update({
    where: { id: enrollment.id },
    data: { status: 'COMPLETED' },
  });

  try {
    const secretRes = await fetch(
      `${fleetBase}/api/v1/fleet/teams/${enrollment.teamId}/secret`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
        },
      }
    );

    if (!secretRes.ok) {
      console.error(
        '[EnrollComplete] Fleet secret order failed:',
        secretRes.status
      );
    }
  } catch (error) {
    console.error('[EnrollComplete] Failed to order Fleet secret:', error);
  }

  return res.status(200).json({ success: true });
}
