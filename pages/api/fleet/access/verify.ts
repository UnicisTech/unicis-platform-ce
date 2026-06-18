import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { getFleetAccessTokenFromCookieStore } from '@/lib/fleet/cookies';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    const userId = session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fleetBase = process.env.FLEET_API_URL;
    const fleetToken = getFleetAccessTokenFromCookieStore(req.cookies);

    if (!fleetBase || !fleetToken) {
      return res.status(401).json({ error: 'Fleet not authenticated' });
    }

    const response = await fetch(`${fleetBase}/api/v1/account/access/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res
        .status(response.status)
        .json({ error: error?.msg || error?.error || 'Fleet verify failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[FleetAccessVerify] Unhandled error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
