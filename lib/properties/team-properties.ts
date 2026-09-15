import { ISO_VALUES } from 'types/csc';
import type { TeamProperties } from 'types/base';
import { asJsonObject, isJsonObject } from './json';
import { cscStatusesSchema, isoSchema } from './schemas';
import {
  parseKnownProperty,
  type ParsedProperties,
  type PropertyValidationIssue,
} from './validation';
import { z } from 'zod';

const knownTeamPropertySchemas = {
  csc_iso: isoSchema.array(),
  iap_categories: z.array(z.string()),
  iap_courses: z.array(z.unknown()),
} as const;

const cscStatusProperties = ISO_VALUES.map(
  (iso) => `csc_statuses_${iso}` as const
);

export const parseTeamProperties = (
  value: unknown
): ParsedProperties<TeamProperties> => {
  const raw = asJsonObject(value);
  const parsed = { ...raw };
  const issues: PropertyValidationIssue[] = [];

  if (!isJsonObject(value)) {
    issues.push({
      path: [],
      message: 'Team properties must be a JSON object',
    });
  }

  for (const [property, schema] of Object.entries(knownTeamPropertySchemas)) {
    parseKnownProperty({ property, schema, raw, parsed, issues });
  }

  for (const property of cscStatusProperties) {
    parseKnownProperty({
      property,
      schema: cscStatusesSchema,
      raw,
      parsed,
      issues,
    });
  }

  return {
    properties: parsed as TeamProperties & Record<string, unknown>,
    raw,
    issues,
  };
};
