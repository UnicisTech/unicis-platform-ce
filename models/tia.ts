import { fields } from '@/lib/tia';
import type { Session } from 'next-auth';
import { StoredTiaProcedureInterface } from 'types';
import { TiaAuditLog, Diff } from 'types';
import {
  appendTaskAuditLogs,
  deleteTaskProperty,
  getTiaProcedure,
  setTaskProperty,
} from '@/lib/properties';
import { updateTaskPropertiesBySlugAndNumber } from 'models/properties';

export const deleteProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
}) => {
  const { user, taskNumber, slug } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const prevProcedure = getTiaProcedure(properties) ?? [];
      const taskProperties = deleteTaskProperty(properties, 'tia_procedure');
      return appendTaskAuditLogs(
        taskProperties,
        'tia_audit_logs',
        createAuditLogs(user, prevProcedure, [])
      );
    },
  });
};

export const saveProcedure = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  nextProcedure: StoredTiaProcedureInterface;
}) => {
  const { user, taskNumber, slug, nextProcedure } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const prevProcedure = getTiaProcedure(properties) ?? [];
      const taskProperties = setTaskProperty(
        properties,
        'tia_procedure',
        nextProcedure
      );
      return appendTaskAuditLogs(
        taskProperties,
        'tia_audit_logs',
        createAuditLogs(user, prevProcedure, nextProcedure)
      );
    },
  });
};

const createAuditLogs = (
  user: Session['user'],
  prevProcedure: StoredTiaProcedureInterface | [],
  nextProcedure: StoredTiaProcedureInterface | []
): TiaAuditLog[] => {
  const newAuditItems: TiaAuditLog[] = [];

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
): TiaAuditLog => {
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
