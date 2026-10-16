import { ISO_VALUES } from 'types/csc';
import type { TaskProperties } from 'types/base';
import type { ZodTypeAny } from 'zod';
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
  csc_controls: cscControlsSchema,
} as const;

const auditLogPropertySchemas = {
  task_audit_logs: auditLogSchema,
  rpa_audit_logs: auditLogSchema,
  tia_audit_logs: auditLogSchema,
  pia_audit_logs: auditLogSchema,
  rm_audit_logs: auditLogSchema,
  csc_audit_logs: cscAuditLogSchema,
} as const;

const parseAuditLogProperty = (
  property: string,
  schema: ZodTypeAny,
  raw: ReturnType<typeof asJsonObject>,
  parsed: ReturnType<typeof asJsonObject>,
  issues: PropertyValidationIssue[]
) => {
  const value = raw[property];
  if (typeof value === 'undefined') return;

  if (!Array.isArray(value)) {
    parseKnownProperty({
      property,
      schema: schema.array(),
      raw,
      parsed,
      issues,
    });
    return;
  }

  parsed[property] = value.flatMap((log, index) => {
    const result = schema.safeParse(log);
    if (result.success) return [result.data];

    issues.push(
      ...result.error.issues.map((issue) => ({
        path: [property, index, ...issue.path],
        message: issue.message,
      }))
    );
    return [];
  });
};

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

  for (const [property, schema] of Object.entries(auditLogPropertySchemas)) {
    parseAuditLogProperty(property, schema, raw, parsed, issues);
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
