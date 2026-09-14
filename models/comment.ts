import type { Prisma } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import type { CommentsPage } from 'types';

const taskCommentSelect = {
  id: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  taskId: true,
  createdById: true,
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
  reactions: {
    select: {
      id: true,
      emoji: true,
      commentId: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.CommentSelect;

export const getTaskComments = async (params: {
  taskNumber: number;
  slug: string;
  limit?: number;
  cursor?: number;
}): Promise<CommentsPage | null> => {
  const { taskNumber, slug, limit, cursor } = params;
  const task = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: { slug },
    },
    select: { id: true },
  });

  if (!task) return null;

  const rows = await prisma.comment.findMany({
    where: {
      taskId: task.id,
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { id: 'desc' },
    ...(limit ? { take: limit + 1 } : {}),
    select: taskCommentSelect,
  });

  const hasMore = limit !== undefined && rows.length > limit;
  const pageRows = limit ? rows.slice(0, limit) : rows;
  const totalCount = limit
    ? await prisma.comment.count({ where: { taskId: task.id } })
    : pageRows.length;

  return {
    items: pageRows.reverse(),
    totalCount,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? pageRows[0]?.id ?? null : null,
    },
  };
};

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

export const updateComment = async (params: {
  id: number;
  text: string;
  taskNumber: number;
  slug: string;
}) => {
  const { id, text, taskNumber, slug } = params;
  const commentToEdit = await prisma.comment.findFirst({
    where: {
      id,
      task: {
        taskNumber,
        team: { slug },
      },
    },
    select: { id: true },
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

export const deleteComment = async (params: {
  id: number;
  taskNumber: number;
  slug: string;
}) => {
  const { id, taskNumber, slug } = params;
  const commentToDelete = await prisma.comment.findFirst({
    where: {
      id,
      task: {
        taskNumber,
        team: { slug },
      },
    },
    select: { id: true },
  });

  if (!commentToDelete) return null;

  return await prisma.comment.delete({
    where: { id: commentToDelete.id },
  });
};
