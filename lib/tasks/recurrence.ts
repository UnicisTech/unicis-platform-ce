import { TaskRecurrenceStatus, TaskRecurrenceUnit } from '@/generated/enums';

export const taskRecurrencePresets = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annual',
  'custom',
] as const;

export type TaskRecurrencePreset = (typeof taskRecurrencePresets)[number];

export type TaskRecurrenceEditableStatus = Exclude<
  TaskRecurrenceStatus,
  'ARCHIVED'
>;

export type TaskRecurrenceRule = {
  unit: TaskRecurrenceUnit;
  interval: number;
};

export const recurrencePresetRules: Record<
  Exclude<TaskRecurrencePreset, 'custom'>,
  TaskRecurrenceRule
> = {
  daily: { unit: TaskRecurrenceUnit.DAY, interval: 1 },
  weekly: { unit: TaskRecurrenceUnit.WEEK, interval: 1 },
  monthly: { unit: TaskRecurrenceUnit.MONTH, interval: 1 },
  quarterly: { unit: TaskRecurrenceUnit.MONTH, interval: 3 },
  annual: { unit: TaskRecurrenceUnit.YEAR, interval: 1 },
};

export const taskRecurrenceUnits = Object.values(TaskRecurrenceUnit);
export const taskRecurrenceStatuses = Object.values(TaskRecurrenceStatus);
export const taskRecurrenceEditableStatuses = taskRecurrenceStatuses.filter(
  (status): status is TaskRecurrenceEditableStatus =>
    status !== TaskRecurrenceStatus.ARCHIVED
);

export const getTaskRecurrencePresetForRule = ({
  unit,
  interval,
}: TaskRecurrenceRule): TaskRecurrencePreset => {
  const entry = Object.entries(recurrencePresetRules).find(
    ([, rule]) => rule.unit === unit && rule.interval === interval
  );

  return (entry?.[0] as TaskRecurrencePreset | undefined) ?? 'custom';
};

export const isTaskRecurrenceUnit = (
  value: string
): value is TaskRecurrenceUnit =>
  taskRecurrenceUnits.includes(value as TaskRecurrenceUnit);

export const isTaskRecurrenceStatus = (
  value: string
): value is TaskRecurrenceStatus =>
  taskRecurrenceStatuses.includes(value as TaskRecurrenceStatus);

export const isTaskRecurrenceEditableStatus = (
  value: string
): value is TaskRecurrenceEditableStatus =>
  taskRecurrenceEditableStatuses.includes(
    value as TaskRecurrenceEditableStatus
  );

export const isValidTimeZone = (timezone: string) => {
  if (!timezone.trim()) {
    return false;
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

const assertValidDate = (value: Date, name: string) => {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw new Error(`${name} must be a valid Date`);
  }
};

const assertValidInterval = (interval: number) => {
  if (!Number.isInteger(interval) || interval < 1) {
    throw new Error('interval must be an integer greater than or equal to 1');
  }
};

const addUtcDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const getUtcDaysInMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

const buildUtcDateFromAnchor = ({
  anchor,
  year,
  monthIndex,
}: {
  anchor: Date;
  year: number;
  monthIndex: number;
}) => {
  const day = Math.min(
    anchor.getUTCDate(),
    getUtcDaysInMonth(year, monthIndex)
  );

  return new Date(
    Date.UTC(
      year,
      monthIndex,
      day,
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds()
    )
  );
};

const addAnchoredUtcMonths = ({
  anchor,
  occurrence,
  months,
}: {
  anchor: Date;
  occurrence: Date;
  months: number;
}) => {
  const monthNumber =
    occurrence.getUTCFullYear() * 12 + occurrence.getUTCMonth() + months;
  const year = Math.floor(monthNumber / 12);
  const monthIndex = monthNumber % 12;

  return buildUtcDateFromAnchor({ anchor, year, monthIndex });
};

const addAnchoredUtcYears = ({
  anchor,
  occurrence,
  years,
}: {
  anchor: Date;
  occurrence: Date;
  years: number;
}) =>
  buildUtcDateFromAnchor({
    anchor,
    year: occurrence.getUTCFullYear() + years,
    monthIndex: anchor.getUTCMonth(),
  });

export const getNextRecurrenceRunAt = ({
  startAt,
  currentRunAt,
  unit,
  interval,
}: {
  startAt: Date;
  currentRunAt: Date;
  unit: TaskRecurrenceUnit;
  interval: number;
}) => {
  assertValidDate(startAt, 'startAt');
  assertValidDate(currentRunAt, 'currentRunAt');
  assertValidInterval(interval);

  if (!isTaskRecurrenceUnit(unit)) {
    throw new Error('unit must be a valid task recurrence unit');
  }

  if (unit === TaskRecurrenceUnit.DAY) {
    return addUtcDays(currentRunAt, interval);
  }

  if (unit === TaskRecurrenceUnit.WEEK) {
    return addUtcDays(currentRunAt, interval * 7);
  }

  if (unit === TaskRecurrenceUnit.MONTH) {
    return addAnchoredUtcMonths({
      anchor: startAt,
      occurrence: currentRunAt,
      months: interval,
    });
  }

  return addAnchoredUtcYears({
    anchor: startAt,
    occurrence: currentRunAt,
    years: interval,
  });
};

export const getFirstFutureRecurrenceRunAt = ({
  startAt,
  unit,
  interval,
  now = new Date(),
}: {
  startAt: Date;
  unit: TaskRecurrenceUnit;
  interval: number;
  now?: Date;
}) => {
  assertValidDate(now, 'now');

  let nextRunAt = startAt;
  let guard = 0;

  while (nextRunAt <= now) {
    nextRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: nextRunAt,
      unit,
      interval,
    });

    guard++;
    if (guard > 10000) {
      throw new Error('Unable to calculate first future recurrence run date');
    }
  }

  return nextRunAt;
};
