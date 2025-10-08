import { prisma } from '@/lib/prisma';
import { getTeam, incrementTaskIndex } from './team';

export const createTask = async (param: {
  authorId: string;
  teamId: string;
  title: string;
  status: string;
  duedate: string;
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
