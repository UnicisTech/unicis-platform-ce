import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { getFleetAccessTokenFromCookieStore } from '@/lib/fleet/cookies';

const getFleetErrorMessage = (error: any, fallback: string) =>
  error?.error?.message || error?.message || error?.msg || fallback;

const isMissingSecretError = (status: number, message: string) =>
  status === 404 ||
  /secret.*not found|not found.*secret|no.*secret/i.test(message);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE');
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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const teamId =
    typeof req.query.teamId === 'string' ? req.query.teamId : undefined;

  if (!teamId) {
    return res
      .status(400)
      .json({ error: { message: 'teamId query param is required' } });
  }

  const fleetBase = process.env.FLEET_API_URL;
  const fleetToken = getFleetAccessTokenFromCookieStore(req.cookies);

  if (!fleetBase || !fleetToken) {
    return res.status(401).json({
      error: { message: 'Fleet not configured or not authenticated' },
    });
  }

  const response = await fetch(
    `${fleetBase}/api/v1/fleet/teams/${teamId}/secret`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = getFleetErrorMessage(error, 'Failed to fetch Fleet secret');

    return res.status(response.status).json({
      error: {
        message,
      },
    });
  }

  const data = await response.json();
  return res.status(200).json(data);
};

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const teamId =
    typeof req.query.teamId === 'string' ? req.query.teamId : undefined;

  if (!teamId) {
    return res
      .status(400)
      .json({ error: { message: 'teamId query param is required' } });
  }

  const fleetBase = process.env.FLEET_API_URL;
  const fleetToken = getFleetAccessTokenFromCookieStore(req.cookies);

  if (!fleetBase || !fleetToken) {
    return res.status(401).json({
      error: { message: 'Fleet not configured or not authenticated' },
    });
  }

  const fleetSecretUrl = `${fleetBase}/api/v1/fleet/teams/${teamId}/secret`;
  const fleetHeaders = {
    'Content-Type': 'application/json',
    'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
  };

  const response = await fetch(fleetSecretUrl, {
    method: 'DELETE',
    headers: fleetHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = getFleetErrorMessage(
      error,
      'Failed to delete Fleet secret'
    );

    if (isMissingSecretError(response.status, message)) {
      return res.status(200).json({ deleted: true, alreadyDeleted: true });
    }

    const verifyResponse = await fetch(fleetSecretUrl, {
      method: 'GET',
      headers: fleetHeaders,
    });

    if (!verifyResponse.ok) {
      const verifyError = await verifyResponse.json().catch(() => ({}));
      const verifyMessage = getFleetErrorMessage(
        verifyError,
        'Failed to fetch Fleet secret'
      );

      if (isMissingSecretError(verifyResponse.status, verifyMessage)) {
        return res.status(200).json({ deleted: true, alreadyDeleted: true });
      }
    }

    console.error('[Fleet secret delete] Fleet API error:', {
      status: response.status,
      message,
      error,
    });

    return res.status(response.status).json({
      error: {
        message,
      },
    });
  }

  const data = await response.json().catch(() => ({}));
  return res.status(200).json(data);
};
