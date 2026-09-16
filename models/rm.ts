import type { Session } from 'next-auth';
import type { RMProcedureInterface, AuditLog, Diff } from 'types';
import { fields } from '@/lib/rm';
import {
  appendTaskAuditLogs,
  deleteTaskProperty,
  getRmRisk,
  setTaskProperty,
} from '@/lib/properties';
import { updateTaskPropertiesBySlugAndNumber } from 'models/properties';

export const saveRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  nextRisk: RMProcedureInterface;
}) => {
  const { user, taskNumber, slug, nextRisk } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const prevRisk = getRmRisk(properties) ?? [];
      const taskProperties = setTaskProperty(properties, 'rm_risk', nextRisk);
      return appendTaskAuditLogs(
        taskProperties,
        'rm_audit_logs',
        createAuditLogs(user, prevRisk, nextRisk)
      );
    },
  });
};

export const deleteRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
}) => {
  const { taskNumber, slug, user } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const prevRisk = getRmRisk(properties) ?? [];
      const taskProperties = deleteTaskProperty(properties, 'rm_risk');
      return appendTaskAuditLogs(
        taskProperties,
        'rm_audit_logs',
        createAuditLogs(user, prevRisk, [])
      );
    },
  });
};

const createAuditLogs = (
  user: Session['user'],
  prevRisk: RMProcedureInterface | [],
  nextRisk: RMProcedureInterface | []
): AuditLog[] => {
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

  return newAuditItems;
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
