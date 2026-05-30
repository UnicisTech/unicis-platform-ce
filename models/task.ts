import type { Prisma } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { AuditLog, TaskProperties } from 'types';
import { DEFAULT_TASK_PRIORITY, type TaskPriority } from '@/lib/tasks';

export type TaskReorderInput = {
  taskNumber: number;
  status: string;
  kanbanOrder: number;
};

export type CreateTaskInput = {
  authorId: string;
  teamId: string;
  title: string;
  status: string;
  priority?: TaskPriority;
  duedate: Date | null;
  description: string;
  properties?: Prisma.InputJsonValue;
  recurrenceScheduleId?: string | null;
  recurrenceOccurrenceDate?: Date | null;
};

const getTeamTasksOrderBy = (): Prisma.TaskOrderByWithRelationInput[] => [
  { status: 'asc' },
  { kanbanOrder: 'asc' },
  { taskNumber: 'asc' },
];

const validateCreateTaskRecurrenceInput = ({
  recurrenceScheduleId,
  recurrenceOccurrenceDate,
}: Pick<
  CreateTaskInput,
  'recurrenceScheduleId' | 'recurrenceOccurrenceDate'
>) => {
  if (recurrenceScheduleId !== undefined && recurrenceScheduleId !== null) {
    if (!recurrenceScheduleId.trim()) {
      throw new Error('recurrenceScheduleId must not be empty');
    }

    if (!recurrenceOccurrenceDate) {
      throw new Error(
        'recurrenceOccurrenceDate is required when recurrenceScheduleId is provided'
      );
    }
  }

  if (!recurrenceScheduleId && recurrenceOccurrenceDate) {
    throw new Error(
      'recurrenceScheduleId is required when recurrenceOccurrenceDate is provided'
    );
  }
};

export const createTaskInTransaction = async (
  tx: Prisma.TransactionClient,
  param: CreateTaskInput
) => {
  const {
    authorId,
    teamId,
    title,
    status,
    priority = DEFAULT_TASK_PRIORITY,
    duedate,
    description,
    properties = {},
    recurrenceScheduleId = null,
    recurrenceOccurrenceDate = null,
  } = param;

  validateCreateTaskRecurrenceInput({
    recurrenceScheduleId,
    recurrenceOccurrenceDate,
  });

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
      priority,
      kanbanOrder: (lastTaskInStatus?.kanbanOrder ?? -1) + 1,
      duedate,
      description,
      properties,
      recurrenceScheduleId,
      recurrenceOccurrenceDate,
    },
  });
};

export const createTask = async (param: CreateTaskInput) =>
  await prisma.$transaction(async (tx) => createTaskInTransaction(tx, param));

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
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
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

const taskAuditFields = [
  'title',
  'status',
  'priority',
  'duedate',
  'description',
] as const;

export const addTaskAuditLogs = async (params: {
  taskId: number;
  user: Session['user'];
  prevTask: {
    title: string;
    status: string;
    priority: string;
    duedate: any;
    description: string | null;
  };
  nextTask: {
    title: string;
    status: string;
    priority: string;
    duedate: any;
    description: string | null;
  };
  taskProperties: TaskProperties;
}) => {
  const { taskId, user, prevTask, nextTask, taskProperties } = params;

  const newLogs: AuditLog[] = [];

  for (const field of taskAuditFields) {
    const prevVal = prevTask[field]?.toString() ?? '';
    const nextVal = nextTask[field]?.toString() ?? '';

    if (prevVal !== nextVal) {
      newLogs.push({
        actor: user,
        date: new Date().getTime(),
        event: 'updated',
        diff: {
          field,
          prevValue: prevVal || '—',
          nextValue: nextVal || '—',
        },
      });
    }
  }

  if (newLogs.length === 0) return;

  const existing = taskProperties?.task_audit_logs || [];
  taskProperties.task_audit_logs = [...existing, ...newLogs];

  await prisma.task.update({
    where: { id: taskId },
    data: {
      properties: { ...taskProperties },
    },
  });
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
