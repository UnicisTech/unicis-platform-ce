import { prisma } from '@/lib/prisma';

export const toggleReaction = async (params: {
  commentId: number;
  userId: string;
  emoji: string;
}) => {
  const { commentId, userId, emoji } = params;

  const existing = await prisma.commentReaction.findUnique({
    where: {
      commentId_userId_emoji: {
        commentId,
        userId,
        emoji,
      },
    },
  });

  if (existing) {
    await prisma.commentReaction.delete({
      where: { id: existing.id },
    });
    return { action: 'removed' as const };
  }

  const reaction = await prisma.commentReaction.create({
    data: {
      commentId,
      userId,
      emoji,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return { action: 'added' as const, reaction };
};
