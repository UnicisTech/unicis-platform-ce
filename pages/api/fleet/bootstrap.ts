import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

type Body = {
  teamId: string;
  password: string;
};

/**
 * Bootstrap endpoint for team owners to create their own Fleet account
 * without going through the enrollment email flow
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[Bootstrap] Handler called, method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    console.log('[Bootstrap] Getting session...');
    const session = await getSession(req, res);
    const userId = session?.user?.id;
    console.log('[Bootstrap] User ID from session:', userId);

    if (!userId) {
      console.error('[Bootstrap] No user ID in session');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { teamId, password } = req.body as Body;
    console.log(
      '[Bootstrap] Request body - teamId:',
      teamId,
      'password:',
      password ? '[REDACTED]' : 'missing'
    );

    if (!teamId || !password) {
      return res
        .status(400)
        .json({ error: 'teamId and password are required' });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
        role: 'OWNER',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'Must be team owner to bootstrap' });
    }

    const fleetBase = process.env.FLEET_API_URL;
    const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

    if (!fleetBase || !fleetServiceToken) {
      console.error('Fleet configuration missing');
      return res.status(500).json({ error: 'FLEET_NOT_CONFIGURED' });
    }

    // Step 1: Create account in Fleet
    console.log(
      '[Bootstrap] Creating Fleet account for user:',
      teamMember.user.email
    );
    const createRes = await fetch(`${fleetBase}/api/v1/account/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fleetServiceToken}`,
      },
      body: JSON.stringify({
        id: teamMember.user.id,
        email: teamMember.user.email,
        firstname: teamMember.user.name?.split(' ')[0] || 'User',
        lastname: teamMember.user.name?.split(' ')[1] || '',
        password,
      }),
    });

    console.log(
      '[Bootstrap] Fleet account creation response status:',
      createRes.status
    );

    if (!createRes.ok) {
      const errorData = await createRes.json().catch(() => ({}));

      // Check if account already exists (409 or 400 with "already exists" message)
      const isAlreadyExists =
        createRes.status === 409 ||
        (createRes.status === 400 &&
          errorData?.msg?.toLowerCase().includes('already exists'));

      if (!isAlreadyExists) {
        console.error(
          '[Bootstrap] Fleet account creation failed:',
          createRes.status,
          errorData
        );
        return res.status(500).json({
          error: 'Failed to create Fleet account',
          details: errorData,
        });
      }

      console.log(
        '[Bootstrap] Fleet account already exists, continuing with login'
      );
    }

    // Step 2: Login to get Fleet access token
    console.log('[Bootstrap] Logging into Fleet account');
    const loginRes = await fetch(`${fleetBase}/api/v1/account/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: teamMember.user.email,
        password,
      }),
    });

    console.log('[Bootstrap] Fleet login response status:', loginRes.status);

    if (!loginRes.ok) {
      const errorData = await loginRes.json().catch(() => ({}));
      console.error(
        '[Bootstrap] Fleet login failed:',
        loginRes.status,
        errorData
      );
      return res.status(500).json({
        error: 'Failed to access Fleet account',
        details: errorData,
      });
    }

    const loginData = await loginRes.json();
    const fleetToken = loginData.fleet_access?.secret_key;

    if (!fleetToken) {
      console.error('No fleet token in login response');
      return res.status(500).json({ error: 'No Fleet token received' });
    }

    // Step 3: Create team in Fleet
    console.log(
      '[Bootstrap] Creating Fleet team:',
      teamMember.team.name,
      teamMember.team.id
    );
    const createTeamRes = await fetch(`${fleetBase}/api/v1/team/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
      },
      body: JSON.stringify({
        name: teamMember.team.name,
        id: teamMember.team.id,
      }),
    });

    console.log(
      '[Bootstrap] Fleet team creation response status:',
      createTeamRes.status
    );

    if (!createTeamRes.ok) {
      const errorData = await createTeamRes.json().catch(() => ({}));
      console.error(
        '[Bootstrap] Fleet team creation failed:',
        createTeamRes.status,
        errorData
      );
      // Don't fail - team might already exist, continue anyway
      console.log('[Bootstrap] Continuing despite team creation error...');
    }

    // Step 4: Order Fleet secret
    console.log('[Bootstrap] Ordering Fleet secret for team:', teamId);
    const orderSecretRes = await fetch(
      `${fleetBase}/api/v1/fleet/teams/${teamId}/secret`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
        },
      }
    );

    console.log(
      '[Bootstrap] Fleet secret order response status:',
      orderSecretRes.status
    );

    if (!orderSecretRes.ok) {
      const errorData = await orderSecretRes.json().catch(() => ({}));
      console.error(
        '[Bootstrap] Fleet secret order failed:',
        orderSecretRes.status,
        errorData
      );
      return res.status(500).json({
        error: 'Failed to order Fleet secret',
        details: errorData,
      });
    }

    const secretData = await orderSecretRes.json();

    console.log('[Bootstrap] Bootstrap completed successfully');
    return res.status(200).json({
      success: true,
      fleetToken,
      secret: secretData,
    });
  } catch (err) {
    console.error('[Bootstrap] Unhandled error:', err);
    if (err instanceof Error) {
      console.error('[Bootstrap] Error message:', err.message);
      console.error('[Bootstrap] Error stack:', err.stack);
    }
    return res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
