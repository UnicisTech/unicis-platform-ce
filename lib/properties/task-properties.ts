import { ISO_VALUES } from 'types/csc';
import type { TaskProperties } from 'types/base';
import { asJsonObject, isJsonObject } from './json';
import {
  auditLogSchema,
  cscAuditLogSchema,
  cscControlsSchema,
  piaRiskSchema,
  rmRiskSchema,
  rpaProcedureSchema,
  tiaProcedureSchema,
} from './schemas';
import {
  parseKnownProperty,
  type ParsedProperties,
  type PropertyValidationIssue,
} from './validation';

const knownTaskPropertySchemas = {
  rpa_procedure: rpaProcedureSchema,
  tia_procedure: tiaProcedureSchema,
  pia_risk: piaRiskSchema,
  rm_risk: rmRiskSchema,
  task_audit_logs: auditLogSchema.array(),
  rpa_audit_logs: auditLogSchema.array(),
  tia_audit_logs: auditLogSchema.array(),
  pia_audit_logs: auditLogSchema.array(),
  rm_audit_logs: auditLogSchema.array(),
  csc_audit_logs: cscAuditLogSchema.array(),
  csc_controls: cscControlsSchema,
} as const;

const cscControlProperties = ISO_VALUES.map(
  (iso) => `csc_controls_${iso}` as const
);

export const parseTaskProperties = (
  value: unknown
): ParsedProperties<TaskProperties> => {
  const raw = asJsonObject(value);
  const parsed = { ...raw };
  const issues: PropertyValidationIssue[] = [];

  if (!isJsonObject(value)) {
    issues.push({
      path: [],
      message: 'Task properties must be a JSON object',
    });
  }

  for (const [property, schema] of Object.entries(knownTaskPropertySchemas)) {
    parseKnownProperty({ property, schema, raw, parsed, issues });
  }

  for (const property of cscControlProperties) {
    parseKnownProperty({
      property,
      schema: cscControlsSchema,
      raw,
      parsed,
      issues,
    });
  }

  return {
    properties: parsed as TaskProperties & Record<string, unknown>,
    raw,
    issues,
  };
};
