import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/rpa';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { RpaOption, RpaProcedureInterface } from 'types';
import { RpaAuditLog, RpaConfig, Diff, TaskProperties } from 'types';

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
  const taskProperties = task?.properties as TaskProperties;
  delete taskProperties.rpa_procedure;

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
  nextProcedure: RpaProcedureInterface | [];
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

  console.log('saveProcedure task', task);

  if (!task) {
    return null;
  }

  const taskId = task.id;
  const taskProperties = task?.properties as TaskProperties;
  taskProperties.rpa_procedure = nextProcedure;

  console.log('taskProperties updated in saveprocedure');

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

  console.log('updated task in saveprocedure', updatedTask);

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevProcedure,
    nextProcedure,
  });

  console.log('after addAuditLogs in saveprocedure');

  return updatedTask;
};

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: TaskProperties;
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

  let rpa_audit_logs = taskProperties?.rpa_audit_logs;

  if (typeof rpa_audit_logs === 'undefined') {
    rpa_audit_logs = [...newAuditItems];
  } else {
    rpa_audit_logs = [...rpa_audit_logs, ...newAuditItems];
  }

  taskProperties.rpa_audit_logs = rpa_audit_logs;

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

export const addAuditLog = async (params: {
  taskId: number;
  user: Session['user'];
  event: string;
  prevValue: string | null;
  nextValue: string;
  taskProperties: TaskProperties;
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

  let csc_audit_logs = taskProperties?.csc_audit_logs;

  if (typeof csc_audit_logs === 'undefined') {
    csc_audit_logs = [auditLog];
  } else {
    csc_audit_logs = [...csc_audit_logs, auditLog];
  }

  taskProperties.csc_audit_logs = csc_audit_logs;

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
  for (const [key, value] of Object.entries(fieldPropsMapping)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      let prevValue, nextValue;
      if (config[key as keyof RpaConfig] != null) {
        if (Array.isArray(prev[key]) || Array.isArray(next[key])) {
          prevValue = prev[key].map(
            ({ value }: RpaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
          nextValue = next[key].map(
            ({ value }: RpaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
        } else {
          prevValue = config[key as keyof RpaConfig]?.find(
            (option) => option.value === prev[key]?.value
          )?.label;
          nextValue = config[key as keyof RpaConfig]?.find(
            (option) => option.value === next[key]?.value
          )?.label;
        }
      } else {
        prevValue = prev[key];
        nextValue = next[key];
      }
      diff.push({
        field: value,
        prevValue: prevValue,
        nextValue: nextValue,
      });
    }
  }

  return diff;
};
