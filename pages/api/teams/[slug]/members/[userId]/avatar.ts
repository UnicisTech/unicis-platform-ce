import { createHash } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { throwIfNoTeamAccess } from 'models/team';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const DATA_URL_PATTERN =
  /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=\r\n]+)$/;
const IMAGE_SIGNATURES: Record<string, number[]> = {
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
};

const hasValidSignature = (contentType: string, avatar: Buffer) =>
  IMAGE_SIGNATURES[contentType]?.every(
    (byte, index) => avatar[index] === byte
  ) ?? false;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      data: null,
      error: { message: `Method ${req.method} Not Allowed` },
    });
  }

  const teamMember = await throwIfNoTeamAccess(req, res);
  const { userId } = req.query;

  if (typeof userId !== 'string' || !userId) {
    return res.status(400).json({
      data: null,
      error: { message: 'Invalid user ID' },
    });
  }

  const targetMember = await prisma.teamMember.findFirst({
    where: {
      teamId: teamMember.teamId,
      userId,
    },
    select: {
      user: {
        select: { image: true },
      },
    },
  });

  res.setHeader(
    'Cache-Control',
    'private, max-age=300, stale-while-revalidate=3600'
  );

  const image = targetMember?.user.image?.trim();
  if (!image) {
    return res.status(404).json({
      data: null,
      error: { message: 'Avatar not found' },
    });
  }

  const etag = `"${createHash('sha256').update(image).digest('base64url')}"`;
  res.setHeader('ETag', etag);
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  const dataUrlMatch = image.match(DATA_URL_PATTERN);
  if (dataUrlMatch) {
    const [, contentType, encoded] = dataUrlMatch;
    const avatar = Buffer.from(encoded.replace(/\s/g, ''), 'base64');

    if (
      avatar.length === 0 ||
      avatar.length > MAX_AVATAR_BYTES ||
      !hasValidSignature(contentType, avatar)
    ) {
      return res.status(422).json({
        data: null,
        error: { message: 'Invalid avatar data' },
      });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', avatar.length);
    return res.status(200).send(avatar);
  }

  try {
    const avatarUrl = new URL(image);
    if (avatarUrl.protocol !== 'https:') throw new Error('Unsupported URL');
    return res.redirect(307, avatarUrl.toString());
  } catch {
    return res.status(422).json({
      data: null,
      error: { message: 'Invalid avatar data' },
    });
  }
}
