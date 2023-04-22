import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { isUserHasAccess } from "models/task";
import {
  removeControlsFromIssue,
  addControlsToIssue,
  changeControlInIssue,
} from "@/lib/csc";
import type { Session } from "next-auth";

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
  const { operation, controls } = req.body;

  const session = await getSession(req, res);
  const user = session?.user as Session["user"];
  const userId = user?.id as string;

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
    await addControlsToIssue({
      user,
      taskId: Number(slug),
      controls,
    });
  }

  if (operation === "remove") {
    await removeControlsFromIssue({
      user,
      taskId: Number(slug),
      controls,
    });
  }

  if (operation === "change") {
    await changeControlInIssue({
      user,
      taskId: Number(slug),
      controls,
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
