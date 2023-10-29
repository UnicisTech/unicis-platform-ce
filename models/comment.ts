import { prisma } from '@/lib/prisma';

export const createComment = async (params: {
  text: string;
  userId: string;
  taskNumber: number;
  slug: string;
}) => {
  const { text, taskNumber, slug, userId } = params;

  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (!task) {
    return null;
  }

  const comment = await prisma.comment.create({
    data: {
      text,
      taskId: task.id,
      createdById: userId,
    },
  });

  return comment;
};

export const deleteComment = async (id: number) => {
  const comment = await prisma.comment.delete({
    where: {
      id,
    },
  });

  return comment;
};
