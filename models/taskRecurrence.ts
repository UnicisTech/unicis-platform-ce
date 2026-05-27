import type { Prisma } from '@/generated/client';
import { TaskRecurrenceStatus } from '@/generated/enums';
import { prisma } from '@/lib/prisma';
import { getFirstFutureRecurrenceRunAt } from '@/lib/tasks/recurrence';
import type {
  TaskRecurrenceDataInput,
  UpdateTaskRecurrenceInput,
} from '@/lib/zod/task-recurrence';

export type CreateTaskRecurrenceInput = TaskRecurrenceDataInput & {
  authorId: string;
  teamId: string;
};

export {
  parseCreateTaskRecurrenceInput,
  parseUpdateTaskRecurrenceInput,
} from '@/lib/zod/task-recurrence';

export const getTeamTaskRecurrences = async (
  teamId: string,
  includeArchived = false
) =>
  await prisma.taskRecurrence.findMany({
    where: {
      teamId,
      ...(includeArchived
        ? {}
        : {
            status: {
              not: TaskRecurrenceStatus.ARCHIVED,
            },
          }),
    },
    orderBy: [{ status: 'asc' }, { nextRunAt: 'asc' }, { createdAt: 'desc' }],
  });

export const createTaskRecurrence = async (
  input: CreateTaskRecurrenceInput
) => {
  const { authorId, teamId, ...data } = input;

  return await prisma.taskRecurrence.create({
    data: {
      ...data,
      nextRunAt: data.startAt,
      authorId,
      teamId,
    },
  });
};

export const getTeamTaskRecurrenceById = async (
  teamId: string,
  id: string,
  includeArchived = false
) =>
  await prisma.taskRecurrence.findFirst({
    where: {
      id,
      teamId,
      ...(includeArchived
        ? {}
        : {
            status: {
              not: TaskRecurrenceStatus.ARCHIVED,
            },
          }),
    },
  });

export const updateTaskRecurrence = async ({
  data,
  id,
  teamId,
}: {
  data: UpdateTaskRecurrenceInput;
  id: string;
  teamId: string;
}) => {
  const existing = await getTeamTaskRecurrenceById(teamId, id);

  if (!existing) {
    return null;
  }

  const shouldResume =
    data.status === TaskRecurrenceStatus.ACTIVE &&
    existing.status === TaskRecurrenceStatus.PAUSED;
  const shouldRecalculateNextRunAt =
    data.startAt !== undefined ||
    data.unit !== undefined ||
    data.interval !== undefined ||
    shouldResume;
  const nextData: Prisma.TaskRecurrenceUpdateInput = { ...data };

  if (shouldRecalculateNextRunAt) {
    nextData.nextRunAt = getFirstFutureRecurrenceRunAt({
      startAt: data.startAt ?? existing.startAt,
      unit: data.unit ?? existing.unit,
      interval: data.interval ?? existing.interval,
    });
  }

  return await prisma.taskRecurrence.update({
    where: { id: existing.id },
    data: nextData,
  });
};

export const archiveTaskRecurrence = async (teamId: string, id: string) => {
  const existing = await getTeamTaskRecurrenceById(teamId, id);

  if (!existing) {
    return null;
  }

  return await prisma.taskRecurrence.update({
    where: { id: existing.id },
    data: {
      status: TaskRecurrenceStatus.ARCHIVED,
    },
  });
};
