import { prisma } from "@/lib/prisma";
import { getTeam, incrementTaskIndex, isTeamMember } from "./team";

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

export const updateTask = async (taskId: number, data: any) => {
  return await prisma.task.update({
    where: {
      id: taskId,
    },
    data: data,
  });
};

export const deleteTask = async (taskId: number) => {
  const deletedTask = await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
  return deletedTask;
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

export const addControlToIssue = async (params: {
  taskId: number;
  control: string;
}) => {
  const { taskId, control } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });

  const taskProperties = task?.properties as any;
  let csc_controls = taskProperties?.csc_controls;

  if (typeof csc_controls === "undefined") {
    csc_controls = [control];
  } else {
    csc_controls = [...csc_controls, control];
  }

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        csc_controls,
      },
    },
  });
};

export const removeControlFromIssue = async (params: {
  taskId: number;
  control: string;
}) => {
  const { taskId, control } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });

  const taskProperties = task?.properties as any;
  const csc_controls = taskProperties?.csc_controls as Array<string>;
  const new_csc_controls = csc_controls.filter((item) => item !== control);

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        csc_controls: new_csc_controls,
      },
    },
  });
};

export const isUserHasAccess = async (params: {
  taskId: number;
  userId: string;
}) => {
  const { taskId, userId } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      teamId: true,
    },
  });

  const teamId = task?.teamId as string;

  if (!(await isTeamMember(userId, teamId))) {
    return false;
  }

  return true;
};
