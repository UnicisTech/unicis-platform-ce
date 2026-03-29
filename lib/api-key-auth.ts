import { prisma } from '@/lib/prisma';
import { hashApiKey, findApiKeyByHash } from 'models/apiKey';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import type { NextApiRequest } from 'next';

/**
 * Extract Bearer token from the Authorization header.
 * Returns null if no Bearer token is present.
 */
export const extractBearerToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

/**
 * Verify an API key and return the associated team context.
 * Validates: feature flag, key existence, expiration, and team slug match.
 */
export const verifyApiKey = async (token: string, slug: string) => {
  if (!env.teamFeatures.apiKey) {
    throw new ApiError(401, 'API key authentication is not enabled');
  }

  const hashedKey = hashApiKey(token);
  const apiKey = await findApiKeyByHash(hashedKey);

  if (!apiKey) {
    throw new ApiError(401, 'Invalid API key');
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    throw new ApiError(401, 'API key has expired');
  }

  if (apiKey.team.slug !== slug) {
    throw new ApiError(401, 'API key does not belong to this team');
  }

  // Update lastUsedAt
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  // Look up an ADMIN member to use as the user context for write operations
  const teamAdmin = await prisma.teamMember.findFirst({
    where: {
      teamId: apiKey.teamId,
      role: 'ADMIN',
    },
    include: {
      user: true,
    },
  });

  if (!teamAdmin) {
    throw new ApiError(500, 'Team has no admin');
  }

  return {
    apiKey,
    team: apiKey.team,
    admin: teamAdmin,
  };
};
