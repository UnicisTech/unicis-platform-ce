import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { isUserHasAccess } from "models/task";
import type { Session } from "next-auth";
import { saveProcedure } from "@/lib/rpa";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      return handlePOST(req, res);
    default:
      res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;
  const { procedure } = req.body;

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

  await saveProcedure({
    user,
    taskId: Number(slug),
    procedure,
  });

  return res.status(200).json({ data: {}, error: null });
};
