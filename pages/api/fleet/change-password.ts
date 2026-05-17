import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const fleetBase = process.env.FLEET_API_URL;
  const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

  if (!fleetBase || !fleetServiceToken) {
    return res.status(500).json({ error: 'FLEET_NOT_CONFIGURED' });
  }

  const { email, oldPassword, newPassword } = req.body as {
    email?: string;
    oldPassword?: string;
    newPassword?: string;
  };

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }

  try {
    const changeRes = await fetch(
      `${fleetBase}/api/v1/account/change-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fleetServiceToken}`,
        },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
        }),
      }
    );

    if (!changeRes.ok) {
      const text = await changeRes.text();
      console.error('Fleet change password failed:', text);
      return res.status(changeRes.status).json({ error: 'CHANGE_PASSWORD_FAILED' });
    }

    const data = await changeRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Fleet change password error:', err);
    return res.status(500).json({ error: 'FAILED_TO_CHANGE_PASSWORD' });
  }
}
