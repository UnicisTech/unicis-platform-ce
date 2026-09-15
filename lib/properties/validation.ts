import type { ZodIssue, ZodTypeAny } from 'zod';
import type { JsonObject } from './json';

export type PropertyValidationIssue = {
  path: Array<string | number>;
  message: string;
};

export type ParsedProperties<T> = {
  properties: T & JsonObject;
  raw: JsonObject;
  issues: PropertyValidationIssue[];
};

export const toPropertyIssues = (
  property: string,
  issues: ZodIssue[]
): PropertyValidationIssue[] =>
  issues.map((issue) => ({
    path: [property, ...issue.path],
    message: issue.message,
  }));

export const parseKnownProperty = ({
  property,
  schema,
  raw,
  parsed,
  issues,
}: {
  property: string;
  schema: ZodTypeAny;
  raw: JsonObject;
  parsed: JsonObject;
  issues: PropertyValidationIssue[];
}) => {
  const value = raw[property];

  if (typeof value === 'undefined') {
    return;
  }

  const result = schema.safeParse(value);

  if (result.success) {
    parsed[property] = result.data;
    return;
  }

  delete parsed[property];
  issues.push(...toPropertyIssues(property, result.error.issues));
};
