import type { NextApiResponse } from 'next';
import { z, type ZodTypeAny } from 'zod';

export type ApiValidationIssue = {
  path: Array<string | number>;
  message: string;
};

export const validateApiInput = <Schema extends ZodTypeAny>(
  schema: Schema,
  input: unknown,
  res: NextApiResponse,
  message: string
): z.infer<Schema> | undefined => {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  const issues: ApiValidationIssue[] = result.error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));

  res.status(400).json({
    data: null,
    error: {
      message,
      issues,
    },
  });

  return undefined;
};

export const validateApiRequestBody = <Schema extends ZodTypeAny>(
  schema: Schema,
  body: unknown,
  res: NextApiResponse
): z.infer<Schema> | undefined =>
  validateApiInput(schema, body, res, 'Invalid request body');
