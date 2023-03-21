import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";

import { createTask, updateTask, deleteTask, getTasks } from "models/task";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    case "PUT":
      return handlePUT(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Create a task
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { teamId, title, status, duedate, description } = req.body;
  const session = await getSession(req, res);
  const team = await createTask({
    authorId: session?.user?.id as string,
    teamId,
    title,
    status,
    duedate,
    description,
  });

  return res.status(200).json({ data: team, error: null });
};

// Edit a task

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { taskId, data } = req.body;
  const session = await getSession(req, res);

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const updatedTask = await updateTask(taskId, data);

  return res.status(200).json({ data: updatedTask, error: null });
};

// Get tasks for user
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("from api get");
  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const tasks = await getTasks(userId);

  return res.status(200).json({ data: tasks, error: null });
};

// Delete the task
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { taskId } = req.body;
  const session = await getSession(req, res);

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  await deleteTask(taskId);

  return res.status(200).json({ data: {}, error: null });
};
