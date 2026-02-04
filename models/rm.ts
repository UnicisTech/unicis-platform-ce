import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type {
  RMProcedureInterface,
  TaskProperties,
  AuditLog,
  Diff,
} from 'types';
import { fields } from '@/lib/rm';

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
  prevRisk: RMProcedureInterface | [];
  nextRisk: RMProcedureInterface | [];
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
  delete taskProperties.rm_risk;

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
  taskProperties: TaskProperties;
  user: Session['user'];
  prevRisk: RMProcedureInterface | [];
  nextRisk: RMProcedureInterface | [];
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

  let rm_audit_logs = taskProperties?.rm_audit_logs;

  if (typeof rm_audit_logs === 'undefined') {
    rm_audit_logs = [...newAuditItems];
  } else {
    rm_audit_logs = [...rm_audit_logs, ...newAuditItems];
  }

  taskProperties.rm_audit_logs = rm_audit_logs;

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
};

const generateChangeLog = (
  user: Session['user'],
  event: string,
  diffLog: Diff
): AuditLog => {
  return {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: diffLog,
  };
};

const reduceMultipleObj = (acc, x) => {
  for (const key in x) acc[key] = x?.[key];
  return acc;
};

export const getDiff = (o1, o2) => {
  const prev = o1.reduce(reduceMultipleObj, {});
  const next = o2.reduce(reduceMultipleObj, {});
  const diff: Diff[] = [];
  for (const key of fields) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      diff.push({
        field: key,
        prevValue: prev[key],
        nextValue: next[key],
      });
    }
  }

  return diff;
};
