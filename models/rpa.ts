import { fields } from '@/lib/rpa';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { RpaProcedureInterface } from 'types';
import { RpaAuditLog, Diff } from 'types';
import {
  appendTaskAuditLogs,
  deleteTaskProperty,
  setTaskProperty,
} from '@/lib/properties';

export const deleteProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevProcedure: RpaProcedureInterface | [];
  nextProcedure: RpaProcedureInterface | [];
}) => {
  const { taskNumber, slug, user, prevProcedure, nextProcedure } = params;
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
  const taskProperties = deleteTaskProperty(task.properties, 'rpa_procedure');

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
    prevProcedure,
    nextProcedure,
  });

  return updatedTask;
};

export const saveProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  prevProcedure: RpaProcedureInterface | [];
  nextProcedure: RpaProcedureInterface;
}) => {
  const { user, taskNumber, slug, prevProcedure, nextProcedure } = params;
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
  const taskProperties = setTaskProperty(
    task.properties,
    'rpa_procedure',
    nextProcedure
  );

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
    prevProcedure,
    nextProcedure,
  });

  return updatedTask;
};

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: unknown;
  user: Session['user'];
  prevProcedure: RpaProcedureInterface | [];
  nextProcedure: RpaProcedureInterface | [];
}) => {
  const { taskId, taskProperties, user, prevProcedure, nextProcedure } = params;
  const newAuditItems: RpaAuditLog[] = [];

  if (prevProcedure.length === 0 && nextProcedure.length !== 0) {
    newAuditItems.push(generateChangeLog(user, 'created', null));
  } else if (nextProcedure.length === 0) {
    newAuditItems.push(generateChangeLog(user, 'deleted', null));
  } else {
    const diff =
      prevProcedure.length === 0 ? [] : getDiff(prevProcedure, nextProcedure);
    newAuditItems.push(
      ...diff.map((changeLog) => {
        return generateChangeLog(user, 'updated', changeLog);
      })
    );
  }

  const updatedProperties = appendTaskAuditLogs(
    taskProperties,
    'rpa_audit_logs',
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

export const addAuditLog = async (params: {
  taskId: number;
  user: Session['user'];
  event: string;
  prevValue: string | null;
  nextValue: string;
  taskProperties: unknown;
}) => {
  const { taskId, user, event, prevValue, nextValue, taskProperties } = params;

  const auditLog = {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: {
      prevValue: prevValue,
      nextValue: nextValue,
    },
  };

  const updatedProperties = appendTaskAuditLogs(
    taskProperties,
    'csc_audit_logs',
    [auditLog]
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

const generateChangeLog = (
  user: Session['user'],
  event: string,
  diffLog: Diff
): RpaAuditLog => {
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
