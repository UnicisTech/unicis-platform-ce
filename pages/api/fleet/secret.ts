import { NextApiRequest, NextApiResponse } from 'next';
import { createOrUpdateFleetSecret, getFleetSecretByTeamId } from 'models/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { teamId, fleetTeamId, secret, active } = req.body;

    try {
      const fleetSecret = await createOrUpdateFleetSecret({
        teamId,
        fleetTeamId,
        secret,
        active
      });

      res.status(200).json(fleetSecret);
    } catch (error) {
      console.error('Error creating or updating fleet secret:', error);
      res.status(500).json({ error: 'Failed to connect fleet connection' });
    }
  } else if (req.method === 'GET') {
    const { teamId } = req.query;

    if (!teamId || typeof teamId !== 'string') {
      return res.status(400).json({ error: 'teamId is required and must be a string' });
    }

    try {
      const fleetSecret = await getFleetSecretByTeamId(teamId);

      if (!fleetSecret) {
        return res.status(404).json({ error: 'Fleet secret not found' });
      }

      return res.status(200).json(fleetSecret);
    } catch (error) {
      console.error('Error fetching fleet secret:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
