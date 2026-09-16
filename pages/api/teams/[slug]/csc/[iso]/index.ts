import { getCscStatusesBySlugAndIso } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { validateApiInput } from '@/lib/api-validation';
import { isoSchema } from '@/lib/properties';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGET(req, res);
      default:
        res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
        res.status(405).json({
          data: null,
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
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { slug, iso } = req.query;
  const parsedIso = validateApiInput(
    isoSchema,
    iso,
    res,
    'Invalid ISO framework'
  );

  if (!parsedIso) {
    return;
  }

  const statuses = await getCscStatusesBySlugAndIso(slug as string, parsedIso);

  return res.status(200).json({ data: { statuses: statuses }, error: null });
};
