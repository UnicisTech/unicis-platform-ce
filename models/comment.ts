import { prisma } from "@/lib/prisma";

export const createComment = async (params: {
  text: string;
  userId: string;
  taskId: number;
}) => {
  const { text, taskId, userId } = params;
  const comment = await prisma.comment.create({
    data: {
      text,
      taskId,
      createdById: userId,
    },
  });
  return comment;
};

export const deleteComment = async (id: number) => {
  await prisma.comment.delete({
    where: {
      id,
    },
  });
};
