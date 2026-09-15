import { Role } from '@/generated/browser';
import { z, type ZodType } from 'zod';
import type { AuditLog, Diff } from 'types/base';
import type { CscAuditLog } from 'types/csc';

const auditActorSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    roles: z.array(
      z.object({
        teamId: z.string(),
        role: z.nativeEnum(Role),
      })
    ),
  })
  .passthrough();

const diffValueSchema = z.union([z.string(), z.array(z.string())]);

export const auditDiffSchema: ZodType<Diff> = z.union([
  z
    .object({
      field: z.string(),
      prevValue: diffValueSchema.optional(),
      nextValue: diffValueSchema,
    })
    .passthrough(),
  z.null(),
]);

export const auditLogSchema: ZodType<AuditLog> = z
  .object({
    actor: auditActorSchema,
    date: z.number(),
    event: z.string(),
    diff: auditDiffSchema,
  })
  .passthrough();

export const cscAuditLogSchema: ZodType<CscAuditLog> = z
  .object({
    actor: auditActorSchema,
    date: z.number(),
    event: z.string(),
    diff: z
      .object({
        prevValue: z.string().nullable(),
        nextValue: z.string(),
      })
      .passthrough(),
  })
  .passthrough();
