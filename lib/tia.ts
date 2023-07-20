import {
  config,
  fieldPropsMapping,
} from '@/components/defaultLanding/data/configs/tia';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { TiaOption, TiaProcedureInterface } from 'types';
import { ChangeLog, RpaConfig } from 'types';

export const deleteProcedure = async (params: {
  user: Session['user'];
  taskId: number;
  prevProcedure: TiaProcedureInterface | [];
  nextProcedure: TiaProcedureInterface | [];
}) => {
  const { taskId, user, prevProcedure, nextProcedure } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });
  const taskProperties = task?.properties as any;
  delete taskProperties.tia_procedure;

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

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevProcedure,
    nextProcedure,
  });
};

export const saveProcedure = async (params: {
  user: Session['user'];
  taskId: number;
  prevProcedure: TiaProcedureInterface | [];
  nextProcedure: TiaProcedureInterface | [];
}) => {
  const { user, taskId, prevProcedure, nextProcedure } = params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      properties: true,
    },
  });

  const taskProperties = task?.properties as any;
  taskProperties.tia_procedure = nextProcedure;

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

  await addAuditLogs({
    taskId,
    taskProperties,
    user,
    prevProcedure,
    nextProcedure,
  });
};

export const addAuditLogs = async (params: {
  taskId: number;
  taskProperties: any;
  user: Session['user'];
  prevProcedure: TiaProcedureInterface | [];
  nextProcedure: TiaProcedureInterface | [];
}) => {
  const { taskId, taskProperties, user, prevProcedure, nextProcedure } = params;
  const newAuditItems: ChangeLog[] = [];

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

  let tia_audit_logs = taskProperties?.tia_audit_logs;

  if (typeof tia_audit_logs === 'undefined') {
    tia_audit_logs = [...newAuditItems];
  } else {
    tia_audit_logs = [...tia_audit_logs, ...newAuditItems];
  }

  taskProperties.tia_audit_logs = tia_audit_logs;

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
  diffLog: any
): ChangeLog => {
  return {
    actor: user,
    date: new Date().getTime(),
    event: event,
    diff: diffLog,
  };
};

const reduceMultipleObj = (acc: any, x: any) => {
  for (const key in x) acc[key] = x?.[key];
  return acc;
};

export const getDiff = (o1: any, o2: any) => {
  const prev = o1.reduce(reduceMultipleObj, {});
  const next = o2.reduce(reduceMultipleObj, {});
  const diff: any[] = [];
  for (const [key, value] of Object.entries(fieldPropsMapping)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      let prevValue, nextValue;
      if (config[key as keyof RpaConfig] != null) {
        if (Array.isArray(prev[key]) || Array.isArray(next[key])) {
          prevValue = prev[key].map(
            ({ value }: TiaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
          nextValue = next[key].map(
            ({ value }: TiaOption) =>
              config[key as keyof RpaConfig]?.find(
                (option) => option.value === value
              )?.label
          );
        } else {
          prevValue = config[key as keyof RpaConfig]?.find(
            (option) =>
              option.value ===
              (typeof prev[key] === 'string' ? prev[key] : prev[key]?.value)
          )?.label;
          nextValue = config[key as keyof RpaConfig]?.find(
            (option) =>
              option.value ===
              (typeof next[key] === 'string' ? next[key] : next[key]?.value)
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
