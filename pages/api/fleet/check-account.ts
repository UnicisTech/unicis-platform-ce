import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';

/**
 * Check if current user has a Fleet account
 */
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
    const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

    if (!fleetBase || !fleetServiceToken) {
      return res.status(500).json({ error: 'FLEET_NOT_CONFIGURED' });
    }

    // Check if user exists in Fleet
    const response = await fetch(
      `${fleetBase}/api/v1/account/users/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetServiceToken}`,
        },
      }
    );

    return res.status(200).json({
      exists: response.ok,
    });
  } catch (err) {
    console.error('Fleet check account error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
