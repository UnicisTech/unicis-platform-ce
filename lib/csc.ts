import { controls } from "@/components/interfaces/CSC/config";
import { prisma } from "@/lib/prisma";

export const addControlsToIssue = async (params: {
  taskId: number;
  controls: string[];
}) => {
  const { taskId, controls } = params;
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
    csc_controls = [...controls];
  } else {
    csc_controls = [...csc_controls, ...controls];
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

export const removeControlsFromIssue = async (params: {
  taskId: number;
  controls: string[];
}) => {
  const { taskId, controls } = params;
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
  const new_csc_controls = csc_controls.filter(
    (item) => !controls.includes(item)
  );

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
