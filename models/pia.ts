import type { Session } from 'next-auth';
import { generateChangeLog, getDiff } from '@/lib/pia';
import type { AuditLog, PiaRisk } from 'types';
import {
  appendTaskAuditLogs,
  deleteTaskProperty,
  getPiaRisk,
  setTaskProperty,
} from '@/lib/properties';
import { updateTaskPropertiesBySlugAndNumber } from 'models/properties';

export const saveRisk = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  nextRisk: PiaRisk;
}) => {
  const { user, taskNumber, slug, nextRisk } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const prevRisk = getPiaRisk(properties) ?? [];
      const taskProperties = setTaskProperty(properties, 'pia_risk', nextRisk);
      return appendTaskAuditLogs(
        taskProperties,
        'pia_audit_logs',
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
      const prevRisk = getPiaRisk(properties) ?? [];
      const taskProperties = deleteTaskProperty(properties, 'pia_risk');
      return appendTaskAuditLogs(
        taskProperties,
        'pia_audit_logs',
        createAuditLogs(user, prevRisk, [])
      );
    },
  });
};

const createAuditLogs = (
  user: Session['user'],
  prevRisk: PiaRisk | [],
  nextRisk: PiaRisk | []
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
