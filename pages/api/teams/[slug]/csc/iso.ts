import { setCscIso, getCscIso } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGET(req, res);
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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { slug } = req.query;

  const responce = await getCscIso({
    slug: slug as string,
  });

  return res.status(200).json({ data: { iso: responce }, error: null });
};

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { slug } = req.query;
  const { iso } = req.body;

  //TODO: check if subscription allows to change to this ISO
  const responce = await setCscIso({
    slug: slug as string,
    iso,
  });

  return res.status(200).json({ data: { iso: responce }, error: null });
};
