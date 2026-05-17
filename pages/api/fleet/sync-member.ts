import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Body = {
  teamId: string;
  userId: string;
};

const mapPlatformRoleToFleetRole = (
  role?: string
): "member" | "admin" | "owner" | "auditor" => {
  if (role === "OWNER") return "owner";
  if (role === "ADMIN") return "admin";
  if (role === "AUDITOR") return "auditor";
  return "member";
};

/**
 * Sync a team member from Platform to Fleet
 * - Adds user to Fleet team if not already a member
 * - Updates user role in Fleet team to match Platform role
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

    const { teamId, userId } = req.body as Body;

    if (!teamId) {
      return res.status(400).json({ error: "teamId is required" });
    }

    // If userId not provided, sync current user
    const targetUserId = userId || currentUserId;

    console.log("[SyncMember] Syncing user", targetUserId, "to team", teamId);

    // Get team member from Platform
    const platformMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: targetUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!platformMember) {
      return res.status(404).json({ error: "User is not a member of this team" });
    }

    const fleetBase = process.env.FLEET_API_URL;
    const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

    if (!fleetBase || !fleetServiceToken) {
      console.error("Fleet configuration missing");
      return res.status(500).json({ error: "FLEET_NOT_CONFIGURED" });
    }

    const fleetRole = mapPlatformRoleToFleetRole(platformMember.role);

    console.log("[SyncMember] Platform role:", platformMember.role, "-> Fleet role:", fleetRole);

    // Try to add/update member in Fleet team using service endpoint
    const memberRes = await fetch(
      `${fleetBase}/api/v1/team/${teamId}/service/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fleetServiceToken}`,
        },
        body: JSON.stringify({
          user_id: platformMember.user.id,
          role: fleetRole,
        }),
      }
    );

    console.log("[SyncMember] Fleet add/update member response status:", memberRes.status);

    if (!memberRes.ok) {
      const errorData = await memberRes.json().catch(() => ({}));
      console.error("[SyncMember] Fleet sync member failed:", memberRes.status, errorData);

      return res.status(500).json({
        error: "Failed to sync member to Fleet",
        details: errorData,
      });
    }

    const memberData = await memberRes.json();

    console.log("[SyncMember] Member synced successfully");
    return res.status(200).json({
      success: true,
      message: "Member synced to Fleet team",
      user: platformMember.user.email,
      role: fleetRole,
      fleetMember: memberData,
    });
  } catch (err) {
    console.error("[SyncMember] Unhandled error:", err);
    if (err instanceof Error) {
      console.error("[SyncMember] Error message:", err.message);
    }
    return res.status(500).json({
      error: "Internal server error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
