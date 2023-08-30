import { getSession } from '@/lib/session';
import { createComment, deleteComment } from 'models/comment';
import { getTeam, isTeamMember } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { sendEvent } from '@/lib/svix';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    // case "GET":
    //   return handleGET(req, res);
    case 'POST':
      return handlePOST(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
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

// Create a comment
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;
  const { text, taskId } = req.body;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const teamMember = await throwIfNoTeamAccess(req, res);

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const comment = await createComment({ text, taskId, userId });

  await sendEvent(teamMember.teamId, 'task.commented', comment);

  return res.status(200).json({ data: comment, error: null });
};

// Delete a comment

const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.body;
  const session = await getSession(req, res);

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  await deleteComment(id);

  return res.status(200).json({ data: {}, error: null });
};
