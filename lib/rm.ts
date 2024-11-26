import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { RMProcedureInterface, TaskProperties } from "types";

export const saveRisk = async (params: {
    user: Session['user'];
    taskNumber: number;
    slug: string;
    prevRisk: RMProcedureInterface | [];
    nextRisk: RMProcedureInterface | [];
  }) => {
    const { user, taskNumber, slug, prevRisk, nextRisk } = params;
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
  
    const taskId = task.id;
    const taskProperties = task?.properties as TaskProperties;
    taskProperties.rm_risk = nextRisk;
  
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        properties: {
          ...taskProperties,
        },
      },
    });
  
    // await addAuditLogs({
    //   taskId,
    //   taskProperties,
    //   user,
    //   prevProcedure,
    //   nextProcedure,
    // });
  
    return updatedTask;
  };