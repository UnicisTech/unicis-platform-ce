import { getCurrentPlan } from "@/lib/subscriptions";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { teamId, plan } = req.body;

    if (!teamId || !plan) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    try {
      const subscription = await prisma.subscription.findUnique({
        where: { teamId },
      });

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found." });
      }

      const currentPlan = getCurrentPlan(subscription);
      const isPlanActive = currentPlan === plan;

      res.status(200).json({ hasPlan: isPlanActive });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Internal Server Error." });
    }
}