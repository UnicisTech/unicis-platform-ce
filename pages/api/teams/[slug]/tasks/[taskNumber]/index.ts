import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import { getTeam, isTeamMember } from "models/team";
import { getTaskBySlugAndNumber } from "models/task";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    // case "DELETE":
    //   return handleDELETE(req, res);
    // case "PUT":
    //   return handlePUT(req, res);
    default:
      res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get task by slug and taskNumber
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, taskNumber } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const task = await getTaskBySlugAndNumber(Number(taskNumber), slug as string);

  return res.status(200).json({ data: task, error: null });
};