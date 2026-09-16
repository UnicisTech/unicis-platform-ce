import { getCscControlsProp } from '@/lib/csc';
import type { Session } from 'next-auth';
import type { CscAuditLog, ISO } from 'types';
import {
  appendTaskAuditLogs,
  getCscControls,
  setTaskProperty,
} from '@/lib/properties';
import { updateTaskPropertiesBySlugAndNumber } from 'models/properties';

export const addControlsToIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const cscControlsProp = getCscControlsProp(ISO);
      const existingControls = getCscControls(properties, ISO);
      const taskProperties = setTaskProperty(properties, cscControlsProp, [
        ...existingControls,
        ...controls,
      ]);
      const auditLogs = controls.map((control) =>
        createAuditLog(user, 'added', null, control)
      );

      return appendTaskAuditLogs(taskProperties, 'csc_audit_logs', auditLogs);
    },
  });
};

export const removeControlsFromIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const cscControlsProp = getCscControlsProp(ISO);
      const existingControls = getCscControls(properties, ISO);
      const nextControls = existingControls.filter(
        (item) => !controls.includes(item)
      );
      const taskProperties = setTaskProperty(
        properties,
        cscControlsProp,
        nextControls
      );
      const auditLogs = controls.map((control) =>
        createAuditLog(user, 'removed', null, control)
      );

      return appendTaskAuditLogs(taskProperties, 'csc_audit_logs', auditLogs);
    },
  });
};

export const changeControlInIssue = async (params: {
  user: Session['user'];
  taskNumber: number;
  slug: string;
  controls: string[];
  ISO: ISO;
}) => {
  const { taskNumber, slug, controls, user, ISO } = params;
  const [oldControl, newControl] = controls;

  return updateTaskPropertiesBySlugAndNumber({
    taskNumber,
    slug,
    mutate: (properties) => {
      const cscControlsProp = getCscControlsProp(ISO);
      const existingControls = getCscControls(properties, ISO);
      const nextControls = existingControls.map((control) =>
        control === oldControl ? newControl : control
      );
      const taskProperties = setTaskProperty(
        properties,
        cscControlsProp,
        nextControls
      );

      return appendTaskAuditLogs(taskProperties, 'csc_audit_logs', [
        createAuditLog(user, 'changed', oldControl, newControl),
      ]);
    },
  });
};

const createAuditLog = (
  user: Session['user'],
  event: string,
  prevValue: string | null,
  nextValue: string
): CscAuditLog =>
  ({
    actor: user,
    date: new Date().getTime(),
    event,
    diff: {
      prevValue,
      nextValue,
    },
  }) satisfies CscAuditLog;
