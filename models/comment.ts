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

export const updateComment = async (id: number, text: string) => {
  const commentToEdit = await prisma.comment.findFirst({
    where: {
      id,
    },
  });

  if (!commentToEdit) {
    return null;
  }

  const editedComment = await prisma.comment.update({
    where: {
      id: commentToEdit.id,
    },
    data: {
      text,
    },
  });

  return editedComment;
};

export const deleteComment = async (id: number) => {
  const comment = await prisma.comment.delete({
    where: {
      id,
    },
  });

  return comment;
};
