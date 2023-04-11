import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import {
  addControlToIssue,
  removeControlFromIssue,
  isUserHasAccess,
} from "models/task";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "PUT":
      return handlePUT(req, res);
    default:
      res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;
  const { operation, control } = req.body;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  if (!(await isUserHasAccess({ userId, taskId: Number(slug) }))) {
    return res.status(200).json({
      data: null,
      error: { message: "User has no access to this task." },
    });
  }

  if (operation === "add") {
    await addControlToIssue({
      taskId: Number(slug) as number,
      control: control as string,
    });
  }

  if (operation === "remove") {
    await removeControlFromIssue({
      taskId: Number(slug) as number,
      control: control as string,
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
