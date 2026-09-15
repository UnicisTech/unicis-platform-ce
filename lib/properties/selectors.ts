import { getCscControlsProp, getCscStatusesProp } from '@/lib/csc';
import type { TaskModuleKey } from '@/lib/tasks';
import { ISO_VALUES } from 'types/csc';
import type {
  AuditLog,
  CscAuditLog,
  CscStatusesMap,
  ISO,
  PiaRisk,
  RMProcedureInterface,
  RpaAuditLog,
  RpaProcedureInterface,
  StoredTiaProcedureInterface,
  TiaAuditLog,
} from 'types';
import { parseTaskProperties } from './task-properties';
import { parseTeamProperties } from './team-properties';

type ParsedTaskProperties = ReturnType<
  typeof parseTaskProperties
>['properties'];

export const getRpaProcedure = (
  value: unknown
): RpaProcedureInterface | undefined =>
  parseTaskProperties(value).properties.rpa_procedure;

export const hasRpaProcedure = (value: unknown) =>
  typeof getRpaProcedure(value) !== 'undefined';

export const getTiaProcedure = (
  value: unknown
): StoredTiaProcedureInterface | undefined =>
  parseTaskProperties(value).properties.tia_procedure;

export const hasTiaProcedure = (value: unknown) =>
  typeof getTiaProcedure(value) !== 'undefined';

export const getPiaRisk = (value: unknown): PiaRisk | undefined =>
  parseTaskProperties(value).properties.pia_risk;

export const hasPiaRisk = (value: unknown) =>
  typeof getPiaRisk(value) !== 'undefined';

export const getRmRisk = (value: unknown): RMProcedureInterface | undefined =>
  parseTaskProperties(value).properties.rm_risk;

export const hasRmRisk = (value: unknown) =>
  typeof getRmRisk(value) !== 'undefined';

export const getCscControls = (value: unknown, iso: ISO): string[] =>
  parseTaskProperties(value).properties[getCscControlsProp(iso)] ?? [];

const getAllParsedCscControls = (
  properties: ParsedTaskProperties
): string[] => {
  const controls = ISO_VALUES.flatMap(
    (iso) => properties[getCscControlsProp(iso)] ?? []
  );

  // Keep legacy records readable until a separately approved data migration.
  controls.push(...(properties.csc_controls ?? []));

  return [...new Set(controls)];
};

export const getAllCscControls = (value: unknown): string[] =>
  getAllParsedCscControls(parseTaskProperties(value).properties);

export const hasCscControls = (value: unknown) =>
  getAllCscControls(value).length > 0;

export const getTaskModules = (value: unknown): TaskModuleKey[] => {
  const properties = parseTaskProperties(value).properties;
  const modules: TaskModuleKey[] = [];

  if (properties.rpa_procedure) modules.push('rpa_procedure');
  if (properties.tia_procedure) modules.push('tia_procedure');
  if (properties.pia_risk) modules.push('pia_risk');
  if (properties.rm_risk) modules.push('rm_risk');
  if (getAllParsedCscControls(properties).length > 0) {
    modules.push('csc_controls');
  }

  return modules;
};

export const getTaskAuditLogs = (value: unknown): AuditLog[] =>
  parseTaskProperties(value).properties.task_audit_logs ?? [];

export const getRpaAuditLogs = (value: unknown): RpaAuditLog[] =>
  parseTaskProperties(value).properties.rpa_audit_logs ?? [];

export const getTiaAuditLogs = (value: unknown): TiaAuditLog[] =>
  parseTaskProperties(value).properties.tia_audit_logs ?? [];

export const getPiaAuditLogs = (value: unknown): AuditLog[] =>
  parseTaskProperties(value).properties.pia_audit_logs ?? [];

export const getRmAuditLogs = (value: unknown): AuditLog[] =>
  parseTaskProperties(value).properties.rm_audit_logs ?? [];

export const getCscAuditLogs = (value: unknown): CscAuditLog[] =>
  parseTaskProperties(value).properties.csc_audit_logs ?? [];

export const getTeamCscIso = (value: unknown): ISO[] =>
  parseTeamProperties(value).properties.csc_iso ?? [];

export const getTeamCscStatuses = (value: unknown, iso: ISO): CscStatusesMap =>
  parseTeamProperties(value).properties[getCscStatusesProp(iso)] ?? {};
