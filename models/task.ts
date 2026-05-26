import type { Prisma } from '@/generated/client';
import { prisma } from '@/lib/prisma';

export type TaskReorderInput = {
  taskNumber: number;
  status: string;
  kanbanOrder: number;
};

const getTeamTasksOrderBy = (): Prisma.TaskOrderByWithRelationInput[] => [
  { status: 'asc' },
  { kanbanOrder: 'asc' },
  { taskNumber: 'asc' },
];

export const createTask = async (param: {
  authorId: string;
  teamId: string;
  title: string;
  status: string;
  duedate: Date | null;
  description: string;
}) => {
  const { authorId, teamId, title, status, duedate, description } = param;

  return await prisma.$transaction(async (tx) => {
    const team = await tx.team.update({
      where: { id: teamId },
      data: { taskIndex: { increment: 1 } },
      select: { taskIndex: true },
    });

    const lastTaskInStatus = await tx.task.findFirst({
      where: {
        teamId,
        status,
      },
      orderBy: [{ kanbanOrder: 'desc' }, { taskNumber: 'desc' }],
      select: {
        kanbanOrder: true,
      },
    });

    return await tx.task.create({
      data: {
        authorId,
        taskNumber: team.taskIndex - 1,
        teamId,
        title,
        status,
        kanbanOrder: (lastTaskInStatus?.kanbanOrder ?? -1) + 1,
        duedate,
        description,
        properties: {},
      },
    });
  });
};

export const updateTask = async (
  taskNumber: number,
  slug: string,
  data: any
) => {
  return await prisma.$transaction(async (tx) => {
    const taskToEdit = await tx.task.findFirst({
      where: {
        taskNumber,
        team: {
          slug,
        },
      },
    });

    if (!taskToEdit) {
      return null;
    }

    const dataToUpdate = { ...data };
    const shouldMoveToEndOfStatus =
      typeof dataToUpdate.status === 'string' &&
      dataToUpdate.status !== taskToEdit.status &&
      !Object.prototype.hasOwnProperty.call(dataToUpdate, 'kanbanOrder');

    if (shouldMoveToEndOfStatus) {
      const lastTaskInStatus = await tx.task.findFirst({
        where: {
          teamId: taskToEdit.teamId,
          status: dataToUpdate.status,
          NOT: {
            id: taskToEdit.id,
          },
        },
        orderBy: [{ kanbanOrder: 'desc' }, { taskNumber: 'desc' }],
        select: {
          kanbanOrder: true,
        },
      });

      dataToUpdate.kanbanOrder = (lastTaskInStatus?.kanbanOrder ?? -1) + 1;
    }

    return await tx.task.update({
      where: {
        id: taskToEdit.id,
      },
      data: dataToUpdate,
    });
  });
};

export const deleteTask = async (taskNumber: number, slug: string) => {
  const taskToDelete = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });

  if (taskToDelete) {
    const deletedTask = await prisma.task.delete({
      where: {
        id: taskToDelete.id,
      },
    });
    return deletedTask;
  } else {
    return null;
  }
};

export const getTasks = async (userId: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      team: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    },
  });
  return tasks;
};

export const getTaskBySlugAndNumber = async (
  taskNumber: number,
  slug: string
) => {
  const task = await prisma.task.findFirst({
    where: {
      taskNumber: taskNumber,
      team: {
        slug: slug,
      },
    },
    include: {
      comments: {
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      attachments: {
        select: {
          filename: true,
          url: true,
          taskId: true,
          id: true,
        },
      },
    },
  });
  return task;
};

export const getTeamTasks = async (slug: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      team: {
        slug,
      },
    },
    orderBy: getTeamTasksOrderBy(),
  });
  return tasks;
};

export const reorderTeamTasks = async (
  teamId: string,
  tasks: TaskReorderInput[]
) => {
  const taskNumbers = tasks.map((task) => task.taskNumber);
  const uniqueTaskNumbers = new Set(taskNumbers);

  return await prisma.$transaction(async (tx) => {
    const existingTasks = await tx.task.findMany({
      where: {
        teamId,
        taskNumber: {
          in: taskNumbers,
        },
      },
      select: {
        taskNumber: true,
      },
    });

    if (existingTasks.length !== uniqueTaskNumbers.size) {
      return null;
    }

    for (const task of tasks) {
      await tx.task.updateMany({
        where: {
          teamId,
          taskNumber: task.taskNumber,
        },
        data: {
          status: task.status,
          kanbanOrder: task.kanbanOrder,
        },
      });
    }

    return await tx.task.findMany({
      where: {
        teamId,
      },
      orderBy: getTeamTasksOrderBy(),
    });
  });
};
