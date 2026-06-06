import { TaskRecurrenceStatus, TaskRecurrenceUnit } from '@/generated/enums';
import { ApiError } from '@/lib/errors';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { DEFAULT_TASK_PRIORITY, statuses, taskPriorities } from '@/lib/tasks';
import type { TaskPriority } from '@/lib/tasks';
import {
  isTaskRecurrenceEditableStatus,
  isTaskRecurrenceStatus,
  isTaskRecurrenceUnit,
  isValidTimeZone,
  type TaskRecurrenceEditableStatus,
} from '@/lib/tasks/recurrence';
import { z, type ZodType } from 'zod';

type RawTaskRecurrenceInput = {
  title?: unknown;
  description?: unknown;
  taskStatus?: unknown;
  priority?: unknown;
  unit?: unknown;
  interval?: unknown;
  startAt?: unknown;
  timezone?: unknown;
  dueDateOffsetDays?: unknown;
  status?: unknown;
};

export type TaskRecurrenceDataInput = {
  title: string;
  description: string;
  taskStatus: string;
  priority: TaskPriority;
  unit: TaskRecurrenceUnit;
  interval: number;
  startAt: Date;
  timezone: string;
  dueDateOffsetDays: number | null;
  status: TaskRecurrenceEditableStatus;
};

export type UpdateTaskRecurrenceInput = Partial<
  Omit<TaskRecurrenceDataInput, 'status'>
> & {
  status?: TaskRecurrenceEditableStatus;
};

const recurrenceInputError = {
  invalid_type_error: 'Invalid recurrence input',
  required_error: 'Invalid recurrence input',
};

const requiredTrimmedString = (field: string): ZodType<string> =>
  z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
      })
      .transform((value) => value.trim())
      .refine((value) => Boolean(value), `${field} is required`)
  ) as ZodType<string>;

const optionalTrimmedString = (field: string): ZodType<string | undefined> =>
  z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string({
        invalid_type_error: `${field} must be a string`,
      })
      .transform((value) => value.trim())
      .optional()
  ) as ZodType<string | undefined>;

const taskStatusSchema: ZodType<string> = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z
    .string(recurrenceInputError)
    .refine(
      (value) => statuses.includes(value),
      'taskStatus must be a valid task status'
    )
) as ZodType<string>;

const prioritySchema: ZodType<TaskPriority> = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.enum(taskPriorities, {
    invalid_type_error: 'priority must be a valid task priority',
    required_error: 'priority must be a valid task priority',
  })
) as ZodType<TaskPriority>;

const recurrenceUnitSchema: ZodType<TaskRecurrenceUnit> = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
  z
    .string({
      required_error: 'unit is required',
      invalid_type_error: 'unit must be a valid recurrence unit',
    })
    .refine(isTaskRecurrenceUnit, 'unit must be a valid recurrence unit')
    .transform((value) => value as TaskRecurrenceUnit)
) as ZodType<TaskRecurrenceUnit>;

const recurrenceStatusSchema: ZodType<TaskRecurrenceEditableStatus> =
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
    z
      .string({
        invalid_type_error: 'status must be a valid recurrence status',
        required_error: 'status must be a valid recurrence status',
      })
      .refine(
        isTaskRecurrenceStatus,
        'status must be a valid recurrence status'
      )
      .refine(
        isTaskRecurrenceEditableStatus,
        'Use DELETE to archive a recurrence'
      )
      .transform((value) => value as TaskRecurrenceEditableStatus)
  ) as ZodType<TaskRecurrenceEditableStatus>;

const dateSchema = (field: string, required = false) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      const date = value instanceof Date ? value : new Date(String(value));
      return Number.isNaN(date.getTime()) ? value : date;
    },
    (required
      ? z.date({
          required_error: `${field} is required`,
          invalid_type_error: `${field} must be a valid date`,
        })
      : z
          .date({
            invalid_type_error: `${field} must be a valid date`,
          })
          .optional()) as ZodType<Date | undefined>
  );

const positiveIntegerSchema = (field: string) => {
  const message = `${field} must be an integer greater than 0`;

  return z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      return typeof value === 'number' ? value : Number(value);
    },
    z
      .number({
        invalid_type_error: message,
      })
      .int(message)
      .min(1, message)
      .optional()
  ) as ZodType<number | undefined>;
};

const nonNegativeIntegerOrNullSchema = (
  field: string
): ZodType<number | null | undefined> => {
  const message = `${field} must be an integer greater than or equal to 0`;

  return z.preprocess(
    (value) => {
      if (value === undefined) {
        return undefined;
      }

      if (value === null || value === '') {
        return null;
      }

      return typeof value === 'number' ? value : Number(value);
    },
    z
      .union([
        z.number({ invalid_type_error: message }).int(message).min(0, message),
        z.null(),
      ])
      .optional()
  ) as ZodType<number | null | undefined>;
};

const timezoneSchema: ZodType<string> = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z
    .string({
      invalid_type_error: 'timezone must be a valid IANA timezone',
    })
    .refine(isValidTimeZone, 'timezone must be a valid IANA timezone')
) as ZodType<string>;

export const createTaskRecurrenceSchema: ZodType<TaskRecurrenceDataInput> =
  z.object({
    title: requiredTrimmedString('title'),
    description: optionalTrimmedString('description')
      .default('')
      .transform((value) => sanitizeRichText(value)),
    taskStatus: taskStatusSchema.optional().default('todo'),
    priority: prioritySchema.optional().default(DEFAULT_TASK_PRIORITY),
    unit: recurrenceUnitSchema,
    interval: positiveIntegerSchema('interval').default(1),
    startAt: dateSchema('startAt', true) as ZodType<Date>,
    timezone: timezoneSchema.optional().default('UTC'),
    dueDateOffsetDays:
      nonNegativeIntegerOrNullSchema('dueDateOffsetDays').default(null),
    status: recurrenceStatusSchema
      .optional()
      .default(TaskRecurrenceStatus.ACTIVE),
  }) as ZodType<TaskRecurrenceDataInput>;

export const updateTaskRecurrenceSchema = z.object({
  title: optionalTrimmedString('title'),
  description: optionalTrimmedString('description').transform((value) =>
    value === undefined ? undefined : sanitizeRichText(value)
  ),
  taskStatus: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  unit: recurrenceUnitSchema.optional(),
  interval: positiveIntegerSchema('interval').optional(),
  startAt: dateSchema('startAt').optional(),
  timezone: timezoneSchema.optional(),
  dueDateOffsetDays: nonNegativeIntegerOrNullSchema('dueDateOffsetDays'),
  status: recurrenceStatusSchema.optional(),
});

const validateTaskRecurrenceInput = <T>(schema: ZodType<T>, data: unknown) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues[0]?.message ?? 'Invalid recurrence input'
    );
  }

  return result.data;
};

const stripUndefined = <T extends Record<string, unknown>>(data: T) =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );

export const parseCreateTaskRecurrenceInput = (
  data: RawTaskRecurrenceInput
): TaskRecurrenceDataInput =>
  validateTaskRecurrenceInput(createTaskRecurrenceSchema, data);

export const parseUpdateTaskRecurrenceInput = (
  data: RawTaskRecurrenceInput
): UpdateTaskRecurrenceInput =>
  stripUndefined(
    validateTaskRecurrenceInput(updateTaskRecurrenceSchema, data)
  ) as UpdateTaskRecurrenceInput;
