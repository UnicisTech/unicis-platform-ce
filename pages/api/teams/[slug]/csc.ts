import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { setCscStatus } from "models/team";

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
  const { control, value } = req.body;

  const session = await getSession(req, res);

  if (!session) {
    return res.status(200).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const statuses = await setCscStatus({
    slug: slug as string,
    control: control as string,
    value: value as string,
  });

  return res.status(200).json({ data: { statuses }, error: null });
};
