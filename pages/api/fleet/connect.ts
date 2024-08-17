import { NextApiRequest, NextApiResponse } from 'next';
import { createOrUpdateFleet } from 'models/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, fleetId, accessPhrase, connected } = req.body;

    try {
      const fleetAccount = await createOrUpdateFleet({
        userId,
        fleetId,
        accessPhrase,
        connected
      })

      res.status(200).json(fleetAccount);
    } catch (error) {
      res.status(500).json({ error: 'Failed to connect fleet connection' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}