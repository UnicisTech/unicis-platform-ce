import { TaskRecurrenceStatus, TaskRecurrenceUnit } from '@/generated/enums';
import {
  getFirstFutureRecurrenceRunAt,
  getNextRecurrenceRunAt,
  getTaskRecurrencePresetForRule,
  isTaskRecurrenceEditableStatus,
  recurrencePresetRules,
  taskRecurrenceEditableStatuses,
  taskRecurrencePresets,
} from '@/lib/tasks/recurrence';

const utc = (year: number, month: number, day: number, hour = 9, minute = 30) =>
  new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

describe('task recurrence helpers', () => {
  it('maps fixed presets to normalized unit and interval rules', () => {
    expect(taskRecurrencePresets).toEqual([
      'daily',
      'weekly',
      'monthly',
      'quarterly',
      'annual',
      'custom',
    ]);
    expect(recurrencePresetRules.daily).toEqual({
      unit: TaskRecurrenceUnit.DAY,
      interval: 1,
    });
    expect(recurrencePresetRules.quarterly).toEqual({
      unit: TaskRecurrenceUnit.MONTH,
      interval: 3,
    });
    expect(recurrencePresetRules.annual).toEqual({
      unit: TaskRecurrenceUnit.YEAR,
      interval: 1,
    });
    expect(
      getTaskRecurrencePresetForRule({
        unit: TaskRecurrenceUnit.MONTH,
        interval: 3,
      })
    ).toBe('quarterly');
    expect(
      getTaskRecurrencePresetForRule({
        unit: TaskRecurrenceUnit.WEEK,
        interval: 2,
      })
    ).toBe('custom');
    expect(taskRecurrenceEditableStatuses).toEqual([
      TaskRecurrenceStatus.ACTIVE,
      TaskRecurrenceStatus.PAUSED,
    ]);
    expect(isTaskRecurrenceEditableStatus(TaskRecurrenceStatus.ACTIVE)).toBe(
      true
    );
    expect(isTaskRecurrenceEditableStatus(TaskRecurrenceStatus.ARCHIVED)).toBe(
      false
    );
  });

  it('keeps the original anchor day for monthly recurrence', () => {
    const startAt = utc(2026, 1, 31);
    const februaryRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: startAt,
      unit: TaskRecurrenceUnit.MONTH,
      interval: 1,
    });
    const marchRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: februaryRunAt,
      unit: TaskRecurrenceUnit.MONTH,
      interval: 1,
    });
    const aprilRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: marchRunAt,
      unit: TaskRecurrenceUnit.MONTH,
      interval: 1,
    });

    expect(februaryRunAt.toISOString()).toBe('2026-02-28T09:30:00.000Z');
    expect(marchRunAt.toISOString()).toBe('2026-03-31T09:30:00.000Z');
    expect(aprilRunAt.toISOString()).toBe('2026-04-30T09:30:00.000Z');
  });

  it('supports quarterly recurrence as every three anchored months', () => {
    const startAt = utc(2026, 1, 31);
    const aprilRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: startAt,
      unit: TaskRecurrenceUnit.MONTH,
      interval: 3,
    });
    const julyRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: aprilRunAt,
      unit: TaskRecurrenceUnit.MONTH,
      interval: 3,
    });

    expect(aprilRunAt.toISOString()).toBe('2026-04-30T09:30:00.000Z');
    expect(julyRunAt.toISOString()).toBe('2026-07-31T09:30:00.000Z');
  });

  it('handles leap-day annual recurrence without permanent drift', () => {
    const startAt = utc(2024, 2, 29);
    const firstRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: startAt,
      unit: TaskRecurrenceUnit.YEAR,
      interval: 1,
    });
    const secondRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: firstRunAt,
      unit: TaskRecurrenceUnit.YEAR,
      interval: 1,
    });
    const thirdRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: secondRunAt,
      unit: TaskRecurrenceUnit.YEAR,
      interval: 1,
    });
    const fourthRunAt = getNextRecurrenceRunAt({
      startAt,
      currentRunAt: thirdRunAt,
      unit: TaskRecurrenceUnit.YEAR,
      interval: 1,
    });

    expect(firstRunAt.toISOString()).toBe('2025-02-28T09:30:00.000Z');
    expect(secondRunAt.toISOString()).toBe('2026-02-28T09:30:00.000Z');
    expect(thirdRunAt.toISOString()).toBe('2027-02-28T09:30:00.000Z');
    expect(fourthRunAt.toISOString()).toBe('2028-02-29T09:30:00.000Z');
  });

  it('calculates first future run from a past start date', () => {
    const nextRunAt = getFirstFutureRecurrenceRunAt({
      startAt: utc(2026, 1, 1),
      now: utc(2026, 1, 16),
      unit: TaskRecurrenceUnit.WEEK,
      interval: 1,
    });

    expect(nextRunAt.toISOString()).toBe('2026-01-22T09:30:00.000Z');
  });

  it('rejects invalid intervals', () => {
    expect(() =>
      getNextRecurrenceRunAt({
        startAt: utc(2026, 1, 1),
        currentRunAt: utc(2026, 1, 1),
        unit: TaskRecurrenceUnit.DAY,
        interval: 0,
      })
    ).toThrow('interval must be an integer greater than or equal to 1');
  });
});
