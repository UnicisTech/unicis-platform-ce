import { fields } from '@/lib/rpa';
import type { Session } from 'next-auth';
import { RpaProcedureInterface } from 'types';
import { RpaAuditLog, Diff } from 'types';
import {
  appendTaskAuditLogs,
  deleteTaskProperty,
  getRpaProcedure,
  setTaskProperty,
} from '@/lib/properties';
import { updateTaskPropertiesBySlugAndNumber } from 'models/properties';

export const deleteProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
}) => {
  const { taskNumber, slug, user } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const prevProcedure = getRpaProcedure(properties) ?? [];
      const taskProperties = deleteTaskProperty(properties, 'rpa_procedure');
      return appendTaskAuditLogs(
        taskProperties,
        'rpa_audit_logs',
        createAuditLogs(user, prevProcedure, [])
      );
    },
  });
};

export const saveProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  nextProcedure: RpaProcedureInterface;
}) => {
  const { user, taskNumber, slug, nextProcedure } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const prevProcedure = getRpaProcedure(properties) ?? [];
      const taskProperties = setTaskProperty(
        properties,
        'rpa_procedure',
        nextProcedure
      );
      return appendTaskAuditLogs(
        taskProperties,
        'rpa_audit_logs',
        createAuditLogs(user, prevProcedure, nextProcedure)
      );
    },
  });
};

const createAuditLogs = (
  user: Session['user'],
  prevProcedure: RpaProcedureInterface | [],
  nextProcedure: RpaProcedureInterface | []
): RpaAuditLog[] => {
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

  return newAuditItems;
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
