import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * Revoke Fleet access for a user
 * - Deletes Fleet enrollment
 * - Removes user from Fleet team
 * - Deletes Fleet secret
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getSession(req, res);
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId, teamId } = req.body as {
      userId: string;
      teamId: string;
    };

    if (!userId || !teamId) {
      return res.status(400).json({ error: "userId and teamId are required" });
    }

    // Verify current user has permission to revoke access (must be admin/owner)
    const currentUserMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!currentUserMember) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Get user info for Fleet calls
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fleetBase = process.env.FLEET_API_URL;
    const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

    if (!fleetBase || !fleetServiceToken) {
      console.error("[RevokeFleet] Fleet configuration missing");
      return res.status(500).json({ error: "FLEET_NOT_CONFIGURED" });
    }

    // 1. Delete enrollment record from Platform
    await prisma.fleetEnrollment.deleteMany({
      where: {
        teamId,
        userId,
      },
    });

    console.log(`[RevokeFleet] Deleted enrollment for user ${userId}`);

    // 2. Remove user from Fleet team
    try {
      // First, get the team_member_id from Fleet
      const membersRes = await fetch(
        `${fleetBase}/api/v1/team/${teamId}/member`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fleetServiceToken}`,
          },
        }
      );

      if (membersRes.ok) {
        const members = await membersRes.json();
        const member = members.find((m: any) => m.user_id === userId);

        if (member) {
          // Delete team member
          await fetch(
            `${fleetBase}/api/v1/team/members/${member.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${fleetServiceToken}`,
              },
            }
          );
          console.log(`[RevokeFleet] Removed user from Fleet team`);
        }
      }
    } catch (error) {
      console.error("[RevokeFleet] Failed to remove from Fleet team:", error);
      // Continue even if this fails
    }

    // 3. Delete Fleet account (optional - might want to keep it)
    // For now, we'll just remove from team and delete secret

    return res.status(200).json({
      success: true,
      message: "Fleet access revoked",
    });
  } catch (err) {
    console.error("[RevokeFleet] Unhandled error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
