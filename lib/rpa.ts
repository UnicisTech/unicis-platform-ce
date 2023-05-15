import { controls } from "@/components/interfaces/CSC/config";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export const saveProcedure = async (params: {
  user: Session["user"];
  taskId: number;
  procedure: any[];
}) => {
  const { user, taskId, procedure } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });

  const taskProperties = task?.properties as any;
  taskProperties.rpa_procedure = procedure;

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: {
        ...taskProperties,
      },
    },
  });

  console.log("saveProcudure finishied in lib");
};
