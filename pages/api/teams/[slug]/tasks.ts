import { getSession } from '@/lib/session';
import { getTeamTasks } from 'models/task';
import { getTeam, isTeamMember } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGET(req, res);
    // case "DELETE":
    //   return handleDELETE(req, res);
    // case "PUT":
    //   return handlePUT(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get members of a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const tasks = await getTeamTasks(slug as string);

  return res.status(200).json({ data: tasks, error: null });
};
