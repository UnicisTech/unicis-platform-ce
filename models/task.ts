import { prisma } from '@/lib/prisma';
import { getTeam, incrementTaskIndex } from './team';
import type { Session } from 'next-auth';
import type { AuditLog, TaskProperties } from 'types';

export const createTask = async (param: {
  authorId: string;
  teamId: string;
  title: string;
  status: string;
  duedate: Date | null;
  description: string;
}) => {
  const { authorId, teamId, title, status, duedate, description } = param;
  const team = await getTeam({ id: teamId });
  const index = team.taskIndex;

  const task = await prisma.task.create({
    data: {
      authorId,
      taskNumber: index,
      teamId,
      title,
      status,
      duedate,
      description,
      properties: {},
    },
  });

  await incrementTaskIndex(teamId);

  return task;
};

export const updateTask = async (
  taskNumber: number,
  slug: string,
  data: any
) => {
  const taskToEdit = await prisma.task.findFirst({
    where: {
      taskNumber,
      team: {
        slug,
      },
    },
  });
  if (taskToEdit) {
    const editedTask = await prisma.task.update({
      where: {
        id: taskToEdit.id,
      },
      data: data,
    });
    return editedTask;
  } else {
    return null;
  }
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

const taskAuditFields = ['title', 'status', 'duedate', 'description'] as const;

export const addTaskAuditLogs = async (params: {
  taskId: number;
  user: Session['user'];
  prevTask: { title: string; status: string; duedate: any; description: string | null };
  nextTask: { title: string; status: string; duedate: any; description: string | null };
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
  });
  return tasks;
};
