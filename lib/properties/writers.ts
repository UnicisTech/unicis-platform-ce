import type { TaskProperties, TeamProperties } from 'types/base';
import { asJsonObject } from './json';

export type TaskAuditPropertyKey =
  | 'task_audit_logs'
  | 'rpa_audit_logs'
  | 'tia_audit_logs'
  | 'pia_audit_logs'
  | 'rm_audit_logs'
  | 'csc_audit_logs';

type TaskAuditPropertyValues = Required<
  Pick<TaskProperties, TaskAuditPropertyKey>
>;

export const setTaskProperty = <Key extends keyof TaskProperties>(
  value: unknown,
  key: Key,
  propertyValue: NonNullable<TaskProperties[Key]>
): TaskProperties =>
  ({
    ...asJsonObject(value),
    [key]: propertyValue,
  }) as TaskProperties;

export const deleteTaskProperty = <Key extends keyof TaskProperties>(
  value: unknown,
  key: Key
): TaskProperties => {
  const properties = { ...asJsonObject(value) };
  delete properties[key as string];
  return properties as TaskProperties;
};

export const appendTaskAuditLogs = <Key extends TaskAuditPropertyKey>(
  value: unknown,
  key: Key,
  logs: TaskAuditPropertyValues[Key]
): TaskProperties => {
  const rawExisting = asJsonObject(value)[key];
  const existing = Array.isArray(rawExisting) ? rawExisting : [];
  const nextLogs = [...existing, ...logs] as TaskAuditPropertyValues[Key];
  return setTaskProperty(value, key, nextLogs);
};

export const setTeamProperty = <Key extends keyof TeamProperties>(
  value: unknown,
  key: Key,
  propertyValue: NonNullable<TeamProperties[Key]>
): TeamProperties =>
  ({
    ...asJsonObject(value),
    [key]: propertyValue,
  }) as TeamProperties;
