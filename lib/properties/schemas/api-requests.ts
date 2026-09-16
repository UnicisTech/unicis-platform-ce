import { z } from 'zod';
import { cscStatusSchema, isoSchema } from './csc';
import { piaRiskSchema } from './pia';
import { rmRiskSchema } from './rm';
import { rpaProcedureSchema } from './rpa';
import { tiaProcedureSchema } from './tia';

const emptyPreviousValueSchema = z.tuple([]);

export const taskMetadataWriteRequestSchema = z.object({
  data: z.record(z.unknown()).superRefine((data, context) => {
    if (Object.prototype.hasOwnProperty.call(data, 'properties')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['properties'],
        message:
          'Task properties must be updated through a dedicated module endpoint',
      });
    }
  }),
});

export const rpaWriteRequestSchema = z.object({
  prevProcedure: z.union([emptyPreviousValueSchema, rpaProcedureSchema]),
  nextProcedure: rpaProcedureSchema,
});

export const tiaWriteRequestSchema = z.object({
  prevProcedure: z.union([emptyPreviousValueSchema, tiaProcedureSchema]),
  nextProcedure: tiaProcedureSchema,
});

export const piaWriteRequestSchema = z.object({
  prevRisk: z.union([emptyPreviousValueSchema, piaRiskSchema]),
  nextRisk: piaRiskSchema,
});

export const rmWriteRequestSchema = z.object({
  prevRisk: z.union([emptyPreviousValueSchema, rmRiskSchema]),
  nextRisk: rmRiskSchema,
});

const cscRequestBaseSchema = z.object({
  ISO: isoSchema,
});

export const cscControlsWriteRequestSchema = z.discriminatedUnion('operation', [
  cscRequestBaseSchema.extend({
    operation: z.literal('add'),
    controls: z.array(z.string()).min(1),
  }),
  cscRequestBaseSchema.extend({
    operation: z.literal('remove'),
    controls: z.array(z.string()).min(1),
  }),
  cscRequestBaseSchema.extend({
    operation: z.literal('change'),
    controls: z.tuple([z.string(), z.string()]),
  }),
]);

export const cscStatusWriteRequestSchema = z.object({
  control: z.string().min(1),
  value: cscStatusSchema,
  framework: isoSchema,
});

export const cscIsoWriteRequestSchema = z.object({
  iso: z.array(isoSchema).min(1),
});
