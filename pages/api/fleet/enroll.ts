import type { NextApiRequest, NextApiResponse } from "next";
import { sendFleetEnrollEmail } from "@/lib/email/sendFleetEnrollEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, teamName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await sendFleetEnrollEmail(email, teamName);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Enroll email error:", err);
    return res.status(500).json({ error: "Failed to send enrollment email" });
  }
}
