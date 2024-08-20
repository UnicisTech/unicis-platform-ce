import { NextApiRequest, NextApiResponse } from 'next';
import { createOrUpdateFleetSecret } from 'models/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { teamId, fleetTeamId, secret, active } = req.body;

    try {
      const fleetSecret = await createOrUpdateFleetSecret({
        teamId,
        fleetTeamId,
        secret,
        active
      })

      res.status(200).json(fleetSecret);
    } catch (error) {
      res.status(500).json({ error: 'Failed to connect fleet connection' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}