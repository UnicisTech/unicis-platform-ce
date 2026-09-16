import { setCscStatus } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { validateApiRequestBody } from '@/lib/api-validation';
import { cscStatusWriteRequestSchema } from '@/lib/properties';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      return handlePUT(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { slug } = req.query;
  const body = validateApiRequestBody(
    cscStatusWriteRequestSchema,
    req.body,
    res
  );

  if (!body) {
    return;
  }

  const { control, value, framework } = body;

  const statuses = await setCscStatus({
    slug: slug as string,
    control,
    value,
    framework,
  });

  return res.status(200).json({ data: { statuses }, error: null });
};
