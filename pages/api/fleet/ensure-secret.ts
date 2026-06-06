import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@/lib/session";
import { getFleetAccessTokenFromCookieStore } from "@/lib/fleet/cookies";

/**
 * Ensures Fleet secret exists for the current user
 * Creates one if it doesn't exist
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
    const userId = session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { teamId } = req.body as { teamId: string };

    if (!teamId) {
      return res.status(400).json({ error: "teamId is required" });
    }

    const fleetBase = process.env.FLEET_API_URL;
    const fleetToken = getFleetAccessTokenFromCookieStore(req.cookies);

    if (!fleetBase || !fleetToken) {
      return res.status(500).json({ error: "Fleet not configured or not authenticated" });
    }

    // Check if secret exists
    const getRes = await fetch(`${fleetBase}/api/v1/fleet/teams/${teamId}/secret`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
      },
    });

    if (getRes.ok) {
      // Secret already exists
      const secret = await getRes.json();
      return res.status(200).json({ exists: true, secret });
    }

    // 403 - User doesn't have permission (e.g., member role)
    if (getRes.status === 403) {
      console.log(`[EnsureSecret] User ${userId} doesn't have permission to access secret (member role)`);
      return res.status(200).json({ exists: false, forbidden: true });
    }

    // Secret doesn't exist (404), create it
    if (getRes.status === 404) {
      const createRes = await fetch(`${fleetBase}/api/v1/fleet/teams/${teamId}/secret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Unicis-Fleet-API-Authorization': `UnicisBearer ${fleetToken}`,
        },
      });

      if (createRes.ok) {
        const secret = await createRes.json();
        console.log(`[EnsureSecret] Created secret for user ${userId} in team ${teamId}`);
        return res.status(201).json({ created: true, secret });
      } else {
        const errorData = await createRes.json().catch(() => ({}));
        console.error('[EnsureSecret] Failed to create secret:', createRes.status, errorData);
        return res.status(500).json({ error: "Failed to create secret", details: errorData });
      }
    }

    // Other error
    const errorText = await getRes.text();
    console.error('[EnsureSecret] Unexpected error:', getRes.status, errorText);
    return res.status(500).json({ error: "Failed to check secret existence", status: getRes.status });

  } catch (err) {
    console.error("[EnsureSecret] Unhandled error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err instanceof Error ? err.message : String(err)
    });
  }
}
