import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.NEXTAUTH_SECRET; // Must matche Fleet API : UFA-SECRET=...This Platform Secret...
  const token = await getToken({ req });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Encoded the token in a format Fleet API can understand
  const reencodedToken = jwt.sign(token, secret, { algorithm: "HS256" });

  res.status(200).json({ token: reencodedToken });
}