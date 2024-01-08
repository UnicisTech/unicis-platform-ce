import { createComment, updateComment, deleteComment } from 'models/comment';
import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { sendEvent } from '@/lib/svix';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
    case 'PUT':
      return handlePUT(req, res);
    case 'DELETE':
      return handleDELETE(req, res);
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
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { slug, taskNumber } = req.query;
  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const { text } = req.body;
  const userId = teamMember.user.id;

  const comment = await createComment({
    text,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    userId,
  });

  if (!comment) {
    return res.status(400).json({
      error: {
        message: 'Comment not created',
      },
    });
  }

  await sendEvent(teamMember.teamId, 'task.commented', comment);

  return res.status(200).json({ data: comment, error: null });
};

// Edit a comment
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { text, id } = req.body;

  const comment = await updateComment(id, text);

  if (!comment) {
    return res.status(503).json({
      error: {
        message: 'Comment is not updated.',
      },
    });
  }

  return res.status(200).json({ data: comment, error: null });
};

// Delete a comment
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'task', 'update');

  const { id } = req.body;

  const comment = await deleteComment(id);

  if (!comment) {
    return res.status(400).json({
      error: {
        message: 'Comment not deleted',
      },
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
