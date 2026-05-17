import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendFleetEnrollEmail } from "@/lib/email/sendFleetEnrollEmail";
import crypto from "crypto";

type Body = {
  email?: string;
  teamId?: string;
  teamSlug?: string;
  teamName?: string;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const generateTempPassword = () => {
  return crypto.randomBytes(12).toString("base64url");
};

const mapPlatformRoleToFleetRole = (
  role?: string
): "member" | "admin" | "owner" => {
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  return "member";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const fleetBase = process.env.FLEET_API_URL;
    const fleetServiceToken = process.env.FLEET_SERVICE_TOKEN;

    if (!fleetBase) {
      console.error("FLEET_API_URL not defined");
      return res.status(500).json({ error: "FLEET_NOT_CONFIGURED" });
    }

    if (!fleetServiceToken) {
      console.error("FLEET_SERVICE_TOKEN not defined");
      return res.status(500).json({ error: "FLEET_SERVICE_TOKEN_MISSING" });
    }

    const { email, teamId, teamSlug, teamName } = (req.body ?? {}) as Body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const team = await prisma.team.findFirst({
      where: teamId
        ? { id: teamId }
        : teamSlug
        ? { slug: teamSlug }
        : teamName
        ? { name: teamName }
        : undefined,
      select: { id: true, name: true, slug: true },
    });

    if (!team) {
      return res.status(404).json({ error: "TEAM_NOT_FOUND" });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ONE_DAY_MS);

    const existing = await prisma.fleetEnrollment.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: user.id,
        },
      },
      select: { status: true, expiresAt: true },
    });

    if (existing?.status === "COMPLETED") {
      return res.status(409).json({ error: "ALREADY_ENROLLED" });
    }

    if (existing?.status === "PENDING" && existing.expiresAt > now) {
      return res.status(409).json({
        error: "ALREADY_SENT",
        expiresAt: existing.expiresAt,
      });
    }

    const tempPassword = generateTempPassword();

    const createRes = await fetch(
      `${fleetBase}/api/v1/account/create-temporary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fleetServiceToken}`,
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          firstname: user.name?.split(" ")[0] ?? "User",
          lastname: user.name?.split(" ")[1] ?? "",
          password: tempPassword,
        }),
      }
    );

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("Fleet create-temporary failed:", text);
      return res.status(500).json({ error: "FLEET_CREATE_FAILED" });
    }


    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: team.id,
        userId: user.id,
      },
      select: { role: true },
    });

    const fleetRole = mapPlatformRoleToFleetRole(membership?.role);

    const memberRes = await fetch(
      `${fleetBase}/api/v1/team/${team.id}/service/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fleetServiceToken}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          role: fleetRole,
        }),
      }
    );

    if (!memberRes.ok) {
      const text = await memberRes.text();
      console.error("Fleet add member failed:", text);
      return res.status(500).json({ error: "FLEET_ADD_MEMBER_FAILED" });
    }

    // ---------- CREATE ENROLLMENT RECORD ----------

    const token = crypto.randomUUID();

    const enrollment = await prisma.fleetEnrollment.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: user.id,
        },
      },
      update: {
        token,
        sentAt: now,
        expiresAt,
        status: "PENDING",
      },
      create: {
        teamId: team.id,
        userId: user.id,
        token,
        sentAt: now,
        expiresAt,
        status: "PENDING",
      },
      select: { token: true, expiresAt: true, status: true },
    });

    await sendFleetEnrollEmail(
      user.email,
      team,
      enrollment.token,
      tempPassword
    );

    return res.status(200).json({
      success: true,
      status: enrollment.status,
      expiresAt: enrollment.expiresAt,
    });
  } catch (err) {
    console.error("Fleet enroll API error:", err);
    return res.status(500).json({ error: "FAILED_TO_ENROLL" });
  }
}
