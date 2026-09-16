import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { generateChangeLog, getDiff } from '@/lib/pia';
import type { AuditLog, PiaRisk } from 'types';
import {
  appendTaskAuditLogs,
  deleteTaskProperty,
  setTaskProperty,
} from '@/lib/properties';

export const saveRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevRisk: PiaRisk | [];
  nextRisk: PiaRisk;
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
  const taskProperties = setTaskProperty(task.properties, 'pia_risk', nextRisk);

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: taskProperties,
    },
  });

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevRisk,
    nextRisk,
  });

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
  const taskProperties = deleteTaskProperty(task.properties, 'pia_risk');

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: taskProperties,
    },
  });

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevRisk,
    nextRisk,
  });

  return updatedTask;
};

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: unknown;
  user: Session['user'];
  prevRisk: PiaRisk | [];
  nextRisk: PiaRisk | [];
}) => {
  const { taskId, taskProperties, user, prevRisk, nextRisk } = params;
  const newAuditItems: AuditLog[] = [];

  if (prevRisk.length === 0 && nextRisk.length !== 0) {
    newAuditItems.push(generateChangeLog(user, 'created', null));
  } else if (nextRisk.length === 0) {
    newAuditItems.push(generateChangeLog(user, 'deleted', null));
  } else {
    const diff = prevRisk.length === 0 ? [] : getDiff(prevRisk, nextRisk);
    newAuditItems.push(
      ...diff.map((changeLog) => {
        return generateChangeLog(user, 'updated', changeLog);
      })
    );
  }

  const updatedProperties = appendTaskAuditLogs(
    taskProperties,
    'pia_audit_logs',
    newAuditItems
  );

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      properties: updatedProperties,
    },
  });
};
