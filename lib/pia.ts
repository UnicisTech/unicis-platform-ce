import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { Task } from '@prisma/client';
import { riskSecurityPoints, riskProbabilityPoints } from '@/components/defaultLanding/data/configs/pia';
import type { PiaRisk, TaskProperties } from "types";

export const saveRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: PiaRisk | [];
  nextRisk: PiaRisk | [];
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
  taskProperties.pia_risk = nextRisk;

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

export const deleteRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: PiaRisk | [];
  nextRisk: PiaRisk | [];
}) => {
  const { taskNumber, slug, user, prevRisk, nextRisk } = params;
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
  delete taskProperties.pia_risk;

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

export const computeRiskMap = (
  tasks: Task[],
  riskKey: number,
  keys: { security: string; probability: string }
): Map<string, number> | null => {
  if (!tasks) return null;

  const riskMap = new Map<string, number>();

  tasks
      .filter(task => (task.properties as TaskProperties)?.pia_risk)
      .map(task => (task.properties as TaskProperties)?.pia_risk)
      .forEach((risk) => {
          const security = risk?.[riskKey]?.[keys.security];
          const probability = risk?.[riskKey]?.[keys.probability];

          if (!security || !probability) return;

          const x = riskSecurityPoints[security];
          const y = riskProbabilityPoints[probability];
          const key = `${x},${y}`;

          riskMap.set(key, (riskMap.get(key) || 0) + 1);
      });

  return riskMap;
};